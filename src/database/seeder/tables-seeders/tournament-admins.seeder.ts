import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, TournamentAdmin, User } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class TournamentAdminSeeder {
    constructor(
        @InjectRepository(TournamentAdmin) private readonly tournamentAdminRepository: Repository<TournamentAdmin>,
    ) {}

    async seed(numberOfRows: number, tournaments: Tournament[], users: User[]) {
        const isSeeded = await this.tournamentAdminRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"TournamentAdmin" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "TournamentAdmin" table...`);
        const createdTournamentAdmins = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const tournamentAdmin: Partial<TournamentAdmin> = {
                tournament: tournaments[i],
                user: users[i],
            };

            const newTournamentAdmin = await this.tournamentAdminRepository.create(tournamentAdmin);
            createdTournamentAdmins.push(newTournamentAdmin);
            await this.tournamentAdminRepository.save(newTournamentAdmin);
        }
        return createdTournamentAdmins;
    }
}
