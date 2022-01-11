import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupStanding, Ladder, Map, Match, ParticipatingTeam, Performance, Team } from 'src/entities';
import { Brackets, Repository } from 'typeorm';
import { TournamentFormat } from '../formats/dto/tournament-format-enum';
import { PlayersService } from '../players/players.service';
import { TeamsService } from '../teams/teams.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CreateStatsDto } from './dto/create-stats.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(GroupStanding) private readonly groupStandingsRepository: Repository<GroupStanding>,
        @InjectRepository(Performance) private readonly performancesRepository: Repository<Performance>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Map) private readonly mapsRepository: Repository<Map>,
        private readonly tournamentsService: TournamentsService,
        private readonly playersService: PlayersService,
        private readonly teamsService: TeamsService,
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
                `secondTeam.teamId`, `secondTeam.teamName`, `performance.user`,
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
            .leftJoinAndSelect(`performance.user`, `user`)
            .where(`match.matchId = :matchId`, { matchId: id })
            .getOne()
        if (!match) {
            throw new NotFoundException(`Match with this id doesn't exist`);
        }
        return match;
    }

    async getWithRelations(matchId: number) {
        const match = await this.matchesRepository.findOne({
            relations: [`group`, `tournament`, `firstRoster`, `secondRoster`, `firstTeam`, `secondTeam`, `ladder`],
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

    async create(createMatchDto: CreateMatchDto) {
        const tournament = await this.tournamentsService.getById(createMatchDto.tournamentId);
        const { firstRosterId, secondRosterId } = createMatchDto;
        var firstTeam: Team, secondTeam: Team = null;
        var firstRoster: ParticipatingTeam = null, secondRoster: ParticipatingTeam = null;
        if (firstRosterId) {
            firstRoster = await this.tournamentsService.getParticipatingTeamById(
                createMatchDto.firstRosterId,
            );
            firstTeam = await this.teamsService.getByParticipatingTeam(firstRoster.participatingTeamId);
        }
        if (secondRosterId) {
            secondRoster = await this.tournamentsService.getParticipatingTeamById(
                createMatchDto.secondRosterId,
            );
            secondTeam = await this.teamsService.getByParticipatingTeam(secondRoster.participatingTeamId);
        }
        if (firstRoster && secondRoster && (firstRoster.tournament.tournamentId !== secondRoster.tournament.tournamentId)) {
            throw new BadRequestException(`These two teams are not in the same tournament`);
        }
        const match = this.matchesRepository.create({
            tournament: tournament,
            firstRoster: firstRoster,
            secondRoster: secondRoster,
            firstTeam: firstTeam,
            secondTeam: secondTeam,
            ...createMatchDto
        })
        return await this.matchesRepository.save(match);
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

    async createMap(matchId: number, mapWinner: number, rawPerformances: CreateStatsDto[]) {
        const match = await this.getById(matchId);
        rawPerformances.forEach(async (raw) => {
            // TODO error handling
            const player = await this.playersService.getByNickname(raw.summonerName);
            const user = await this.playersService.getOwner(player.playerId);
            const performance = this.performancesRepository.create({
                user: user,
                kills: raw.kills,
                deaths: raw.deaths,
                assists: raw.assists
            })
            return this.performancesRepository.save(performance);
        })
        if (match.maps.length + 1 >= match.numberOfMaps) {
            return;
        }
        const map = this.mapsRepository.create({
            mapWinner: mapWinner,
            match: match
        })
        return this.mapsRepository.save(map);
    }

    async resolveMatch(matchId: number, winnerId: number, files: Array<Express.Multer.File>) {
        await this.parseResults(files);
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
                const nextMatch = await this.getMatchByPosition(ladder, nextRound, nextPosition);
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
                    winnersRound = match.round - 1;

                    losersLadder = lowerLadder;
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
                } else if (match.round < numberOfUpperRounds - 1 && match.round > 2) {
                    winnersLadder = upperLadder;
                    winnersRound = winnersRound - 1;
                    losersLadder = lowerLadder;

                    const maxLosersRound = await this.tournamentsService.getMaxRound(lowerLadder.ladderId);
                    const maxWinnersRound = await this.tournamentsService.getMaxRound(upperLadder.ladderId);
                    const maxPosition = await this.tournamentsService.getMaxPositionInRound(upperLadder.ladderId, match.round);

                    // array for storing rounds in upper bracket
                    const winnersRounds: number[] = [];
                    let winnersIterator = 2;
                    while (winnersRounds.length < maxWinnersRound) {
                        winnersRounds.push(winnersIterator++);
                    }

                    // array for storing rounds in lower bracket
                    const losersRounds: number[] = [];
                    let losersIterator = 1;
                    while (losersRounds.length < maxLosersRound) {
                        losersRounds.push(losersIterator += 2);
                    }

                    // array for flipping positions in lower bracket
                    let positions: number[] = [];
                    let positionsIterator = 1;
                    while (positions.length < maxPosition) {
                        positions.push(positionsIterator++);
                    }
                    const firstHalf = positions.slice(0, positions.length / 2).reverse();
                    const secondHalf = positions.slice(-positions.length / 2).reverse();
                    positions = firstHalf.concat(secondHalf);

                    if (match.position % 2 === 0) {
                        winnersPosition = match.position / 2;
                    }
                    if (match.position % 2 !== 0) {
                        winnersPosition = (match.position + 1) / 2;
                    }

                    // mapping round after loss in upper bracket to lower bracket
                    losersRound = losersRounds[winnersRounds.findIndex(r => r === match.round)];

                    // mapping position after loss in upper bracket to lower bracket
                    losersPosition = positions[positions.findIndex(p => p === match.position)];

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
                } else if (match.round < numberOfUpperRounds - 1 && match.round > 1) {
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
            const nextWinnersMatch = await this.getMatchByPosition(winnersLadder, winnersRound, winnersPosition);
            const nextLosersMatch = await this.getMatchByPosition(losersLadder, losersRound, losersPosition);
            if (nextWinnersMatch.secondTeam !== null) {
                nextWinnersMatch.firstTeam = winningTeam;
                nextWinnersMatch.firstRoster = winningRoster;
            } else if (nextWinnersMatch.firstTeam !== null) {
                nextWinnersMatch.secondTeam = winningTeam;
                nextWinnersMatch.secondRoster = winningRoster;
            }
            if (nextLosersMatch.secondTeam !== null) {
                nextLosersMatch.firstTeam = losingTeam;
                nextLosersMatch.firstRoster = losingRoster;
            } else if (nextLosersMatch.firstTeam !== null) {
                nextLosersMatch.secondTeam = losingTeam;
                nextLosersMatch.secondRoster = losingRoster;
            }
            await this.matchesRepository.save(nextWinnersMatch);
            if (nextLosersMatch) {
                await this.matchesRepository.save(nextLosersMatch);
            }
            console.log(`Wygrał ${winningTeam.teamName} id ${winningTeam.teamId}`);
            console.log(`Winners next round ${winnersRound}`)
            console.log(`Winner next pos ${winnersPosition}`);
            console.log(`Next winners match ${nextWinnersMatch.matchId}\n`)
            console.log(`Przegrał ${losingTeam.teamName} id ${losingTeam.teamId}`);
            console.log(`Losers next round ${losersRound}`)
            console.log(`Losers next pos ${losersPosition}`)
            console.log(`Next winners match ${nextLosersMatch.matchId}`)
        }
    }

    async getMatchByPosition(ladder: Ladder, round: number, position: number) {
        const match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .innerJoin(`match.ladder`, `ladder`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladder.ladderId })
            .andWhere(`match.position = :position`, { position: position })
            .andWhere(`match.round = :round`, { round: round })
            .getOne()
        return match;
    }

    async parseResults(files: Array<Express.Multer.File>) {
        // TODO
    }
}
