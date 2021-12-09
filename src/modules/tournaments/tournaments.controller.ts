import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptTeamDto } from './dto/accept-team-dto';
import { CreateAdminDto } from './dto/create-admin-dto';
import { CreateParticipatingTeamDto } from './dto/create-participatingTeam.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';
@Controller(`tournaments`)
@SerializeOptions({ strategy: `excludeAll` })
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get(`pending-teams/:id`)
    @UseGuards(JwtAuthGuard)
    async getPendingTeamsList(@Param(`id`) id: number, @Req() request: RequestWithUser) {
        const teamslist = await this.tournamentsService.getPendingTeamsList(id, request);
        if (!teamslist) {
            throw new NotFoundException(`No pending teams found!`);
        }
        return teamslist;
    }

    @Get(`managed-tournaments`)
    @UseGuards(JwtAuthGuard)
    async getManagedTournaments(@Req() request: RequestWithUser) {
        const torunamentlist = await this.tournamentsService.getManagedTournaments(request);

        if (!torunamentlist) {
            throw new NotFoundException(`Tournaments not found`);
        }

        return torunamentlist;
    }

    @Get(`/:id`)
    async findById(@Param(`id`) id: string) {
        const torunament = await this.tournamentsService.getById(Number(id));
        if (!torunament) {
            throw new NotFoundException(`Tournament not found`);
        }
        return torunament;
    }

    @Get()
    async find() {
        const torunament = await this.tournamentsService.getAllTournaments();
        if (!torunament) {
            throw new NotFoundException(`Tournaments not found`);
        }
        return torunament;
    }

    @Post(`accept-team`)
    @UseGuards(JwtAuthGuard)
    async acceptTeam(@Body() acceptdata: AcceptTeamDto, @Req() request: RequestWithUser) {
        return this.tournamentsService.acceptTeam(acceptdata, request);
    }

    @Post(`admins`)
    @UseGuards(JwtAuthGuard)
    async addAdmin(@Body() admindata: CreateAdminDto, @Req() request: RequestWithUser) {
        return this.tournamentsService.addAdmin(admindata, request);
    }

    @Post(`prizes`)
    @UseGuards(JwtAuthGuard)
    async addPrize(@Body() prizedata: CreatePrizeDto, @Req() request: RequestWithUser) {
        return this.tournamentsService.addPrize(prizedata, request);
    }

    @Post(`teams`)
    async addTeam(@Body() participatingTeamData: CreateParticipatingTeamDto) {
        return this.tournamentsService.addTeam(participatingTeamData);
    }
    
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() tournamentData: CreateTournamentDto, @Req() request: RequestWithUser) {
        return this.tournamentsService.create(tournamentData, request);
    }
    @Delete(`/:id`)
    removeTournament(@Param(`id`) id: string) {
        return this.tournamentsService.remove(Number(id));
    }

    @Put(`/:id`)
    updateTournament(@Param(`id`) id: string, @Body() body: UpdateTournamentDto) {
        return this.tournamentsService.update(Number(id), body);
    }
}
