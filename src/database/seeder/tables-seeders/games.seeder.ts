import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Game, Tournament } from 'src/entities';

@Injectable()
export class GamesSeeder {
    constructor(@InjectRepository(Game) private readonly gamesRepository: Repository<Game>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.gamesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Game" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Game" table...`);
        const createdGames = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const game: Partial<Game> = {
                title: faker.name.findName(),
                genre: faker.music.genre(),
            };
            const newGame = await this.gamesRepository.create(game);
            createdGames.push(newGame);
            await this.gamesRepository.save(newGame);
        }

        return createdGames;
    }
}
