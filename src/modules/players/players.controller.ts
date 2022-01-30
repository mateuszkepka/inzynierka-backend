import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@Controller(`players`)
@Roles(Role.User)
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get(`/:playerId`)
    @Public()
    async getById(@Param(`playerId`, ParseIntPipe) playerId: number) {
        return await this.playersService.getById(playerId);
    }

    @Get()
    async getAll() {
        return await this.playersService.getAll();
    }

    @Post()
    async create(@Body() body: AddPlayerAccountDto, @Req() { user }: RequestWithUser) {
        return this.playersService.create(body, user);
    }

    @Patch(`/:playerId`)
    async update(@Param(`playerId`, ParseIntPipe) playerId: number, @Body() body: UpdatePlayerDto) {
        return await this.playersService.update(playerId, body);
    }

    @Delete(`/:playerId`)
    async remove(@Param(`playerId`, ParseIntPipe) playerId: number) {
        return await this.playersService.remove(playerId);
    }
}
