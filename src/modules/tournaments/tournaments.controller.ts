import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards, UsePipes, } from '@nestjs/common';
import { Public } from 'src/roles/public.decorator';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { VerifyTeamDto } from './dto/verify-team.dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ParticipatingTeamQuery } from './dto/get-participating-team.dto';
import { TournamentQueryDto } from './dto/get-tournaments-dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';
import { ParticipationStatus } from '../teams/participation-status';
import { UserIsCaptainGuard } from '../teams/guards/user-is-captain.guard';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get(`/:id/admins/available`)
    @Roles(Role.Organizer)
    async getAvailableAdmins(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser
    ) {
        return this.tournamentsService.getAvailableAdmins(id, user);
    }

    @Get(`/:id/admins`)
    @Roles(Role.Organizer)
    async getAdmins(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.getAdmins(id);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getMatchesByTournament(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: MatchQuery
    ) {
        return this.tournamentsService.getMatchesByTournament(id, status);
    }

    @Get(`/:id/teams`)
    @Roles(Role.Organizer)
    async getTeamsByTournament(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: ParticipatingTeamQuery
    ) {
        return this.tournamentsService.getTeamsByTournament(id, status);
    }

    @Get(`/:id`)
    @Public()
    async getById(@Param(`id`) id: string) {
        return this.tournamentsService.getById(Number(id));
    }

    @Get()
    @Public()
    async getTournamentsFiltered(@Query() queryParams: TournamentQueryDto) {
        return this.tournamentsService.getTournamentsFiltered(queryParams);
    }

    @Post()
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    async create(
        @Body() body: CreateTournamentDto,
        @Req() { user }: RequestWithUser
    ) {
        return this.tournamentsService.create(body, user);
    }

    @Post(`/:id/admins`)
    @Roles(Role.Organizer)
    async addAdmin(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: CreateAdminDto
    ) {
        return this.tournamentsService.addAdmin(id, body);
    }

    @Post(`/:id/prizes`)
    @Roles(Role.Organizer)
    async addPrize(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: CreatePrizeDto
    ) {
        return this.tournamentsService.addPrize(id, body);
    }

    @Post(`/:id/teams`)
    @UseGuards(UserIsCaptainGuard)
    async addTeam(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: CreateParticipatingTeamDto
    ) {
        return this.tournamentsService.addTeam(id, body);
    }

    @Post(`/:id/teams/:teamId`)
    @UseGuards(UserIsCaptainGuard)
    async checkIn(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, ParticipationStatus.CheckedIn);
    }

    @Patch(`/:id/teams/:teamId`)
    @Roles(Role.Organizer, Role.TournamentAdmin)
    async verifyTeam(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() { status }: VerifyTeamDto
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, status);
    }

    @Patch(`/:id`)
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    async update(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: UpdateTournamentDto
    ) {
        return this.tournamentsService.update(id, body);
    }

    @Delete(`/:id`)
    @Roles(Role.Organizer)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.remove(id);
    }

    // TODO
    @Delete(`/:id/admins/:adminId`)
    @Roles(Role.Organizer)
    async removeAdmin(
        @Param(`id`, ParseIntPipe) id: number,
        @Param(`adminId`, ParseIntPipe) adminId: number
    ) {
        return `todo`;
    }
}
