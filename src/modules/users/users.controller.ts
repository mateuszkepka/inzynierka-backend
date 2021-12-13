import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Query,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { GetTournamentsQuery } from './dto/get-tournaments.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller(`users`)
@Roles(Role.User)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(`/:id/accounts`)
    async getAccounts(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getAccounts(id);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getTeams(id);
    }

    @Get(`/:id/tournaments`)
    async getTournaments(@Param(`id`, ParseIntPipe) id: number, @Query() queryParams: GetTournamentsQuery) {
        return this.usersService.getTournaments(id, queryParams);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Put(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }
}
