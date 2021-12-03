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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreatePlayerTeam } from './dto/create-playerTeam.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptPlayerInvitationDto } from './dto/accept-player-invitation.dto';
@Controller(`teams`)
@SerializeOptions({ strategy: `excludeAll` })
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`pending-invitations`)
    @UseGuards(JwtAuthGuard)
    async getManagedTournaments(@Req() request: RequestWithUser) {
        const invitaionList = await this.teamsService.getPendingInvitations(request);
        if (!invitaionList) {
            throw new NotFoundException(`Tournaments not found`);
        }
        return invitaionList;
    }

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        const torunament = await this.teamsService.getById(Number(id));
        if (!torunament) {
            throw new NotFoundException(`Team not found`);
        }
        return torunament;
    }

    @Get()
    async find() {
        const torunament = await this.teamsService.getAllTeams();
        if (!torunament) {
            throw new NotFoundException(`Teams not found`);
        }
        return torunament;
    }

    @Post(`create-invitation`)
    async createInvitaion(@Body() playerTeamData: CreatePlayerTeam) {
        return this.teamsService.createInvitaion(playerTeamData);
    }

    @UseGuards(JwtAuthGuard)
    @Post(`accept-invitation`)
    async acceptPlayerInvitation(
        @Body() acceptData: AcceptPlayerInvitationDto,
        @Req() request: RequestWithUser,
    ) {
        return this.teamsService.acceptPlayerInvitation(acceptData, request);
    }

    @UseGuards(JwtAuthGuard)
    @Post(`create`)
    async create(@Body() teamData: CreateTeamDto) {
        return this.teamsService.create(teamData);
    }

    @Delete(`/:id`)
    removeTeam(@Param(`id`) id: string) {
        return this.teamsService.remove(Number(id));
    }

    @UseGuards(JwtAuthGuard)
    @Get(`/cos`)
    authenticate(@Req() request: RequestWithUser) {
        const { user } = request;
        return user;
    }
    
    @Put(`/:id`)
    updateTeam(@Param(`id`) id: string, @Body() body: UpdateTeamDto) {
        return this.teamsService.update(Number(id), body);
    }
}
