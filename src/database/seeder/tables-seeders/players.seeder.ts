import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class PlayersSeeder {
    constructor(@InjectRepository(Player) private readonly usersRepository: Repository<Player>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.usersRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Player" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Player" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const player: Partial<Player> = {
                PUUID: faker.datatype.uuid(),
                accountId: faker.datatype.number(),
                summonerId: faker.datatype.number(),
                region: faker.address.country(),
            };
            const newPlayer = await this.usersRepository.create(player);
            await this.usersRepository.save(newPlayer);
        }
    }
}
