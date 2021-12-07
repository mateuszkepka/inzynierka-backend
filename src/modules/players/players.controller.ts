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
import { PlayersService } from './players.service';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { GetAvailablePlayersDto } from './dto/get-available-players.dto';

@Controller(`players`)
@SerializeOptions({ strategy: `excludeAll` })
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        return this.playersService.getById(Number(id));
    }

    @Get()
    async find() {
        return this.playersService.getAllPlayers();
    }

    @UseGuards(JwtAuthGuard)
    @Post(`create`)
    async create(@Body() playerData: AddPlayerAccountDto, @Req() request: RequestWithUser) {
        return this.playersService.create(playerData, request);
    }

    @Post(`available-players`)
    @UseGuards(JwtAuthGuard)
    async getAvailablePlayers(
        @Body() teamdata: GetAvailablePlayersDto,
        @Req() request: RequestWithUser,
    ) {
        const invitaionList = await this.playersService.getAvailablePlayers(teamdata, request);
        if (!invitaionList) {
            throw new NotFoundException(`Players not found`);
        }
        return invitaionList;
    }

    @Delete(`/:id`)
    removePlayer(@Param(`id`) id: string) {
        return this.playersService.remove(Number(id));
    }

    @Put(`/:id`)
    updatePlayer(@Param(`id`) id: string, @Body() body: UpdatePlayerDto) {
        return this.playersService.update(Number(id), body);
    }
}
