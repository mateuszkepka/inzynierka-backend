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
        const matches = [];
        const standings = [];

        // variable to control the flow of match dates
        const hour = tournament.tournamentStartDate;

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

        // creating upper bracket
        const upperBracket = await this.laddersRepository.save({
            isLosers: isLosers,
            tournament: tournament
        });

        // generating upper bracket matches
        const upperResults = await this.generateMatches(numberOfPhases, hour, tournament, teams, upperBracket);

        // if tournament has losing bracket
        if (isLosers) {
            // creating lower bracket
            const lowerBracket = await this.laddersRepository.save({
                isLosers: isLosers,
                tournament: tournament
            });

            // creating null teams for lower bracket matches
            const nullTeams: ParticipatingTeam[] = []
            for (let i = 0; i < teams.length / 2; i++) {
                nullTeams.push(null);
            }

            // generating lower bracket matches
            const lowerResults = await this.generateMatches(numberOfPhases / 2, hour, tournament, nullTeams, lowerBracket);

            // generating grand final and consolidation final
            const upperFinal = this.generateFinals(tournament, hour, lowerBracket);
            const lowerFinal = this.generateFinals(tournament, hour, upperBracket);

            // push all matches and standings to arrays
            matches.push(upperResults[0], lowerResults[0], upperFinal[0], lowerFinal[0]);
            standings.push(upperResults[1], lowerResults[1], upperFinal[1], lowerFinal[1]);
        }
        await this.matchesRepository.save(matches);
        await this.standingsRepository.save(standings);
    }

    private async generateMatches(numberOfPhases: number, hour: Date, tournament: Tournament, teams: ParticipatingTeam[], ladder: Ladder) {
        const matches = [];
        const standings = [];
        for (let round = numberOfPhases; round > 1; round--) {
            let position = 1;
            const endDate = tournament.tournamentStartDate;
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
                    matchStartDate: new Date(hour),
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
                    hour.setHours(tournament.tournamentStartDate.getHours());
                    hour.setMinutes(tournament.tournamentStartDate.getMinutes());
                }
                let roundAdjustment = round;
                if (ladder.isLosers) {
                    roundAdjustment = round + 1;
                }
                const standing = this.standingsRepository.create({
                    round: roundAdjustment,
                    position: position++,
                    ladder: ladder,
                    match: match
                });
                matches.push(match);
                standings.push(standing);
            }
        }
        return [matches, standings];
    }

    private async generateFinals(tournament: Tournament, hour: Date, ladder: Ladder) {
        const endDate = tournament.tournamentStartDate;
        endDate.setHours(tournament.endingHour);
        endDate.setMinutes(tournament.endingMinutes);
        const match = this.matchesRepository.create({
            matchStartDate: new Date(hour),
            status: MatchStatus.Scheduled,
            numberOfMaps: tournament.numberOfMaps,
            tournament: tournament,
            firstRoster: null,
            secondRoster: null,
            firstTeam: null,
            secondTeam: null,
            maps: []
        });
        const round = Math.max(...ladder.standings.map(standing => standing.round, 0));
        const standing = this.standingsRepository.create({
            round: round - 1,
            position: 1,
            ladder: ladder,
            match: match
        });
        if (hour < endDate) {
            hour.setHours(hour.getHours() + tournament.numberOfMaps)
        } else {
            hour.setHours(hour.getDate() + 1)
            hour.setHours(tournament.tournamentStartDate.getHours());
            hour.setMinutes(tournament.tournamentStartDate.getMinutes());
        }
        return [match, standing];
    }
}