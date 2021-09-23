import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

import { UsersService } from './users.service';

@Controller(`users`)
@SerializeOptions({
    strategy: `excludeAll`,
})
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(`/:id`)
    @UseGuards(JwtAuthGuard)
    async findById(@Param(`id`) id: string) {
        const user = await this.usersService.getById(Number(id));

        if (!user) {
            throw new NotFoundException(`User not found`);
        }

        return user;
    }

    @Delete(`/:id`)
    removeUser(@Param(`id`) id: string) {
        return this.usersService.remove(Number(id));
    }

    @Put(`/:id`)
    updateUser(@Param(`id`) id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(Number(id), body);
    }
}
