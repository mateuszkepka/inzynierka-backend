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
import { User } from 'src/entities';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { DefaultUserDto } from './dto/default-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
// @SerializeOptions({
//     strategy: 'excludeAll',
// })
@Serialize(DefaultUserDto)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/:id')
    @UseGuards(JwtAuthGuard)
    findUser(@Param('id') id: string) {
        const user = this.usersService.findById(parseInt(id));
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.usersService.remove(parseInt(id));
    }

    @Put('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(parseInt(id), body);
    }
}
