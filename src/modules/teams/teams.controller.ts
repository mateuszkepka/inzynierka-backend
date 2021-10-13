import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
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
    @Post(`create`)
    async create(@Body() teamdata: CreateTeamDto) {
        return this.teamsService.create(teamdata);
    }
    @Delete(`/:id`)
    removeTeam(@Param(`id`) id: string) {
        return this.teamsService.remove(Number(id));
    }

    @Put(`/:id`)
    updateTeam(@Param(`id`) id: string, @Body() body: UpdateTeamDto) {
        return this.teamsService.update(Number(id), body);
    }
}
