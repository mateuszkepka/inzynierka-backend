import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ladder, LadderStanding, Match, ParticipatingTeam, Tournament } from "src/entities";
import { shuffle } from "src/util";
import { Repository } from "typeorm";
import { MatchStatus } from "../matches/interfaces/match-status.enum";
import { TeamsService } from "../teams/teams.service";

@Injectable()
export class BracketsService {
    constructor(
        @InjectRepository(LadderStanding) private readonly standingsRepository: Repository<LadderStanding>,
        @InjectRepository(Ladder) private readonly laddersRepository: Repository<Ladder>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly teamsService: TeamsService,
    ) { }

    async generateLadder(tournament: Tournament, signedTeams: ParticipatingTeam[], isLosers: boolean) {
        // copying participating teams into another array
        let teams: ParticipatingTeam[] = []
        signedTeams.forEach((team) => teams.push(Object.assign({}, team)));

        // calculating the size of a bracket
        let bracketSize = 2;
        let numberOfPhases = 1;
        while (bracketSize >= signedTeams.length) {
            bracketSize = Math.pow(2, 1);
            numberOfPhases++;
        }

        // filling a bracket with bye rounds
        const numberOfByes = signedTeams.length - bracketSize;
        for (let i = 0; i < numberOfByes; i++) {
            teams.push(null);
        }

        // shuffling teams array
        teams = shuffle(teams);

        const ladder = await this.laddersRepository.save({
            isLosers: isLosers,
            tournament: tournament
        });

        const matches = [];
        const standings = [];
        for (let round = numberOfPhases; round > 0; round--) {
            let position = 1;
            const startDate = tournament.tournamentStartDate;
            const endDate = startDate;
            const hour = startDate;
            endDate.setHours(tournament.endingHour);
            endDate.setMinutes(tournament.endingMinutes);
            for (let j = 0; j < Math.pow(2, numberOfPhases); j = j + 2) {
                let firstRoster = null, secondRoster = null;
                let firstTeam = null, secondTeam = null;
                if (j === 0) {
                    firstRoster = teams[j];
                    secondRoster = teams[j + 1];
                    firstTeam = await this.teamsService.getByParticipatingTeam(firstRoster.participatingTeamId);
                    secondTeam = await this.teamsService.getByParticipatingTeam(secondRoster.participatingTeamId);
                }
                const match = this.matchesRepository.create({
                    matchStartDate: startDate,
                    status: MatchStatus.Scheduled,
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    firstRoster: firstRoster,
                    secondRoster: secondRoster,
                    firstTeam: firstTeam,
                    secondTeam: secondTeam,
                    maps: []
                })
                if (hour < endDate) {
                    hour.setHours(hour.getHours() + tournament.numberOfMaps)
                } else {
                    hour.setHours(hour.getDate() + 1)
                    hour.setHours(startDate.getHours());
                    hour.setMinutes(startDate.getMinutes());
                }
                const standing = this.standingsRepository.create({
                    round: round,
                    position: position++,
                    ladder: ladder,
                    match: match
                });
                matches.push(match);
                standings.push(standing);
            }
        }
        await this.matchesRepository.save(matches);
        await this.standingsRepository.save(standings);
    }
}