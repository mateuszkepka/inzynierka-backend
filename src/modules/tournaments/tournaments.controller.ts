import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, } from '@nestjs/common';
import { Public } from 'src/roles/public.decorator';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { VerifyTeamDto } from './dto/verify-team.dto';
import { CreateParticipatingTeamDto } from './dto/create-participating-team.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ParticipatingTeamQuery } from './dto/get-participating-team.dto';
import { TournamentQueryDto } from './dto/get-tournaments-dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';
import { ParticipationStatus } from '../teams/dto/participation-status';
import { UserIsCaptainGuard } from '../teams/guards/user-is-captain.guard';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';
import { UserIsTournamentAdmin } from './guards/user-is-tournament-admin.guard';
import { MemberIsNotSuspended } from './guards/member-is-not-suspended.guard';
import { UserIsOrganizer } from './guards/user-is-organizer.guard';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/utils/uploads-util';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get(`/test`)
    async test() {
        return this.tournamentsService.test();
    }

    @Get(`/:id/admins/available`)
    @Roles(Role.Organizer)
    async getAvailableAdmins(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser
    ) {
        return this.tournamentsService.getAvailableAdmins(id, user);
    }

    @Get(`/:id/standings`)
    @Roles(Role.Organizer)
    async getTournamentStandings(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.getStandingsByTournament(id);
    }

    @Get(`/:id/admins`)
    @Roles(Role.Organizer)
    async getAdmins(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.getAdmins(id);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getTournamentMatches(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: MatchQuery
    ) {
        return this.tournamentsService.getMatchesByTournament(id, status);
    }

    @Get(`/:id/teams`)
    @Public()
    @Roles(Role.Organizer)
    async getTournamentTeams(
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

    @Get(`avatars/:imgpath`)
    @Public()
    seeUploadedProfile(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/tournaments/avatars` });
    }

    @Get(`backgrounds/:imgpath`)
    @Public()
    seeUploadedBackground(@Param(`imgpath`) image: Express.Multer.File, @Res() res) {
        return res.sendFile(image, { root: `./uploads/tournaments/backgrounds` });
    }

    @Post(`:id/avatars`)
    @UseGuards(UserIsOrganizer)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/tournaments/avatars`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 2000000 },
        }),
    )
    async uploadedFile(
        @UploadedFile() image: Express.Multer.File,
        @Param(`id`, ParseIntPipe) id: number,
    ) {
        return this.tournamentsService.setTournamentProfile(id, image);
    }

    @Post(`:id/backgrounds`)
    @UseGuards(UserIsOrganizer)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/tournaments/backgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async uploadedBackground(
        @UploadedFile() image: Express.Multer.File,
        @Param(`id`, ParseIntPipe) id: number,
    ) {
        return this.tournamentsService.setTournamentBackground(id, image);
    }

    @Post(`/:id/admins/:adminId`)
    @Roles(Role.Organizer)
    async addAdmin(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`adminId`, ParseIntPipe) adminId: number
    ) {
        return this.tournamentsService.addAdmin(tournamentId, adminId);
    }

    @Post(`/:id/prizes`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async addPrize(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: CreatePrizeDto
    ) {
        return this.tournamentsService.addPrize(id, body);
    }

    @Post(`/:id/teams/:teamId`)
    @UseGuards(UserIsCaptainGuard, MemberIsNotSuspended)
    async addTeam(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() body: CreateParticipatingTeamDto
    ) {
        return this.tournamentsService.addTeam(tournamentId, teamId, body);
    }

    @Post(`/:id/teams/:teamId`)
    @UseGuards(UserIsCaptainGuard, MemberIsNotSuspended)
    async checkIn(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, ParticipationStatus.CheckedIn);
    }

    @Patch(`/:id/teams/:teamId`)
    @Roles(Role.Organizer, Role.TournamentAdmin)
    @UseGuards(UserIsTournamentAdmin)
    async verifyTeam(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() { status }: VerifyTeamDto
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, status);
    }

    @Patch(`/:id/prizes`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async updatePrize(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: UpdatePrizeDto
    ) {
        return this.tournamentsService.updatePrize(id, body);
    }

    @Patch(`/:id`)
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    @UseGuards(UserIsOrganizer)
    async update(
        @Param(`id`, ParseIntPipe) id: number,
        @Body() body: UpdateTournamentDto
    ) {
        return this.tournamentsService.update(id, body);
    }

    @Delete(`/:id`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.tournamentsService.remove(id);
    }

    @Delete(`/:id/admins/:adminId`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async removeAdmin(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`adminId`, ParseIntPipe) adminId: number
    ) {
        return this.tournamentsService.removeAdmin(tournamentId, adminId);
    }
}