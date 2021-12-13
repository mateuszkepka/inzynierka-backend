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
import { CreateParticipatingTeamDto } from './dto/create-participatingTeam.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@Controller(`tournaments`)
@Roles(Role.Player)
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) {}

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
    async create(@Body() tournamentData: CreateTournamentDto, @Req() request: RequestWithUser) {
        return this.tournamentsService.create(tournamentData, request);
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
    // TODO GUARD FOR A TEAM'S CAPTAIN
    async addTeam(@Body() participatingTeamData: CreateParticipatingTeamDto) {
        return this.tournamentsService.addTeam(participatingTeamData);
    }

    @Patch(`/:id`)
    @Roles(Role.Organizer)
    updateTournament(@Param(`id`) id: string, @Body() body: UpdateTournamentDto) {
        return this.tournamentsService.update(Number(id), body);
    }

    @Patch(`/:id/teams`)
    // TODO TOURNAMENT ADMIN LOGIC
    @Roles(Role.Organizer, Role.TournamentAdmin)
    async acceptTeam(@Body() acceptdata: AcceptTeamDto, @Req() { user }: RequestWithUser) {
        return this.tournamentsService.acceptTeam(acceptdata, user);
    }

    @Delete(`/:id`)
    @Roles(Role.Organizer)
    removeTournament(@Param(`id`) id: string) {
        return this.tournamentsService.remove(Number(id));
    }
}
