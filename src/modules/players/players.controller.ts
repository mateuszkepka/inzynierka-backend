import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { PlayersService } from './players.service';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { Public } from 'src/decorators/public.decorator';

@Controller(`players`)
@Roles(Role.User)
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get(`/:id`)
    @Public()
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return await this.playersService.getById(id);
    }

    @Get()
    async getAll() {
        return await this.playersService.getAll();
    }

    @Post()
    async create(@Body() body: AddPlayerAccountDto, @Req() { user }: RequestWithUser) {
        return this.playersService.create(body, user);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdatePlayerDto) {
        return await this.playersService.update(id, body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return await this.playersService.remove(id);
    }
}
