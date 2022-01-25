import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
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
import { TournamentIsNotOngoing } from './guards/tournament-is-not-ongoing.guard';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get(`/:tournamentId/admins/available`)
    @Roles(Role.Organizer)
    async getAvailableAdmins(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Req() { user }: RequestWithUser,
    ) {
        return this.tournamentsService.getAvailableAdmins(tournamentId, user);
    }

    @Get(`/:tournamentId/standings`)
    @Public()
    async getTournamentStandings(@Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.getStandingsByTournament(tournamentId);
    }

    @Get(`/:tournamentId/admins`)
    @Public()
    async getAdmins(@Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.getAdmins(tournamentId);
    }

    @Get(`/:tournamentId/matches`)
    @Public()
    async getTournamentMatches(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Query() { status }: MatchQuery,
    ) {
        return this.tournamentsService.getMatchesByTournament(tournamentId, status);
    }

    @Get(`/:tournamentId/teams`)
    @Public()
    async getTournamentTeams(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Query() { status }: ParticipatingTeamQuery,
    ) {
        return this.tournamentsService.getTeamsByTournament(tournamentId, status);
    }

    @Get(`/:tournamentId`)
    @Public()
    async getById(@Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.getById(tournamentId);
    }

    @Get()
    @Public()
    async getTournamentsFiltered(@Query() queryParams: TournamentQueryDto) {
        return this.tournamentsService.getTournamentsFiltered(queryParams);
    }

    @Post()
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    async create(@Body() body: CreateTournamentDto, @Req() { user }: RequestWithUser) {
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

    @Post(`:tournamentId/avatars`)
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
    async uploadFile(@UploadedFile() image: Express.Multer.File, @Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.setTournamentProfile(tournamentId, image);
    }

    @Post(`:tournamentId/backgrounds`)
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
    async uploadBackground(@UploadedFile() image: Express.Multer.File, @Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.setTournamentBackground(tournamentId, image);
    }

    @Post(`/:tournamentId/admins/:adminId`)
    @Roles(Role.Organizer)
    async addAdmin(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Param(`adminId`, ParseIntPipe) adminId: number
    ) {
        return this.tournamentsService.addAdmin(tournamentId, adminId);
    }

    @Post(`/:tournamentId/prizes`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async addPrize(
        @Param(`tournamentId`, ParseIntPipe) id: number,
        @Body() body: CreatePrizeDto
    ) {
        return this.tournamentsService.addPrize(id, body);
    }

    @Post(`/:tournamentId/teams/:teamId`)
    @UseGuards(UserIsCaptainGuard, MemberIsNotSuspended)
    async addTeam(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() body: CreateParticipatingTeamDto
    ) {
        return this.tournamentsService.addTeam(tournamentId, teamId, body);
    }

    @Post(`/:tournamentId/teams/:teamId/check-in`)
    @UseGuards(UserIsCaptainGuard, MemberIsNotSuspended)
    async checkIn(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
    ) {
        return this.tournamentsService.changeStatus(
            tournamentId, teamId, ParticipationStatus.CheckedIn
        );
    }

    @Patch(`/:tournamentId/teams/:teamId`)
    @Roles(Role.Organizer, Role.TournamentAdmin)
    @UseGuards(UserIsTournamentAdmin)
    async verifyTeam(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() { status }: VerifyTeamDto,
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, status);
    }

    @Patch(`/:tournamentId/prizes`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async updatePrize(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Body() body: UpdatePrizeDto
    ) {
        return this.tournamentsService.updatePrize(tournamentId, body);
    }

    @Patch(`/:tournamentId`)
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    @UseGuards(UserIsOrganizer)
    async update(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Body() body: UpdateTournamentDto
    ) {
        return this.tournamentsService.update(tournamentId, body);
    }

    @Delete(`/:tournamentId`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer, TournamentIsNotOngoing)
    async remove(@Param(`tournamentId`, ParseIntPipe) tournamentId: number) {
        return this.tournamentsService.remove(tournamentId);
    }

    @Delete(`/:tournamentId/admins/:userId`)
    @Roles(Role.Organizer)
    @UseGuards(UserIsOrganizer)
    async removeAdmin(
        @Param(`tournamentId`, ParseIntPipe) tournamentId: number,
        @Param(`userId`, ParseIntPipe) userId: number
    ) {
        return this.tournamentsService.removeAdmin(tournamentId, userId);
    }
}