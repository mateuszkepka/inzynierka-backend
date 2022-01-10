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
        private readonly matches: Match[] = [],
        private readonly standings: LadderStanding[] = []
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

        const upperBracket = await this.laddersRepository.save({
            isLosers: isLosers,
            tournament: tournament
        });

        const startDate = tournament.tournamentStartDate;
        let lastMatchTime = await this.generateMatches(numberOfPhases, startDate, tournament, teams, upperBracket);

        if (isLosers) {
            const lowerBracket = await this.laddersRepository.save({
                isLosers: isLosers,
                tournament: tournament
            });
            const nullTeams: ParticipatingTeam[] = []
            for (let i = 0; i < teams.length / 2; i++) {
                nullTeams.push(null);
            }
            lastMatchTime = await this.generateMatches(numberOfPhases / 2, lastMatchTime, tournament, nullTeams, upperBracket)
            this.generateFinals(tournament, lastMatchTime, lowerBracket);
            lastMatchTime.setHours(lastMatchTime.getHours() + tournament.numberOfMaps);
            this.generateFinals(tournament, lastMatchTime, upperBracket);
        }
        await this.matchesRepository.save(this.matches);
        await this.standingsRepository.save(this.standings);
    }

    private async generateMatches(numberOfPhases: number, startDate: Date, tournament: Tournament, teams: ParticipatingTeam[], ladder: Ladder) {
        const hour = startDate;
        for (let round = numberOfPhases; round > 0; round--) {
            let position = 1;
            const endDate = startDate;
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
                    hour.setHours(startDate.getHours());
                    hour.setMinutes(startDate.getMinutes());
                }
                let losersRound = round;
                if (ladder.isLosers) {
                    losersRound = round + 1;
                }
                const standing = this.standingsRepository.create({
                    round: losersRound,
                    position: position++,
                    ladder: ladder,
                    match: match
                });
                this.matches.push(match);
                this.standings.push(standing);
            }
        }
        return hour;
    }

    private async generateFinals(tournament: Tournament, lastMatchTime: Date, ladder: Ladder) {
        const match = this.matchesRepository.create({
            matchStartDate: new Date(lastMatchTime),
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
        this.matches.push(match);
        this.standings.push(standing);
    }
}