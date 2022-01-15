import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupStanding, Ladder, Map, Match, ParticipatingTeam, Performance, Team, Tournament, User } from 'src/entities';
import { Brackets, Connection, Repository } from 'typeorm';
import { TournamentFormat } from '../formats/dto/tournament-format.enum';
import { PlayersService } from '../players/players.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreateStatsDto } from './dto/create-stats.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import vision from '@google-cloud/vision';
import { MatchStatus } from './interfaces/match-status.enum';
import { TournamentStatus } from '../tournaments/dto/tourrnament.status.enum';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(GroupStanding) private readonly groupStandingsRepository: Repository<GroupStanding>,
        @InjectRepository(Performance) private readonly performancesRepository: Repository<Performance>,
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Map) private readonly mapsRepository: Repository<Map>,
        private readonly tournamentsService: TournamentsService,
        private readonly playersService: PlayersService,
        private readonly connection: Connection
    ) { }

    async getById(id: number) {
        const match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .select([
                `match.matchId`, `match.matchStartDate`, `match.matchEndDate`,
                `match.status`, `match.winner`, `match.numberOfMaps`,
                `match.tournament`, `match.firstRoster`, `match.secondRoster`
            ])
            .addSelect([
                `firstRoster.participatingTeamId`, `secondRoster.participatingTeamId`,
                `firstRoster.team`, `secondRoster.team`,
                `firstRoster.roster`, `secondRoster.roster`
            ])
            .addSelect([
                `firstTeam.teamId`, `firstTeam.teamName`,
                `secondTeam.teamId`, `secondTeam.teamName`, `performance.player`,
                `tournament.tournamentId`, `group.groupId`
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
            .getOne()
        if (!match) {
            throw new NotFoundException(`Match with this id doesn't exist`);
        }
        return match;
    }

    async getWithRelations(matchId: number) {
        const match = await this.matchesRepository.findOne({
            relations: [`group`, `tournament`, `firstRoster`, `secondRoster`, `firstTeam`, `secondTeam`, `ladder`, `firstTeam.captain`, `secondTeam.captain`, `firstTeam.captain.user`, `secondTeam.captain.user`],
            where: { matchId: matchId }
        })
        return match;
    }

    async getHeadToHead(firstRoster: ParticipatingTeam, secondRoster: ParticipatingTeam) {
        const matches = await this.matchesRepository
            .createQueryBuilder(`match`)
            .where(
                new Brackets((qb) => {
                    qb.where(`match.firstRoster = :firstRoster`, { firstRoster: firstRoster })
                        .andWhere(`match.secondRoster = :secondRoster`, { secondRoster: secondRoster });
                }))
            .orWhere(
                new Brackets((qb) => {
                    qb.where(`match.firstRoster = :secondRoster`, { secondRoster: secondRoster })
                        .andWhere(`match.secondRoster = :firstRoster`, { firstRoster: firstRoster });
                }))
            .getMany();
        return matches;
    }

    async update(id: number, attrs: Partial<UpdateMatchDto>) {
        const match = await this.getById(id);
        let firstRoster = null;
        if (attrs.firstRosterId) {
            firstRoster = await this.tournamentsService.getParticipatingTeamById(attrs.firstRosterId);
        }
        let secondRoster = null;
        if (attrs.secondRosterId) {
            secondRoster = await this.tournamentsService.getParticipatingTeamById(attrs.secondRosterId);
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

    async createMap(matchId: number, mapWinner: number, mapTime: string, rawPerformances: CreateStatsDto[]) {
        const match = await this.getById(matchId);
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const map = this.mapsRepository.create({
                mapWinner: mapWinner,
                time: mapTime,
                match: match
            })
            await queryRunner.manager.save(map);
            match.maps.push(map);
            await queryRunner.manager.save(match);
            for (const raw of rawPerformances) {
                // TODO error handling
                const player = await this.playersService.getByNickname(raw.summonerName);
                const performance = this.performancesRepository.create({
                    kills: raw.kills,
                    deaths: raw.deaths,
                    assists: raw.assists,
                    player: player,
                    map: map
                })
                await queryRunner.manager.save(performance);
            }
            if (match.maps.length + 1 >= match.numberOfMaps) {
                return;
            }
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async compareMaps(matchId: number, mapWinner: number, mapTime: string, rawPerformances: CreateStatsDto[], iterator: number) {
        const match = await this.getById(matchId);
        console.log(matchId, mapTime, mapWinner)
        const map = await this.mapsRepository.findOne({
            mapWinner: mapWinner,
            time: mapTime,
            match: match
        })
        for (const raw of rawPerformances) {
            // TODO error handling
            const player = await this.playersService.getByNickname(raw.summonerName);
            const performance = await this.performancesRepository.findOne({
                kills: raw.kills,
                deaths: raw.deaths,
                assists: raw.assists,
                player: player,
                map: map
            })
            console.log(performance)
            if (!performance) {
                match.status = MatchStatus.Unresolved;
                match.winner = null;
                throw new BadRequestException(`Screenshot number ${iterator} is inappropriate`);
            }
        }
        if (!map) {
            match.status = MatchStatus.Unresolved;
            match.winner = null;
            throw new BadRequestException(`Screenshot number ${iterator} is inappropriate`);
        }
        await this.matchesRepository.save(match);
    }

    async resolveMatch(matchId: number, files: Array<Express.Multer.File>, user: User) {
        const winnerId = await this.parseResults(matchId, files, user);
        const match = await this.getWithRelations(matchId);
        match.winner = winnerId;
        const tournament = await this.tournamentsService.getById(match.tournament.tournamentId);
        const format = tournament.format.name;
        if (format === TournamentFormat.SingleRoundRobin || format === TournamentFormat.DoubleRoundRobin) {
            const group = await this.tournamentsService.getGroupById(match.group.groupId);
            let standings = group.standings;
            const firstRoster = standings.find(standing => standing.team.teamId === match.firstTeam.teamId);
            const secondRoster = standings.find(standing => standing.team.teamId === match.secondTeam.teamId);

            // granting points for the match
            if (match.winner === 0) {
                firstRoster.points += 1;
                secondRoster.points += 1;
            }
            if (match.winner === 1) {
                firstRoster.points += 3;
                secondRoster.points += 0;
            }
            if (match.winner === 2) {
                firstRoster.points += 0;
                secondRoster.points += 3;
            }

            // setting proper places in groups
            standings = standings.sort((a, b) => (b.points - a.points));

            for (let i = 0; i < standings.length; i++) {
                if (standings[i + 1] && (standings[i].points === standings[i + 1].points)) {
                    // TODO tiebreaking system
                }
                standings[i].place = i + 1;
            }
            return this.groupStandingsRepository.save(standings);
        }
        if (format === TournamentFormat.SingleEliminationLadder) {
            // deciding the winner
            let winningRoster = null;
            if (match.winner === 1) {
                winningRoster = match.firstRoster;
            }
            if (match.winner === 2) {
                winningRoster = match.secondRoster;
            }
            const ladder = match.tournament.ladders.find((ladder) => ladder.isLosers = false);

            // setting next round for the winner
            const nextRound = match.round - 1;

            if (nextRound > 0) {
                // setting next match position
                let nextPosition: number;
                if (match.position % 2 === 0) {
                    nextPosition === match.position / 2;
                }
                if (match.position % 2 !== 0) {
                    nextPosition === (match.position + 1) / 2;
                }
                // promoting winner to the next stage
                const nextMatch = await this.getMatchByPosition(ladder.ladderId, nextRound, nextPosition);
                if (nextMatch.firstRoster === null) {
                    nextMatch.firstRoster === winningRoster;
                }
                if (nextMatch.secondRoster === null) {
                    nextMatch.secondRoster === winningRoster;
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
            let numberOfUpperRounds = await this.tournamentsService.getMaxRound(upperLadder.ladderId);
            let numberOfLowerRounds = await this.tournamentsService.getMaxRound(lowerLadder.ladderId);

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
                    losersRound = losersRounds[winnersRounds.findIndex(r => r === match.round)];

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
                    tournament.status = TournamentStatus.Finished;
                    await this.tournamentsRepository.save(tournament);
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
            console.log(`Winners next round ${winnersRound}`)
            console.log(`Winner next pos ${winnersPosition}`);
            console.log(`Next winners match ${nextWinnersMatch.matchId}\n`)
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
    }

    async getMatchByPosition(ladderId: number, round: number, position: number) {
        const match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .innerJoin(`match.ladder`, `ladder`)
            .leftJoinAndSelect(`match.firstTeam`, `firstTeam`)
            .leftJoinAndSelect(`match.secondTeam`, `secondTeam`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladderId })
            .andWhere(`match.position = :position`, { position: position })
            .andWhere(`match.round = :round`, { round: round })
            .getOne()
        return match;
    }

    async parseResults(matchId: number, results: Array<Express.Multer.File>, user: User) {
        const match = await this.getWithRelations(matchId);
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
        let senderTeam: Team;
        let otherTeam: Team;
        let firstTeamWins: number = 0;
        let secondTeamWins: number = 0;
        if (user.userId === match.firstTeam.captain.user.userId) {
            senderTeam = match.firstTeam;
            otherTeam = match.secondTeam;
        }
        if (user.userId === match.secondTeam.captain.user.userId) {
            senderTeam = match.secondTeam;
            otherTeam = match.firstTeam;
        }
        const client = new vision.ImageAnnotatorClient();
        for (let i = 0; i < results.length; i++) {
            let mapWinner: number;
            const [result] = await client.textDetection(results[i].path);
            const data: string = result.textAnnotations[0].description;
            const array = data.split(/[\n]+/);
            const timeRegex: RegExp = /\d{0,3}:\d{2}/;
            const mapResult = array[0].toLowerCase();
            console.log(mapResult)
            if (mapResult === `victory`) {
                mapWinner = senderTeam.teamId;
                firstTeamWins++;
            } else if (mapResult === 'defeat') {
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
                const regex = new RegExp("\\" + member, "i");
                for (let j = 0; j < array.length; j++) {
                    if (array[j].match(regex)) {
                        let statsArray = array[j + 1].split(/\D/);
                        statsArray = statsArray.filter(s => /\S/.test(s));
                        stats.push({
                            summonerName: member,
                            kills: parseInt(statsArray[0]),
                            deaths: parseInt(statsArray[1]),
                            assists: parseInt(statsArray[2])
                        });
                    }
                }
            });
            console.log(`id: ${matchId}, winner: ${mapWinner}, czas: ${mapTime}`)
            stats.forEach((s) => console.log(s))
            if (match.status !== MatchStatus.Resolving && match.status !== MatchStatus.Cancelled) {
                await this.createMap(matchId, mapWinner, mapTime, stats);
            }
            if (match.status === MatchStatus.Resolving) {
                await this.compareMaps(matchId, mapWinner, mapTime, stats, i + 1)
            }
        }
        if (firstTeamWins > secondTeamWins) {
            match.winner = 1;
        }
        else {
            match.winner = 2;
        }
        if (match.status !== MatchStatus.Resolving && match.status !== MatchStatus.Cancelled) {
            match.status = MatchStatus.Resolving;
        } else if (match.status === MatchStatus.Resolving) {
            match.status = MatchStatus.Finished;
        }
        await this.matchesRepository.save(match)
        return match.winner;
    }
}