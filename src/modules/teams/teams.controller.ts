import {
    Body,
    Controller,
    Delete,
    Get,
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
import { CreateInvitation } from './dto/create-invitation.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptPlayerInvitationDto } from './dto/accept-player-invitation.dto';
@Controller(`teams`)
@SerializeOptions({ strategy: `excludeAll` })
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/:id/members`)
    @UseGuards(JwtAuthGuard)
    async getMembers(@Param(`id`) id: string) {
        return await this.teamsService.getMembers(parseInt(id));
    }

    // TODO move to user's module
    // should look like GET /user/:id/pending-invitations
    @Get(`pending-invitations`)
    @UseGuards(JwtAuthGuard)
    async getManagedTournaments(@Req() request: RequestWithUser) {
        return this.teamsService.getPendingInvitations(request);
    }

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        return this.teamsService.getById(Number(id));
    }

    @Get()
    async getAllTeams() {
        return this.teamsService.getAllTeams();
    }

    // TODO move to invitation's module
    // should look like POST /invitations
    @Post(`create-invitation`)
    async createInvitaion(@Body() invitationData: CreateInvitation) {
        return this.teamsService.createInvitaion(invitationData);
    }

    // TODO move to invitation's module
    // should look like PUT /invitations/:id
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
