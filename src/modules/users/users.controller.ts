import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { MatchQuery } from '../matches/dto/get-matches.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { RolesDto } from './dto/roles.dto';
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

    @Get(`/:id/tournaments`)
    async getTournaments(@Param(`id`, ParseIntPipe) id: number, @Query() queryParams: GetUsersTournamentsQuery) {
        return this.usersService.getTournamentsByUser(id, queryParams);
    }

    @Get(`/:id/matches`)
    async getMatches(@Param(`id`, ParseIntPipe) id: number, @Query() { status }: MatchQuery) {
        return this.usersService.getMatchesByUser(id, status);
    }

    @Get(`/:id/teams`)
    async getTeams(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getTeamsByUser(id);
    }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.getById(id);
    }

    @Post(`/:id/roles/grant`)
    @Roles(Role.Admin)
    async grantRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.grantRole(id, body);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

    @Delete(`/:id`)
    async remove(@Param(`id`, ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @Post(`/:id/roles/revoke`)
    @Roles(Role.Admin)
    async revokeRole(@Param(`id`, ParseIntPipe) id: number, @Body() body: RolesDto) {
        return this.usersService.revokeRole(id, body);
    }
}
