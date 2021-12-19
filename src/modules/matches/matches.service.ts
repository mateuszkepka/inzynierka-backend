import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, ParticipatingTeam } from 'src/entities';
import { Repository } from 'typeorm';
import { TournamentsService } from '../tournaments/tournaments.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(ParticipatingTeam) private readonly participatingTeamsRepository: Repository<ParticipatingTeam>,
        private readonly tournamentService: TournamentsService,
    ) { }

    async getById(id: number) {
        const match = await this.matchesRepository.findOne({
            relations: [`maps`, `tournament`, `firstRoster`, `secondRoster`,
                `firstRoster.team`, `secondRoster.team`, `maps.performances`, `maps.performances.user`],
            where: { matchId: id },
        });
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
}
