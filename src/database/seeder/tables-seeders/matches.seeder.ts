import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, ParticipatingTeam, Tournament } from 'src/database/entities';
import { TournamentFormat } from 'src/modules/formats/dto/tournament-format.enum';
import { GroupsService } from 'src/modules/tournaments/groups.service';
import { LaddersService } from 'src/modules/tournaments/ladders.service';
import { Repository } from 'typeorm';

@Injectable()
export class MatchesSeeder {
    constructor(
        @InjectRepository(ParticipatingTeam) private readonly rostersRepository: Repository<ParticipatingTeam>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly groupsService: GroupsService,
        private readonly laddersService: LaddersService
    ) { }

    async seed(tournaments: Tournament[]) {
        for (const tournament of tournaments) {
            const format = tournament.format.name;
            const teams = await this.rostersRepository.find({
                where: { tournament: tournament },
                relations: [`team`]
            });
            if (format === TournamentFormat.SingleRoundRobin) {
                await this.groupsService.drawGroups(tournament, teams, 1);
            }
            if (format === TournamentFormat.DoubleRoundRobin) {
                await this.groupsService.drawGroups(tournament, teams, 2);
            }
            if (format === TournamentFormat.SingleEliminationLadder) {
                await this.laddersService.generateLadder(tournament, teams, false);
            }
            if (format === TournamentFormat.DoubleEliminationLadder) {
                await this.laddersService.generateLadder(tournament, teams, true);
            }
        }
    }
}
