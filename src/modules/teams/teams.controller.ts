import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { UserIsCaptainGuard } from './guards/user-is-captain.guard';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UpdateTeamDto } from './dto/update-team.dto';
import { MatchQuery } from '../matches/dto/get-matches.dto';

@Controller(`teams`)
@Roles(Role.User)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get(`/test`)
    async test() {
        return this.teamsService.getByParticipatingTeam(1);
    }

    @Get(`/:id/players/available`)
    async getAvailablePlayers(
        @Param(`id`, ParseIntPipe) id: number,
        @Req() { user }: RequestWithUser
    ) {
        return this.teamsService.getAvailablePlayers(id, user);
    }

    @Get(`/:id/members`)
    async getMembers(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getMembers(id);
    }

    @Get(`/:id/matches`)
    @Roles(Role.Organizer)
    async getMatchesByTeams(
        @Param(`id`, ParseIntPipe) id: number,
        @Query() { status }: MatchQuery
    ) {
        return this.teamsService.getMatchesByTeams(id, status);
    }

    @Get(`/:id`)
    async get(@Param(`id`, ParseIntPipe) id: number) {
        return this.teamsService.getById(id);
    }

    @Get()
    async getAll() {
        return this.teamsService.getAll();
    }

    @Post()
    @Roles(Role.Player)
    async create(@Body() teamData: CreateTeamDto) {
        return this.teamsService.create(teamData);
    }

    @Patch(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async update(@Param(`teamId`, ParseIntPipe) id: number, @Body() body: UpdateTeamDto) {
        return this.teamsService.update(id, body);
    }

    @Delete(`/:teamId`)
    @Roles(Role.Player)
    @UseGuards(UserIsCaptainGuard)
    async remove(@Param(`teamId`, ParseIntPipe) id: number) {
        return this.teamsService.remove(id);
    }
}
