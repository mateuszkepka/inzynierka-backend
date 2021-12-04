import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Game } from 'src/entities';

@Injectable()
export class GamesSeeder {
    constructor(@InjectRepository(Game) private readonly gamesRepository: Repository<Game>) { }

    async seed() {
        const isSeeded = await this.gamesRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Game" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Game" table...`);

        const game: Partial<Game> = {
            title: 'League Of Legends',
            genre: 'MOBA',
        };
        const newGame = await this.gamesRepository.create(game);
        await this.gamesRepository.save(newGame);

        return newGame;
    }
}
