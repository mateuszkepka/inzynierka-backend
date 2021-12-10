import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    SerializeOptions,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller(`users`)
@Roles(Role.User)
@SerializeOptions({ strategy: `excludeAll`, enableCircularCheck: true })
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`, ParseIntPipe) id: number) {
        return await this.usersService.getAccounts(id);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return await this.usersService.getTeams(id);
    }

    @Get(`/:id`)
    async findUser(@Param(`id`, ParseIntPipe) id: number) {
        return await this.usersService.getById(id);
    }

    @Delete(`/:id`)
    async removeUser(@Param(`id`, ParseIntPipe) id: number) {
        return await this.usersService.remove(id);
    }

    @Put(`/:id`)
    async updateUser(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return await this.usersService.update(id, body);
    }
}
