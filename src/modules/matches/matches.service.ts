import vision from '@google-cloud/vision';
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupStanding, Ladder, Map as MatchMap, Match, ParticipatingTeam, Performance, Team, Tournament, User } from 'src/database/entities';
import { Connection, Repository } from 'typeorm';
import { TournamentFormat } from '../formats/dto/tournament-format.enum';
import { PlayersService } from '../players/players.service';
import { TournamentStatus } from '../tournaments/dto/tourrnament.status.enum';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreateStatsDto } from './dto/create-stats.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchStatus } from './interfaces/match-status.enum';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(GroupStanding) private readonly groupStandingsRepository: Repository<GroupStanding>,
        @InjectRepository(Performance) private readonly performancesRepository: Repository<Performance>,
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Map) private readonly mapsRepository: Repository<MatchMap>,
        private readonly tournamentsService: TournamentsService,
        private readonly playersService: PlayersService,
        private readonly connection: Connection,
    ) { }

    async getById(id: number) {
        let match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .select([
                `match.matchId`,
                `match.matchStartDate`,
                `match.matchEndDate`,
                `match.status`,
                `match.winner`,
                `match.numberOfMaps`,
                `match.tournament`,
                `match.firstRoster`,
                `match.secondRoster`,
            ])
            .addSelect([
                `firstRoster.participatingTeamId`,
                `secondRoster.participatingTeamId`,
                `firstRoster.team`,
                `secondRoster.team`,
                `firstRoster.roster`,
                `secondRoster.roster`,
            ])
            .addSelect([
                `firstTeam.teamId`, `firstTeam.teamName`,
                `secondTeam.teamId`, `secondTeam.teamName`, `performance.player`,
                `tournament.tournamentId`, `group.groupId`,
            ])
            .leftJoin(`match.group`, `group`)
            .leftJoin(`match.tournament`, `tournament`)
            .leftJoin(`match.firstRoster`, `firstRoster`)
            .leftJoin(`match.secondRoster`, `secondRoster`)
            .leftJoin(`firstRoster.team`, `firstTeam`)
            .leftJoin(`secondRoster.team`, `secondTeam`)
            .leftJoinAndSelect(`match.maps`, `map`)
            .leftJoinAndSelect(`map.performances`, `performance`)
            .leftJoinAndSelect(`performance.player`, `player`)
            .where(`match.matchId = :matchId`, { matchId: id })
            .getOne();
        if (!match) {
            throw new NotFoundException(`Match with this id doesn't exist`);
        }
        return match;
    }

    async getMatchByPosition(ladderId: number, round: number, position: number) {
        let match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .innerJoin(`match.ladder`, `ladder`)
            .leftJoinAndSelect(`match.firstTeam`, `firstTeam`)
            .leftJoinAndSelect(`match.secondTeam`, `secondTeam`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladderId })
            .andWhere(`match.position = :position`, { position: position })
            .andWhere(`match.round = :round`, { round: round })
            .getOne();
        return match;
    }

    async getWithRelations(matchId: number) {
        let match = await this.matchesRepository.findOne({
            relations: [`group`, `tournament`, `firstRoster`, `secondRoster`, `firstTeam`, `secondTeam`, `ladder`, `firstTeam.captain`, `secondTeam.captain`, `firstTeam.captain.user`, `secondTeam.captain.user`, `maps`],
            where: { matchId: matchId }
        });
        return match;
    }

    async update(id: number, attrs: Partial<UpdateMatchDto>) {
        const match = await this.getById(id);
        let firstRoster = null;
        if (attrs.firstRosterId) {
            firstRoster = await this.tournamentsService.getParticipatingTeamById(
                attrs.firstRosterId,
            );
        }
        let secondRoster = null;
        if (attrs.secondRosterId) {
            secondRoster = await this.tournamentsService.getParticipatingTeamById(
                attrs.secondRosterId,
            );
        }
        Object.assign(match, attrs);
        if (firstRoster) {
            match.firstRoster = firstRoster;
        }
        if (secondRoster) {
            match.secondRoster = secondRoster;
        }
        return this.matchesRepository.save(match);
    }

    async resolveManually(matchId: number, winner: number) {
        const match = await this.getWithRelations(matchId);
        await this.resolveMatch(match, winner);
    }

    async resolveAutomatically(matchId: number, files: Array<Express.Multer.File>, user: User) {
        const { winner, confirmed } = await this.parseResults(matchId, files, user);
        const match = await this.getWithRelations(matchId);
        if (!confirmed) {
            match.status = MatchStatus.Resolving;
            await this.matchesRepository.save(match);
            return;
        } else if (confirmed) {
            match.status = MatchStatus.Finished;
        } else {
            throw new InternalServerErrorException(`Something went wrong`);
        }
        await this.resolveMatch(match, winner);
    }

    async resolveMatch(match: Match, winner: number) {
        match.winner = winner;
        await this.matchesRepository.save(match);
        const tournament = await this.tournamentsService.getById(match.tournament.tournamentId);
        const format = tournament.format.name;
        if (format === TournamentFormat.SingleRoundRobin || format === TournamentFormat.DoubleRoundRobin) {
            const group = await this.tournamentsService.getGroupById(match.group.groupId);
            let standings = group.standings;
            const firstRoster = standings.find((standing) => standing.team.teamId === match.firstTeam.teamId);
            const secondRoster = standings.find((standing) => standing.team.teamId === match.secondTeam.teamId);

            // granting points for the match
            if (match.winner === 0) {
                firstRoster.points += 1;
                secondRoster.points += 1;
                console.log(`${match.firstTeam.teamName} + 1pkt, ${match.secondTeam.teamName} + 1pkt`)
            }
            if (match.winner === 1) {
                firstRoster.points += 3;
                secondRoster.points += 0;
                console.log(`${match.firstTeam.teamName} + 3pkt, ${match.secondTeam.teamName} 0pkt`)
            }
            if (match.winner === 2) {
                firstRoster.points += 0;
                secondRoster.points += 3;
                console.log(`${match.firstTeam.teamName} 0pkt, ${match.secondTeam.teamName} + 3pkt`)
            }

            // setting proper places in groups
            standings = standings.sort((a, b) => b.points - a.points);

            for (let i = 0; i < standings.length; i++) {
                if (standings[i + 1] && standings[i].points === standings[i + 1].points) {
                    // TODO tiebreaking system
                }
                standings[i].place = i + 1;
            }
            await this.groupStandingsRepository.save(standings);
        }
        if (format === TournamentFormat.SingleEliminationLadder) {
            // deciding the winner
            let winningTeam: Team = null;
            let winningRoster: ParticipatingTeam = null;

            if (match.winner === 1) {
                winningRoster = match.firstRoster;
                winningTeam = match.firstTeam;
            }
            if (match.winner === 2) {
                winningRoster = match.secondRoster;
                winningTeam = match.secondTeam;
            }
            const ladder = await this.tournamentsService.getLadder(tournament, false);

            // setting next round for the winner
            const nextRound = match.round - 1;

            if (nextRound > 0) {
                // setting next match position
                let nextPosition: number;
                if (match.position % 2 === 0) {
                    nextPosition = match.position / 2;
                }
                if (match.position % 2 !== 0) {
                    nextPosition = (match.position + 1) / 2;
                }

                // promoting winner to the next stage
                const nextMatch = await this.getMatchByPosition(ladder.ladderId, nextRound, nextPosition);
                if (nextMatch.firstTeam === null) {
                    nextMatch.firstTeam = winningTeam;
                    nextMatch.firstRoster = winningRoster;
                } else if (nextMatch.secondTeam === null) {
                    nextMatch.secondTeam = winningTeam;
                    nextMatch.secondRoster = winningRoster;
                }
                await this.matchesRepository.save(nextMatch);
            }
        }
        if (format === TournamentFormat.DoubleEliminationLadder) {
            // deciding the winner
            let winningRoster: ParticipatingTeam = null;
            let losingRoster: ParticipatingTeam = null;

            let winningTeam: Team = null;
            let losingTeam: Team = null;

            if (match.winner === 1) {
                winningRoster = match.firstRoster;
                losingRoster = match.secondRoster;
                winningTeam = match.firstTeam;
                losingTeam = match.secondTeam;
            }
            if (match.winner === 2) {
                winningRoster = match.secondRoster;
                losingRoster = match.firstRoster;
                winningTeam = match.secondTeam;
                losingTeam = match.firstTeam;
            }

            // getting upper and lower brackets
            const upperLadder = await this.tournamentsService.getLadder(tournament, false);
            const lowerLadder = await this.tournamentsService.getLadder(tournament, true);

            // getting number of rounds for brackets
            let numberOfUpperRounds = await this.tournamentsService.getMaxRound(
                upperLadder.ladderId,
            );
            let numberOfLowerRounds = await this.tournamentsService.getMaxRound(
                lowerLadder.ladderId,
            );

            numberOfUpperRounds = numberOfUpperRounds.max;
            numberOfLowerRounds = numberOfLowerRounds.max;

            // setting next matches position
            let winnersPosition: number;
            let losersPosition: number;

            let winnersRound: number;
            let losersRound: number;

            let winnersLadder: Ladder;
            let losersLadder: Ladder;

            // logic when match is in the upper bracket
            if (!match.ladder.isLosers) {
                // first upper bracket round
                if (match.round === numberOfUpperRounds) {
                    winnersLadder = upperLadder;
                    losersLadder = lowerLadder;

                    winnersRound = match.round - 1;
                    losersRound = numberOfLowerRounds;
                    if (match.position % 2 === 0) {
                        winnersPosition = match.position / 2;
                        losersPosition = match.position / 2;
                    }
                    if (match.position % 2 !== 0) {
                        winnersPosition = (match.position + 1) / 2;
                        losersPosition = (match.position + 1) / 2;
                    }
                    // rest of upper bracket rounds apart from final
                } else if (match.round === numberOfUpperRounds - 1) {
                    winnersLadder = upperLadder;
                    losersLadder = lowerLadder;

                    winnersRound = match.round - 1;

                    let maxLosersRound = await this.tournamentsService.getMaxRound(lowerLadder.ladderId);
                    maxLosersRound = maxLosersRound.max;
                    losersRound = maxLosersRound - 1;

                    let maxPosition = await this.tournamentsService.getMaxPositionInRound(lowerLadder.ladderId, losersRound);
                    maxPosition = maxPosition.max;
                    losersPosition = maxPosition + 1 - match.position;

                    if (match.position % 2 === 0) {
                        winnersPosition = match.position / 2;
                    }
                    if (match.position % 2 !== 0) {
                        winnersPosition = (match.position + 1) / 2;
                    }
                } else if (match.round < numberOfUpperRounds && match.round > 2) {
                    winnersLadder = upperLadder;
                    losersLadder = lowerLadder;

                    winnersRound = match.round - 1;

                    let maxWinnersRound = await this.tournamentsService.getMaxRound(upperLadder.ladderId);
                    maxWinnersRound = maxWinnersRound.max;

                    let maxLosersRound = await this.tournamentsService.getMaxRound(lowerLadder.ladderId);
                    maxLosersRound = maxLosersRound.max;

                    let maxPosition = await this.tournamentsService.getMaxPositionInRound(upperLadder.ladderId, match.round);
                    maxPosition = maxPosition.max;

                    // array for storing rounds in upper bracket
                    const winnersRounds: number[] = [];
                    let winnersIterator = 2;
                    while (winnersIterator < maxWinnersRound) {
                        winnersRounds.push(winnersIterator++);
                    }

                    // array for storing rounds in lower bracket
                    const losersRounds: number[] = [];
                    let losersIterator = 1;
                    while (losersIterator < maxLosersRound) {
                        losersRounds.push(losersIterator);
                        losersIterator += 2;
                    }

                    // array for flipping positions in lower bracket
                    let positions: number[] = [];
                    let positionsIterator = 1;
                    while (positions.length < maxPosition) {
                        positions.push(positionsIterator++);
                    }

                    const firstHalf = positions.slice(0, positions.length / 2).reverse();
                    const secondHalf = positions.slice(-positions.length / 2).reverse();
                    const flippedPositions = firstHalf.concat(secondHalf);

                    if (match.position % 2 === 0) {
                        winnersPosition = match.position / 2;
                    }
                    if (match.position % 2 !== 0) {
                        winnersPosition = (match.position + 1) / 2;
                    }

                    // mapping round after loss in upper bracket to lower bracket
                    losersRound = losersRounds[winnersRounds.findIndex((r) => r === match.round)];

                    // mapping position after loss in upper bracket to lower bracket
                    losersPosition = positions[flippedPositions.findIndex(p => p === match.position)];

                    // upper bracket final
                } else if (match.round === 2) {
                    winnersLadder = upperLadder;
                    winnersRound = 1;
                    winnersPosition = 1;

                    losersLadder = lowerLadder;
                    losersRound = 1;
                    losersPosition = 1;
                }
            }

            // logic when match is in the lower bracket
            if (match.ladder.isLosers) {
                // first lower bracket round
                if (match.round === numberOfLowerRounds) {
                    winnersLadder = lowerLadder;
                    winnersRound = match.round - 1;
                    winnersPosition = match.position;
                    // rest of lower bracket rounds apart from final
                } else if (match.round < numberOfUpperRounds && match.round > 1) {
                    winnersLadder = lowerLadder;
                    winnersRound = match.round - 1;
                    if (match.round % 2 === 0) {
                        winnersPosition = match.position;
                    }
                    if (match.round % 2 !== 0) {
                        if (match.position % 2 === 0) {
                            winnersPosition = match.position / 2;
                        }
                        if (match.position % 2 !== 0) {
                            winnersPosition = (match.position + 1) / 2;
                        }
                    }
                    // lower bracket final
                } else if (match.round === 1) {
                    winnersLadder = upperLadder;
                    winnersPosition = 1;
                    winnersRound = 1;
                }
            }
            const nextWinnersMatch = await this.getMatchByPosition(winnersLadder.ladderId, winnersRound, winnersPosition);
            console.log(`Mecz id: ${match.matchId} r:${match.round} p:${match.position}\n`)
            console.log(`Wygrał ${winningTeam.teamName} id ${winningTeam.teamId}`);
            console.log(`Winners next round ${winnersRound}`);
            console.log(`Winner next pos ${winnersPosition}`);
            console.log(`Next winners match ${nextWinnersMatch.matchId}\n`);
            console.log(`Przegrał ${losingTeam.teamName} id ${losingTeam.teamId}`);
            if (losersLadder != null) {
                const nextLosersMatch = await this.getMatchByPosition(losersLadder.ladderId, losersRound, losersPosition);
                if (nextLosersMatch.firstTeam === null) {
                    nextLosersMatch.firstTeam = losingTeam;
                    nextLosersMatch.firstRoster = losingRoster;
                } else if (nextLosersMatch.secondTeam === null) {
                    nextLosersMatch.secondTeam = losingTeam;
                    nextLosersMatch.secondRoster = losingRoster;
                }
                await this.matchesRepository.save(nextLosersMatch);
                console.log(`Losers next round ${losersRound}`)
                console.log(`Losers next pos ${losersPosition}`)
                console.log(`Next losers match ${nextLosersMatch.matchId}\n`)
            }
            if (losersLadder == null) {
                console.log(`${losingTeam.teamName} odpada z turnieju\n`)
            }
            if (nextWinnersMatch.firstTeam === null) {
                nextWinnersMatch.firstTeam = winningTeam;
                nextWinnersMatch.firstRoster = winningRoster;
            } else if (nextWinnersMatch.secondTeam === null) {
                nextWinnersMatch.secondTeam = winningTeam;
                nextWinnersMatch.secondRoster = winningRoster;
            }
            await this.matchesRepository.save(nextWinnersMatch);
        }
        // checking if there are more scheduled matches
        const isOnGoing = await this.tournamentsService
            .getMatchesByTournament(tournament.tournamentId, MatchStatus.Scheduled);
        if (!isOnGoing) {
            tournament.status === TournamentStatus.Finished;
            await this.tournamentsRepository.save(tournament);
        }
    }

    async parseResults(matchId: number, results: Array<Express.Multer.File>, user: User): Promise<{ winner: number, confirmed: boolean }> {
        const match = await this.getWithRelations(matchId);
        //this.validateScreenshots(match, results);
        let senderTeam: Team;
        let otherTeam: Team;
        let firstTeamWins: number = 0;
        let secondTeamWins: number = 0;
        if (user.userId === match.firstTeam.captain.user.userId) {
            senderTeam = match.firstTeam;
            otherTeam = match.secondTeam;
            match.firstCaptainDate = new Date();
        }
        if (user.userId === match.secondTeam.captain.user.userId) {
            senderTeam = match.secondTeam;
            otherTeam = match.firstTeam;
            match.secondCaptainDate = new Date();
        }
        const mapPerformances: Map<MatchMap, Performance[]> = new Map<MatchMap, Performance[]>();
        const client = new vision.ImageAnnotatorClient();
        for (let i = 0; i < results.length; i++) {
            const performances: Performance[] = [];
            let mapWinner: number;
            const [result] = await client.textDetection(results[i].path);
            const data: string = result.textAnnotations[0].description;
            const array = data.split(/[\n]+/);
            const timeRegex: RegExp = /\d{0,3}:\d{2}/;
            const mapResult = array[0].toLowerCase();
            if (mapResult === `victory` || mapResult === `zwycięstwo`) {
                mapWinner = senderTeam.teamId;
                firstTeamWins++;
            } else if (mapResult === 'defeat' || mapResult === `przegrana`) {
                mapWinner = otherTeam.teamId;
                secondTeamWins++;
            } else {
                throw new BadRequestException(`Screenshot number ${i + 1} is inappropriate`);
            }
            const mapTime = data.match(timeRegex)[0];
            const members: string[] = [];
            const memberList = match.firstRoster.roster.concat(match.secondRoster.roster)
            for (const member of memberList) {
                const player = await this.playersService.getById(member.playerId);
                members.push(player.summonerName)
            };
            const stats: CreateStatsDto[] = [];
            members.forEach((member) => {
                let pushStats = false;
                const regex = new RegExp("\\" + member, "i");
                for (let j = 0; j < array.length; j++) {
                    if (array[j].match(regex)) {
                        let statsArray = array[j + 1].split(/\D/);
                        statsArray = statsArray.filter(s => /\S/.test(s));
                        if (!isNaN(parseInt(statsArray[0]))
                            && !isNaN(parseInt(statsArray[1]))
                            && !isNaN(parseInt(statsArray[2]))
                            && !isNaN(parseInt(array[j + 2]))
                            && !isNaN(parseInt(array[j + 3]))) {
                            pushStats = true;
                        }
                        if (pushStats) {
                            console.log(`Gracz: ${member}, KDA:${statsArray[0]}/${statsArray[1]}/${statsArray[2]}, CS:${array[j + 2]}, Gold:${array[j + 3]}`);
                            stats.push({
                                summonerName: member,
                                kills: parseInt(statsArray[0]),
                                deaths: parseInt(statsArray[1]),
                                assists: parseInt(statsArray[2]),
                                creepScore: parseInt(array[j + 2]),
                                gold: parseInt(array[j + 3]),
                            });
                        }
                    }
                }
            });
            const map = this.mapsRepository.create({
                mapWinner: mapWinner,
                time: mapTime,
                match: match,
                performances: []
            });
            for (const stat of stats) {
                const player = await this.playersService.getByNickname(stat.summonerName);
                const performance = this.performancesRepository.create({
                    kills: stat.kills,
                    deaths: stat.deaths,
                    assists: stat.assists,
                    gold: stat.gold,
                    creepScore: stat.creepScore,
                    player: player,
                    map: map
                });
                performances.push(performance);
            }
            mapPerformances.set(map, performances);
            console.log(`Mapa nr: ${i + 1}, Winner: ${mapWinner}, Czas: ${mapTime}\n`)
        }
        let confirmed: boolean;
        if (match.status === MatchStatus.Resolving) {
            await this.compareMaps(match, mapPerformances);
            confirmed = true;
        }
        if (match.status === MatchStatus.Scheduled || match.status === MatchStatus.Postponed) {
            await this.createMaps(match, mapPerformances);
            confirmed = false;
        }
        let winner: number;
        if (firstTeamWins > secondTeamWins) {
            winner = 1;
        }
        else if (secondTeamWins > firstTeamWins) {
            winner = 2;
        } else {
            winner = 0;
        }
        await this.matchesRepository.save(match);
        return { winner, confirmed };
    }

    async createMaps(match: Match, mapPerformances: Map<MatchMap, Performance[]>) {
        for (const [key, value] of mapPerformances) {
            await this.connection.manager.insert(Performance, value);
            for (const performance of value) {
                key.performances.push(performance);
            }
            const map = await this.connection.manager.save(key);
            match.maps.push(map);
        };
        await this.connection.manager.save(match);
    }

    async compareMaps(match: Match, mapPerformances: Map<MatchMap, Performance[]>) {
        let comparingFailed = false;
        for (const key of mapPerformances.keys()) {
            const map = await this.mapsRepository.findOne({
                mapWinner: key.mapWinner,
                time: key.time,
                match: match
            });
            if (!map) {
                comparingFailed = true;
            }
        }
        for (const value of mapPerformances.values()) {
            for (const performanceToCompare of value) {
                const performance = await this.performancesRepository.findOne({
                    kills: performanceToCompare.kills,
                    deaths: performanceToCompare.deaths,
                    assists: performanceToCompare.assists,
                    gold: performanceToCompare.gold,
                    creepScore: performanceToCompare.creepScore,
                    player: performanceToCompare.player,
                })
                if (!performance) {
                    comparingFailed = true;
                }
            }
        }
        if (comparingFailed) {
            match.status = MatchStatus.Unresolved;
            const performanceIds: number[] = [];
            const mapIds: number[] = [];
            const maps = await this.mapsRepository.find({ where: { match: match } });
            for (const map of maps) {
                mapIds.push(map.mapId);
                const performances = await this.performancesRepository.find({ where: { map: map } });
                for (const performance of performances) {
                    performanceIds.push(performance.performanceId);
                }
            }
            await this.connection.manager.delete(Performance, performanceIds);
            await this.connection.manager.delete(MatchMap, mapIds);
            await this.matchesRepository.save(match);
            throw new BadRequestException(`Screenshots are not matching your opponent's ones`);
        }
        await this.matchesRepository.save(match);
    }

    async validateScreenshots(match: Match, results: Array<Express.Multer.File>) {
        if (match.status === MatchStatus.Finished) {
            throw new ForbiddenException(`This match has already finished`);
        }
        if (match.status === MatchStatus.Cancelled) {
            throw new ForbiddenException(`This match has been cancelled`)
        }
        if (match.status === MatchStatus.Unresolved) {
            throw new ForbiddenException(`This match is marked to be resolved manually`)
        }
        let tooManyScreensError = false;
        let notEnoughScreensError = false;
        switch (match.numberOfMaps) {
            case 1:
                if (results.length > 1) {
                    tooManyScreensError = true;
                }
                break;
            case 3:
                if (results.length < 2) {
                    notEnoughScreensError = true;
                }
                if (results.length > 3) {
                    tooManyScreensError = true;
                }
                break;
            case 5:
                if (results.length < 3) {
                    notEnoughScreensError = true;
                }
                if (results.length > 5) {
                    tooManyScreensError = true;
                }
                break;
        }
        if (tooManyScreensError) {
            throw new BadRequestException(`Too many screenshots provided!`)
        }
        if (notEnoughScreensError) {
            throw new BadRequestException(`Not enough screenshots provided!`)
        }
    }
}