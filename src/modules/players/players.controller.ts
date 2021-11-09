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
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
@Controller(`players`)
@SerializeOptions({
    strategy: `excludeAll`,
})
export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        const torunament = await this.playersService.getById(Number(id));

        if (!torunament) {
            throw new NotFoundException(`Player not found`);
        }

        return torunament;
    }

    @Get()
    async find() {
        const torunament = await this.playersService.getAllPlayers();

        if (!torunament) {
            throw new NotFoundException(`Players not found`);
        }

        return torunament;
    }
    @UseGuards(JwtAuthGuard)
    @Post(`create`)
    async create(@Body() playerData: CreatePlayerDto, @Req() request: RequestWithUser) {
        return this.playersService.create(playerData, request);
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
