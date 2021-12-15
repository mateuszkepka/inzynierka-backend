import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { Public } from 'src/roles/public.decorator';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptTeamDto } from './dto/accept-team-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { MatchStatusQuery } from './dto/get-matches.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get(`/:id/admins`)
    @Roles(Role.Organizer)
    async getAdmins(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.getAdmins(id, true);
    }

    @Get(`/:id/teams`)
    @Roles(Role.Organizer)
    async getTeamsFiltered(@Param(`id`, ParseIntPipe) id: number, @Query('approved') approved: string) {
        return this.tournamentsService.getTeamsFiltered(id, approved);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getMatchesFiltered(@Param(`id`, ParseIntPipe) id: number, @Query() status: MatchStatusQuery) {
        return this.tournamentsService.getMatchesFiltered(id, status);
    }

    @Get(`/:id`)
    @Public()
    async getById(@Param(`id`) id: string) {
        return this.tournamentsService.getById(Number(id));
    }

    @Get()
    @Public()
    async getAll() {
        return this.tournamentsService.getAllTournaments();
    }

    @Post()
    @Roles(Role.Organizer)
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
    // TODO GUARD FOR A TEAM'S CAPTAIN
    async addTeam(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: CreateParticipatingTeamDto
    ) {
        return this.tournamentsService.addTeam(id, body);
    }

    @Patch(`/:id`)
    @Roles(Role.Organizer)
    async update(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: UpdateTournamentDto
    ) {
        return this.tournamentsService.update(id, body);
    }

    @Patch(`/:id/teams/:teamId`)
    @Roles(Role.Organizer, Role.TournamentAdmin)
    async verifyTeam(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() body: AcceptTeamDto
    ) {
        return this.tournamentsService.verifyTeam(tournamentId, teamId, body);
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
