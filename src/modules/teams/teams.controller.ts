import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';

@Controller(`teams`)
@Roles(Role.User)
@SerializeOptions({ strategy: `excludeAll` })
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/:id/members`)
    async getMembers(@Param(`id`) id: string) {
        return await this.teamsService.getMembers(parseInt(id));
    }

    @Get(`/:id`)
    async get(@Param(`id`) id: string) {
        return await this.teamsService.getById(Number(id));
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

    @Put(`/:id`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async update(@Param(`id`) id: string, @Body() teamData: UpdateTeamDto) {
        return await this.teamsService.update(+id, teamData);
    }

    @Delete(`/:id`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`id`) id: string) {
        return await this.teamsService.remove(+id);
    }
}
