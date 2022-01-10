import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ladder, Map, Match, ParticipatingTeam, Performance, Team } from 'src/entities';
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
        @InjectRepository(Performance) private readonly performanceRepository: Repository<Performance>,
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
                `secondTeam.teamId`, `secondTeam.teamName`, `performance.user`
            ])
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
            const performance = this.performanceRepository.create({
                user: user,
                kills: raw.kills,
                deaths: raw.deaths,
                assists: raw.assists
            })
            return this.performanceRepository.save(performance);
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

    async resolveMatch(matchId: number, files: Array<Express.Multer.File>) {
        await this.parseResults(files);
        const match = await this.getById(matchId);
        const tournament = await this.tournamentsService.getById(match.tournament.tournamentId);
        const group = await this.tournamentsService.getGroupById(tournament.tournamentId);
        const format = tournament.format.name;
        if (format === TournamentFormat.SingleRoundRobin || format === TournamentFormat.DoubleEliminationLadder) {
            const firstRoster = group.standings.find(standing => standing.roster === match.firstRoster);
            const secondRoster = group.standings.find(standing => standing.roster === match.secondRoster);

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
            const standings = group.standings;
            standings.sort((a, b) => {
                if (a.points > b.points) {
                    return 1;
                }
                if (a.points < b.points) {
                    return -1;
                }
                return 0;
            })
            standings.forEach((standing, index) => {
                standing.place = index;
            })
            // TODO tiebreaking system
            const lookForTies = standings.reduce((previous, current) => {
                previous[current.points] = ++previous[current.points] || 0;
                return previous;
            }, {})
            const ties = standings.filter(e => lookForTies[e.points]);
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
            const standings = await this.tournamentsService.getStandingsByMatch(match);

            // setting next round for the winner
            const nextRound = standings.round - 1;

            if (nextRound > 0) {
                // setting next match position
                let nextPosition: number;
                if (standings.position % 2 === 0) {
                    nextPosition === standings.position / 2;
                }
                if (standings.position % 2 !== 0) {
                    nextPosition === (standings.position + 1) / 2;
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
            if (match.winner === 1) {
                winningRoster = match.firstRoster;
                losingRoster = match.secondRoster;
            }
            if (match.winner === 2) {
                winningRoster = match.secondRoster;
                losingRoster = match.firstRoster;
            }
            // getting upper and lower brackets
            const upperLadder = tournament.ladders.find((ladder) => ladder.isLosers = false);
            const lowerLadder = tournament.ladders.find((ladder) => ladder.isLosers = true);

            // getting position of the match in bracket
            const standings = await this.tournamentsService.getStandingsByMatch(match);

            // setting next match position
            let nextPosition: number;
            if (standings.position % 2 === 0) {
                nextPosition === standings.position / 2;
            }
            if (standings.position % 2 !== 0) {
                nextPosition === (standings.position + 1) / 2;
            }

            // when the match is in the upper bracket
            if (!standings.ladder.isLosers) {
                // setting next round for the winner
                const nextUpperRound = standings.round - 1;

                // promoting winner to the next stage
                if (nextUpperRound > 0) {
                    const nextMatch = await this.getMatchByPosition(upperLadder, nextUpperRound, nextPosition);
                    if (nextMatch.firstRoster === null) {
                        nextMatch.firstRoster === winningRoster;
                    }
                    if (nextMatch.secondRoster === null) {
                        nextMatch.secondRoster === winningRoster;
                    }
                    await this.matchesRepository.save(nextMatch);
                }

                // setting next round for the loser
                const nextLowerRound = standings.round;

                // demoting loser to the lower bracket
                if (nextLowerRound > 0) {
                    const nextMatch = await this.getMatchByPosition(lowerLadder, nextLowerRound, nextPosition);
                    if (nextMatch.firstRoster === null) {
                        nextMatch.firstRoster === losingRoster;
                    }
                    if (nextMatch.secondRoster === null) {
                        nextMatch.secondRoster === losingRoster;
                    }
                    await this.matchesRepository.save(nextMatch);
                }
            }
            // when the match is in the lower bracket
            if (standings.ladder.isLosers) {
                // setting next round for the winner
                const nextLowerRound = standings.round - 1;

                // promoting winner to the next stage
                if (nextLowerRound >= 0) {
                    const nextMatch = await this.getMatchByPosition(lowerLadder, nextLowerRound, nextPosition);
                    if (nextMatch.firstRoster === null) {
                        nextMatch.firstRoster === losingRoster;
                    }
                    if (nextMatch.secondRoster === null) {
                        nextMatch.secondRoster === losingRoster;
                    }
                    await this.matchesRepository.save(nextMatch);
                }
            }
        }
    }

    async getMatchByPosition(ladder: Ladder, round: number, position: number) {
        const match = await this.matchesRepository
            .createQueryBuilder(`match`)
            .innerJoin(`match.standings`, `standing`)
            .innerJoin(`standing.ladder`, `ladder`)
            .where(`ladder.ladderId = :ladderId`, { ladderId: ladder.ladderId })
            .andWhere(`standing.position = :position`, { position: position })
            .andWhere(`standing.round = :round`, { round: round })
            .getOne()
        return match;
    }

    async parseResults(files: Array<Express.Multer.File>) {
        // TODO
    }
}
