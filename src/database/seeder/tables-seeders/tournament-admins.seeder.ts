import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament, TournamentAdmin, User } from 'src/database/entities';
import { getRandom } from 'src/utils/tournaments-util';
import { Repository } from 'typeorm';

@Injectable()
export class TournamentAdminSeeder {
    constructor(
        @InjectRepository(TournamentAdmin) private readonly adminsRepository: Repository<TournamentAdmin>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) { }

    async seed(tournaments: Tournament[]) {
        const createdAdmins = [];
        const admins = await this.usersRepository.find();
        for (const tournament of tournaments) {
            const numberOfAdmins = getRandom([0.05, 0.05, 0.25, 0.25, 0.25, 0.25], [0, 1, 2, 3, 4, 5]);
            for (let i = 0; i < numberOfAdmins; i++) {
                const randomUser = admins[Math.floor(Math.random() * admins.length)];
                const admin = this.adminsRepository.create({
                    tournament: tournament,
                    user: randomUser
                });
                createdAdmins.push(admin);
            }
        }
        await this.adminsRepository.save(createdAdmins);
    }
}