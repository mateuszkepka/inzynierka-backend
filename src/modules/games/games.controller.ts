import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Public } from 'src/roles/public.decorator';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@Controller(`games`)
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }
    @Public()
    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return await this.gamesService.getById(id);
    }

    @Public()
    @Get()
    async getAll() {
        return await this.gamesService.getAll();
    }

    @Post()
    @Roles(Role.Admin)
    async create(@Body() gameDate: CreateGameDto) {
        return await this.gamesService.create(gameDate);
    }

    @Patch(`/:id`)
    @Roles(Role.Admin)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateGameDto) {
        return await this.gamesService.update(id, body);
    }
}
