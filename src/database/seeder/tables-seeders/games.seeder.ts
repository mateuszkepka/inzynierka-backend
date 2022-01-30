import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class GamesSeeder {
    constructor(@InjectRepository(Game) private readonly gamesRepository: Repository<Game>) {}

    async seed() {
        const game = this.gamesRepository.create({
            title: `League Of Legends`,
            genre: `MOBA`,
        });
        return this.gamesRepository.save(game);
    }
}