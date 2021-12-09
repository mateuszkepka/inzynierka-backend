import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    SerializeOptions
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';

@Roles(Role.User)
@Controller(`players`)
@SerializeOptions({ strategy: `excludeAll`, enableCircularCheck: true })
export class PlayersController {
    constructor(private readonly playersService: PlayersService) { }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return await this.playersService.getById(id);
    }

    @Get()
    async getAll() {
        return await this.playersService.getAllPlayers();
    }

    @Post(`create`)
    async create(@Body() body: AddPlayerAccountDto, @Req() { user }: RequestWithUser) {
        return this.playersService.create(body, user);
    }

    @Patch(`/:id`)
    async update(@Param(`id`) id: string, @Body() body: UpdatePlayerDto) {
        return await this.playersService.update(Number(id), body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`) id: string) {
        return await this.playersService.remove(Number(id));
    }
}
