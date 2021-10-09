import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentsService {
    constructor(
        @InjectRepository(Tournament)
        private readonly tournamentsRepository: Repository<Tournament>,
    ) {}

    async getById(tournamentId: number) {
        const tournament = await this.tournamentsRepository.findOne({ tournamentId });
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`Tournament with this id does not exist`);
    }

    /*async getByOrganizer(organizer: User) {
        const tournament = await this.tournamentsRepository.findOne({ organizer });
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`User with this id does not exist`);
    } */

    async getByName(name: string) {
        const tournament = await this.tournamentsRepository.findOne({ name });
        if (tournament) {
            return tournament;
        }
        throw new NotFoundException(`Tournament with such name does not exist`);
    }

    async create(tournament: CreateTournamentDto) {
        const newTournament = await this.tournamentsRepository.create(tournament);
        await this.tournamentsRepository.save(newTournament);
        return newTournament;
    }

    async remove(id: number) {
        const tournament = await this.getById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament not found`);
        }
        return this.tournamentsRepository.remove(tournament);
    }

    async update(id: number, attributes: Partial<Tournament>) {
        const tournament = await this.getById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament not found`);
        }

        Object.assign(tournament, attributes);
        return this.tournamentsRepository.save(tournament);
    }
}
