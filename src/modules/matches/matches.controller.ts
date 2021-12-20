import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/roles.enum';
import { RosterMember } from '../tournaments/dto/create-participating-team.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller(`matches`)
@Roles(Role.Player)
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Get(`/:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        const match = await this.matchesService.getById(id);
        console.log(match.secondRoster.roster[0] instanceof RosterMember)
        return match;
    }

    @Post()
    @Roles(Role.Organizer)
    async create(@Body() matchData: CreateMatchDto) {
        return this.matchesService.create(matchData);
    }

    @Patch(`/:id`)
    async update(@Param(`id`, ParseIntPipe) id: number, @Body() body: UpdateMatchDto) {
        return this.matchesService.update(id, body);
    }
}
