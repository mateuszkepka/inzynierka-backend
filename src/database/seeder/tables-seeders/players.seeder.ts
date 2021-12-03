import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, Player, User } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class PlayersSeeder {
    constructor(@InjectRepository(Player) private readonly usersRepository: Repository<Player>) {}

    async seed(numberOfRows: number, users: User[], game: Game) {
        const isSeeded = await this.usersRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Player" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Player" table...`);
        const createdPlayers = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const player: Partial<Player> = {
                summonerName: faker.name.lastName(),
                PUUID: faker.datatype.uuid(),
                accountId: faker.datatype.number(),
                summonerId: faker.datatype.number(),
                region: faker.address.country(),
                user: users[i],
                game: game,
            };
            const newPlayer = await this.usersRepository.create(player);
            createdPlayers.push(newPlayer);
            await this.usersRepository.save(newPlayer);
        }
        return createdPlayers;
    }
}
