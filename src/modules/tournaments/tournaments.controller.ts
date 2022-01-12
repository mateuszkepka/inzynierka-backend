import {
    BadRequestException,
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
    UploadedFile,
    UseGuards,
    UseInterceptors,
    UsePipes,
} from '@nestjs/common';
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
import { ParticipationStatus } from '../teams/dto/participation-status';
import { UserIsCaptainGuard } from '../teams/guards/user-is-captain.guard';
import { DateValidationPipe } from 'src/pipes/date-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/config/tournament-profile-upload.utils';
import { UploadTeamTournamentGuard } from './guards/upload-tournament-images-guard';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) {}

    @Get(`/test`)
    async test() {
        return this.tournamentsService.test();
    }

    @Get(`/:id/admins/available`)
    @Roles(Role.Organizer)
    async getAvailableAdmins(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
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
        @Query() { status }: MatchQuery,
    ) {
        return this.tournamentsService.getMatchesByTournament(id, status);
    }

    @Get(`/:id/teams`)
    @Public()
    @Roles(Role.Organizer)
    async getTournamentTeams(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: ParticipatingTeamQuery,
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
    async create(@Body() body: CreateTournamentDto, @Req() { user }: RequestWithUser) {
        return this.tournamentsService.create(body, user);
    }

    @Post(`/upload-tournament-image/:id`)
    @UseGuards(UploadTeamTournamentGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/tournamentProfileImages`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 2000000 },
        }),
    )
    async uploadedFile(
        @UploadedFile() image,
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
    ) {
        if (!image) {
            throw new BadRequestException(
                `invalid file provided, allowed formats jpg/png/jpng and max size 2mb`,
            );
        }
        return this.tournamentsService.setTournamentProfile(id, image, user);
    }

    @Post(`/upload-tournament-background/:id`)
    @UseGuards(UploadTeamTournamentGuard)
    @UseInterceptors(
        FileInterceptor(`image`, {
            storage: diskStorage({
                destination: `./uploads/tournamentProfileBackgrounds`,
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
            limits: { fileSize: 4000000 },
        }),
    )
    async uploadedBackground(
        @UploadedFile() image,
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser,
    ) {
        if (!image) {
            throw new BadRequestException(
                `invalid file provided, allowed formats jpg/png/jpng and max size 4mb`,
            );
        }
        return this.tournamentsService.setTournamentBackground(id, image, user);
    }
    @Post(`/:id/admins`)
    @Roles(Role.Organizer)
    async addAdmin(@Param(`id`, ParseIntPipe) id: number, @Body() body: CreateAdminDto) {
        return this.tournamentsService.addAdmin(id, body);
    }

    @Post(`/:id/prizes`)
    @Roles(Role.Organizer)
    async addPrize(@Param(`id`, ParseIntPipe) id: number, @Body() body: CreatePrizeDto) {
        return this.tournamentsService.addPrize(id, body);
    }

    @Post(`/:id/teams`)
    @UseGuards(UserIsCaptainGuard)
    async addTeam(@Param(`id`, ParseIntPipe) id: number, @Body() body: CreateParticipatingTeamDto) {
        return this.tournamentsService.addTeam(id, body);
    }

    @Post(`/:id/teams/:teamId`)
    @UseGuards(UserIsCaptainGuard)
    async checkIn(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
    ) {
        return this.tournamentsService.changeStatus(
            tournamentId,
            teamId,
            ParticipationStatus.CheckedIn,
        );
    }

    @Patch(`/:id/teams/:teamId`)
    @Roles(Role.Organizer, Role.TournamentAdmin)
    async verifyTeam(
        @Param(`id`, ParseIntPipe) tournamentId: number,
        @Param(`teamId`, ParseIntPipe) teamId: number,
        @Body() { status }: VerifyTeamDto,
    ) {
        return this.tournamentsService.changeStatus(tournamentId, teamId, status);
    }

    @Patch(`/:id`)
    @Roles(Role.Organizer)
    @UsePipes(DateValidationPipe)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateTournamentDto) {
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
        @Param(`adminId`, ParseIntPipe) adminId: number,
    ) {
        return `todo`;
    }
}
