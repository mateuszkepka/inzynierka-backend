import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Map, Match, ParticipatingTeam, Performance } from 'src/entities';
import { Connection, Repository } from 'typeorm';
import { TournamentsService } from '../tournaments/tournaments.service';
import { UsersService } from '../users/users.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CreateStatsDto } from './dto/create-stats.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Performance) private readonly performanceRepository: Repository<Performance>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Map) private readonly mapsRepository: Repository<Map>,
        private readonly tournamentService: TournamentsService,
        private readonly usersService: UsersService,
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
            .innerJoin(`match.tournament`, `tournament`)
            .innerJoin(`match.firstRoster`, `firstRoster`)
            .innerJoin(`match.secondRoster`, `secondRoster`)
            .innerJoin(`firstRoster.team`, `firstTeam`)
            .innerJoin(`secondRoster.team`, `secondTeam`)
            .innerJoinAndSelect(`match.maps`, `map`)
            .innerJoinAndSelect(`map.performances`, `performance`)
            .innerJoinAndSelect(`performance.user`, `user`)
            .where(`match.matchId = :matchId`, { matchId: id })
            .getOne()
        if (!match) {
            throw new NotFoundException(`Match with this id doesn't exist`);
        }
        return match;
    }

    async create(createMatchDto: CreateMatchDto) {
        const tournament = await this.tournamentService.getById(createMatchDto.tournamentId);
        const { firstRosterId, secondRosterId } = createMatchDto;
        var firstRoster: ParticipatingTeam = null;
        var secondRoster: ParticipatingTeam = null;
        if (firstRosterId) {
            firstRoster = await this.tournamentService.getParticipatingTeam(
                createMatchDto.firstRosterId,
            );
        }
        if (secondRosterId) {
            secondRoster = await this.tournamentService.getParticipatingTeam(
                createMatchDto.secondRosterId,
            );
        }
        if (firstRoster && secondRoster && (firstRoster.tournament.tournamentId !== secondRoster.tournament.tournamentId)) {
            throw new BadRequestException(`These two teams are not in the same tournament`);
        }
        const match = this.matchesRepository.create({
            tournament: tournament,
            firstRoster: firstRoster,
            secondRoster: secondRoster,
            ...createMatchDto
        })
        return await this.matchesRepository.save(match);
    }

    async update(id: number, attrs: Partial<UpdateMatchDto>) {
        const match = await this.getById(id);
        let firstRoster = null;
        if (attrs.firstRosterId) {
            firstRoster = await this.tournamentService.getParticipatingTeam(attrs.firstRosterId);
        }
        let secondRoster = null;
        if (attrs.secondRosterId) {
            secondRoster = await this.tournamentService.getParticipatingTeam(attrs.secondRosterId);
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

    async createMap(matchId: number, mapWinner: number) {
        const match = await this.getById(matchId);
        if (match.maps.length + 1 >= match.numberOfMaps) {
            return;
        }
        const map = this.mapsRepository.create({
            mapWinner: mapWinner,
            match: match
        })
        return this.mapsRepository.save(map);
    }

    async createPerformance(mapId: number, stats: CreateStatsDto) {
        const map = await this.mapsRepository.findOneOrFail({ where: { mapId: mapId } });
        if (!map) {
            throw new NotFoundException(`Map with given id does not exist`);
        }
        const user = await this.usersService.getById(stats.userId);
        const performance = this.performanceRepository.create({
            user: user,
            map: map,
            ...stats
        })
        return this.performanceRepository.save(performance);
    }
}
