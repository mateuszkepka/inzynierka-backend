import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    SerializeOptions,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';
@Roles(Role.Player)
@Controller(`matches`)
@SerializeOptions({ strategy: `excludeAll` })
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return await this.matchesService.getById(id);
    }

    @Get()
    async getAll() {
        return await this.matchesService.getAll();
    }

    @Post()
    @Roles(Role.Organizer)
    async create(@Body() teamData: CreateMatchDto) {
        return await this.matchesService.create(teamData);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return await this.matchesService.update(id, body);
    }
}
