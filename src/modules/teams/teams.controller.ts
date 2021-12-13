import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';

@Controller(`teams`)
@Roles(Role.User)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/:id/players/available`)
    async getAvailablePlayers(@Param(`id`, ParseIntPipe) id: number, @Req() { user }: RequestWithUser) {
        return await this.teamsService.getAvailablePlayers(id, user);
    }

    @Get(`/:id/members`)
    async getMembers(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getMembers(id);
    }

    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return await this.teamsService.getById(id);
    }

    @Get()
    async getAll() {
        return await this.teamsService.getAll();
    }

    @Post()
    @Roles(Role.Player)
    async create(@Body() teamData: CreateTeamDto) {
        return await this.teamsService.create(teamData);
    }

    // @Patch(`/:id`)
    // @Roles(Role.Player)
    // @UseGuards(UserIsCaptainGuard)
    // async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateTeamDto) {
    //     return await this.teamsService.update(id, body);
    // }

    @Delete(`/:id`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return await this.teamsService.remove(id);
    }
}
