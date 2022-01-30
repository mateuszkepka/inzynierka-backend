import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ladder, Match, ParticipatingTeam, Tournament } from "src/database/entities";
import { setNextPhaseDate, shuffle } from "src/utils/tournaments-util";
import { Repository } from "typeorm";
import { MatchStatus } from "../matches/interfaces/match-status.enum";

@Injectable()
export class LaddersService {
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

        teams = shuffle(teams);

        const upperBracket = await this.laddersRepository.save({
            isLosers: false,
            tournament: tournament
        });

        let phasesIfLower = numberOfPhases;
        if (isLosers) {
            phasesIfLower += 1;
        }
        const firstUpperRound = this.generateFirstRound(
            teams,
            tournament,
            upperBracket,
            phasesIfLower,
            numberOfByes,
            upperDate
        );
        const skipPositions = firstUpperRound[1];
        console.log(skipPositions)
        upperDate = setNextPhaseDate(upperDate, tournament);
        matches = matches.concat(firstUpperRound[0]);

        let numberOfUpperMatches = bracketSize / 2;

        for (let round = numberOfPhases - 1; round > 0; round--) {
            numberOfUpperMatches = numberOfUpperMatches / 2;
            let doubleEliminationRound = round;
            if (isLosers) {
                doubleEliminationRound += 1;
            }
            if (round === numberOfPhases - 1) {
                const upperRound = this.generateRound(
                    tournament,
                    upperBracket,
                    doubleEliminationRound,
                    numberOfUpperMatches,
                    upperDate,
                    skipPositions
                );
                upperDate = setNextPhaseDate(upperDate, tournament);
                matches = matches.concat(upperRound);
            } else {
                const upperRound = this.generateRound(
                    tournament,
                    upperBracket,
                    doubleEliminationRound,
                    numberOfUpperMatches,
                    upperDate
                );
                upperDate = setNextPhaseDate(upperDate, tournament);
                matches = matches.concat(upperRound);
            }
        }

        if (isLosers) {
            const lowerBracket = await this.laddersRepository.save({
                isLosers: true,
                tournament: tournament,
            });

            let numberOfLowerMatches = bracketSize / 2;

            for (let round = numberOfPhases * 2 - 2; round > 0; round -= 2) {
                numberOfLowerMatches = numberOfLowerMatches / 2;
                const lowerFullRound = this.generateRound(
                    tournament,
                    lowerBracket,
                    round,
                    numberOfLowerMatches,
                    lowerDate
                );
                lowerDate = setNextPhaseDate(lowerDate, tournament);
                const lowerHalfRound = this.generateRound(
                    tournament,
                    lowerBracket,
                    round - 1,
                    numberOfLowerMatches,
                    lowerDate
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
        numberOfByes: number,
        date: Date): [Match[], number[]] {
        const matches: Match[] = [];
        const skipPositions: number[] = [];
        let position = 1;
        let skipNextMatch = false;
        for (let i = 0; i < numberOfByes; i++) {
            let nextPosition: number;
            if (position % 2 === 0) {
                nextPosition = position / 2;
            }
            if (position % 2 !== 0) {
                nextPosition = (position + 1) / 2;
            }
            if (i === numberOfByes - 1 && numberOfByes % 2 !== 0) {
                let firstRoster = teams.pop();
                skipNextMatch = true;
                const match = this.matchesRepository.create({
                    matchStartDate: new Date(date),
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    firstRoster: firstRoster,
                    secondRoster: null,
                    firstTeam: firstRoster.team,
                    secondTeam: null,
                    round: round,
                    position: position++,
                    ladder: ladder,
                    maps: [],
                });
                const nextMatch = this.matchesRepository.create({
                    matchStartDate: new Date(date),
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    firstRoster: firstRoster,
                    secondRoster: null,
                    firstTeam: firstRoster.team,
                    secondTeam: null,
                    round: round - 1,
                    position: nextPosition,
                    ladder: ladder,
                    maps: [],
                });
                skipPositions.push(nextPosition);
                matches.push(match, nextMatch);
            } else if (i % 2 !== 0) {
                let firstRoster = teams.pop();
                let secondRoster = teams.pop();
                const firstMatch = this.matchesRepository.create({
                    matchStartDate: new Date(date),
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    firstRoster: firstRoster,
                    secondRoster: null,
                    firstTeam: firstRoster.team,
                    secondTeam: null,
                    round: round,
                    position: position++,
                    ladder: ladder,
                    maps: [],
                });
                const secondMatch = this.matchesRepository.create({
                    matchStartDate: new Date(date),
                    numberOfMaps: tournament.numberOfMaps,
                    tournament: tournament,
                    firstRoster: null,
                    secondRoster: secondRoster,
                    firstTeam: null,
                    secondTeam: secondRoster.team,
                    round: round,
                    position: position++,
                    ladder: ladder,
                    maps: [],
                });
                if (!skipNextMatch) {
                    const nextMatch = this.matchesRepository.create({
                        matchStartDate: new Date(date),
                        numberOfMaps: tournament.numberOfMaps,
                        tournament: tournament,
                        firstRoster: firstRoster,
                        secondRoster: secondRoster,
                        firstTeam: firstRoster.team,
                        secondTeam: secondRoster.team,
                        round: round - 1,
                        position: nextPosition,
                        ladder: ladder,
                        maps: [],
                    });
                    matches.push(nextMatch);
                    skipPositions.push(nextPosition);
                }
                matches.push(firstMatch, secondMatch);
                console.log(`po `, teams.length)
            } else {
                continue;
            }

        }
        position = numberOfByes + 1;
        for (let i = 0; i < teams.length; i += 2) {
            let firstRoster = teams[i];
            let secondRoster = teams[i + 1];
            let firstTeam = firstRoster.team;
            let secondTeam = secondRoster.team;
            const match = this.matchesRepository.create({
                matchStartDate: new Date(date),
                numberOfMaps: tournament.numberOfMaps,
                tournament: tournament,
                firstRoster: firstRoster,
                secondRoster: secondRoster,
                firstTeam: firstTeam,
                secondTeam: secondTeam,
                round: round,
                position: position++,
                ladder: ladder,
                maps: [],
            });
            matches.push(match);
        }
        return [matches, skipPositions];
    }

    private generateRound(
        tournament: Tournament,
        ladder: Ladder,
        round: number,
        numberOfMatches: number,
        date: Date,
        skipPositions?: number[]
    ): Match[] {
        const matches: Match[] = [];
        for (let i = 0; i < numberOfMatches; i++) {
            if (skipPositions && skipPositions.includes(i + 1)) {
                continue;
            }
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