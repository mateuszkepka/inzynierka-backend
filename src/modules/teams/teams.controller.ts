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
@Controller(`teams`)
@SerializeOptions({
    strategy: `excludeAll`,
})
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

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
