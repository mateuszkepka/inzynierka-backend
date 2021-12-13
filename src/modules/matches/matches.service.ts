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
        @InjectRepository(ParticipatingTeam)
        private readonly participatingTeamsRepository: Repository<ParticipatingTeam>,
        private readonly tournamentService: TournamentsService,
    ) {}

    async getById(id: number) {
        const match = await this.matchesRepository.findOne({
            relations: [`maps`, `tournament`, `firstRoster`, `secondRoster`],
            where: { matchId: id },
        });
        if (!match) {
            throw new NotFoundException(`Match with this id doesn't exist`);
        }
        return match;
    }

    async getAll() {
        const matches = await this.matchesRepository.find({
            relations: [`maps`, `tournament`],
        });
        if (!matches) {
            throw new NotFoundException(`No teams found`);
        }
        return matches;
    }

    async create(createMatchDto: CreateMatchDto) {
        const tournament = await this.tournamentService.getById(createMatchDto.tournamentId);
        const firstRoster = await this.tournamentService.getParticipatingTeam(
            createMatchDto.firstRosterId,
        );
        const secondRoster = await this.tournamentService.getParticipatingTeam(
            createMatchDto.secondRosterId,
        );
        if (firstRoster.tournament.tournamentId !== secondRoster.tournament.tournamentId) {
            throw new BadRequestException(`This two teams are not in the same Tournament`);
        }
        const match = new Match();
        match.tournament = tournament;
        match.firstRoster = firstRoster;
        match.secondRoster = secondRoster;
        match.tournamentStage = createMatchDto.tournamentStage;
        match.matchStartDate = createMatchDto.matchStartDate;
        match.matchEndDate = null;
        match.matchResult = null;
        match.numberOfMaps = null;
        match.numberOfMaps = createMatchDto.numberOfMaps;
        return await this.matchesRepository.save(match);
    }

    async update(id: number, attrs: Partial<UpdateMatchDto>) {
        console.log(attrs);
        const match = await this.getById(id);
        let firstRoster = null;
        if (attrs.firstRosterId) {
            firstRoster = await this.tournamentService.getParticipatingTeam(attrs.firstRosterId);
        }
        console.log(firstRoster);
        let secondRoster = null;
        if (attrs.secondRosterId) {
            secondRoster = await this.tournamentService.getParticipatingTeam(attrs.secondRosterId);
        }
        console.log(secondRoster);
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
