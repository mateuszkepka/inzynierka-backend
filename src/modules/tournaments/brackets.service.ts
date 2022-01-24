import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ladder, Match, ParticipatingTeam, Tournament } from "src/database/entities";
import { setNextPhaseDate, shuffle } from "src/utils/tournaments-util";
import { Repository } from "typeorm";
import { MatchStatus } from "../matches/interfaces/match-status.enum";

@Injectable()
export class BracketsService {
    constructor(
        @InjectRepository(Ladder) private readonly laddersRepository: Repository<Ladder>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
    ) { }

    async generateLadder(
        tournament: Tournament,
        participatingTeams: ParticipatingTeam[],
        isLosers: boolean,
    ) {
        let matches: Match[] = [];

        let upperDate: Date = new Date(tournament.tournamentStartDate);
        let lowerDate: Date = new Date(tournament.tournamentStartDate);
        lowerDate.setHours(lowerDate.getHours() + tournament.numberOfMaps);

        let teams: ParticipatingTeam[] = [];
        participatingTeams.forEach((team) => teams.push(Object.assign({}, team)));

        let bracketSize = 2;
        let numberOfPhases = 1;
        while (bracketSize < participatingTeams.length) {
            bracketSize = Math.pow(2, numberOfPhases);
            numberOfPhases++;
        }
        numberOfPhases -= 1;

        const numberOfByes = bracketSize - participatingTeams.length;
        for (let i = 0; i < numberOfByes; i++) {
            teams.push(null);
        }
        teams = shuffle(teams);

        const upperBracket = await this.laddersRepository.save({
            isLosers: false,
            tournament: tournament,
        });

        let phasesIfLower = numberOfPhases;
        if (isLosers) {
            phasesIfLower += 1;
        }
        const firstUpperRound = await this.generateFirstRound(
            teams,
            tournament,
            upperBracket,
            phasesIfLower,
            Math.pow(2, numberOfPhases),
            upperDate,
        );
        upperDate = setNextPhaseDate(upperDate, tournament);
        matches = matches.concat(firstUpperRound);

        let numberOfUpperMatches = bracketSize / 2;

        for (let round = numberOfPhases - 1; round > 0; round--) {
            numberOfUpperMatches = numberOfUpperMatches / 2;
            let doubleEliminationRound = round;
            if (isLosers) {
                doubleEliminationRound += 1;
            }
            const upperRound = await this.generateRound(
                tournament,
                upperBracket,
                doubleEliminationRound,
                numberOfUpperMatches,
                upperDate
            );
            upperDate = setNextPhaseDate(upperDate, tournament);
            matches = matches.concat(upperRound);
        }

        if (isLosers) {
            const lowerBracket = await this.laddersRepository.save({
                isLosers: true,
                tournament: tournament,
            });

            let numberOfLowerMatches = bracketSize / 2;

            for (let round = numberOfPhases * 2 - 2; round > 0; round -= 2) {
                numberOfLowerMatches = numberOfLowerMatches / 2;
                const lowerFullRound = await this.generateRound(
                    tournament,
                    lowerBracket,
                    round,
                    numberOfLowerMatches,
                    lowerDate,
                );
                lowerDate = setNextPhaseDate(lowerDate, tournament);
                const lowerHalfRound = await this.generateRound(
                    tournament,
                    lowerBracket,
                    round - 1,
                    numberOfLowerMatches,
                    lowerDate,
                );
                lowerDate = setNextPhaseDate(lowerDate, tournament);
                matches = matches.concat(lowerFullRound, lowerHalfRound);
            }

            const grandFinalMatch = this.matchesRepository.create({
                matchStartDate: new Date(upperDate),
                status: MatchStatus.Scheduled,
                numberOfMaps: tournament.numberOfMaps,
                tournament: tournament,
                round: 1,
                position: 1,
                ladder: upperBracket,
                maps: [],
            });
            matches.push(grandFinalMatch);
        }
        await this.matchesRepository.save(matches);
    }

    private generateFirstRound(
        teams: ParticipatingTeam[],
        tournament: Tournament,
        ladder: Ladder,
        round: number,
        numberOfMatches: number,
        date: Date): Match[] {
        const matches: Match[] = [];
        let position = 1;
        for (let i = 0; i < numberOfMatches; i += 2) {
            const firstRoster = teams[i];
            const secondRoster = teams[i + 1];
            const match = this.matchesRepository.create({
                matchStartDate: new Date(date),
                status: MatchStatus.Scheduled,
                numberOfMaps: tournament.numberOfMaps,
                tournament: tournament,
                firstRoster: firstRoster,
                secondRoster: secondRoster,
                firstTeam: firstRoster.team,
                secondTeam: secondRoster.team,
                round: round,
                position: position++,
                ladder: ladder,
                maps: [],
            });
            matches.push(match);
        }
        return matches;
    }

    private generateRound(
        tournament: Tournament,
        ladder: Ladder,
        round: number,
        numberOfMatches: number,
        date: Date,
    ): Match[] {
        const matches: Match[] = [];
        for (let i = 0; i < numberOfMatches; i++) {
            const match = this.matchesRepository.create({
                matchStartDate: new Date(date),
                status: MatchStatus.Scheduled,
                numberOfMaps: tournament.numberOfMaps,
                tournament: tournament,
                round: round,
                position: i + 1,
                ladder: ladder,
                maps: [],
            });
            matches.push(match);
        }
        return matches;
    }
}
