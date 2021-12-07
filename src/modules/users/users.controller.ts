import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    SerializeOptions,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(Role.User)
@SerializeOptions({ strategy: 'excludeAll' })
@Controller(`users`)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`) id: string) {
        return await this.usersService.getAccounts(+id);
    }

    @Get(`/:id`)
    async findUser(@Param(`id`) id: string) {
        return await this.usersService.getById(+id);
    }

    @Delete(`/:id`)
    async removeUser(@Param(`id`) id: string) {
        return await this.usersService.remove(+id);
    }

    @Put(`/:id`)
    async updateUser(@Param(`id`) id: string, @Body() body: UpdateUserDto) {
        return await this.usersService.update(+id, body);
    }
}
