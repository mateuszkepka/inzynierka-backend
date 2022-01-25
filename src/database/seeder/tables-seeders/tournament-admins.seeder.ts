import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, TournamentAdmin, User } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class TournamentAdminSeeder {
    constructor(
        @InjectRepository(TournamentAdmin) private readonly tournamentAdminRepository: Repository<TournamentAdmin>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) { }

    async seed(numberOfRows: number, tournaments: Tournament[]) {
        const createdTournamentAdmins = [];
        //const organizers = 
        for (let i = 0; i < numberOfRows; ++i) {
            const tournamentAdmin: Partial<TournamentAdmin> = {
                tournament: tournaments[i],
            };
            const newTournamentAdmin = await this.tournamentAdminRepository.create(tournamentAdmin);
            createdTournamentAdmins.push(newTournamentAdmin);
            await this.tournamentAdminRepository.save(newTournamentAdmin);
        }
        return createdTournamentAdmins;
    }
}
