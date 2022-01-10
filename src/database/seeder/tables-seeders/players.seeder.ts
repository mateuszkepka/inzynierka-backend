import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Player, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { RegionsLoL } from 'src/modules/games/interfaces/regions';
import { Role } from 'src/roles/roles.enum';
import { getRandom, shuffle } from 'src/util';

@Injectable()
export class PlayersSeeder {
    constructor(
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) { }

    async seed(users: User[], game: Game) {
        const createdPlayers = [];
        const usersToUpdate = [];
        users = shuffle(users);
        for (let i = 0; i < users.length; i++) {
            const numberOfAccounts = getRandom([0.05, 0.65, 0.3], [0, 1, 2]);
            for (let j = 0; j < numberOfAccounts; j++) {
                let region = RegionsLoL.EUNE;
                if (j === 1) {
                    region = RegionsLoL.EUW;
                }
                const player = this.playersRepository.create({
                    summonerName: faker.internet.userName(),
                    region: region,
                    user: users[i],
                    game: game,
                });
                createdPlayers.push(player);
            }
            if (numberOfAccounts > 0) {
                users[i].roles.push(Role.Player);
                usersToUpdate.push(users[i]);
            }
        }
        await this.usersRepository.save(usersToUpdate);
        return this.playersRepository.save(createdPlayers);
    }
}
