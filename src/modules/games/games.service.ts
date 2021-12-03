import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class GamesService {
    constructor(@InjectRepository(Game) private readonly gamesRepository: Repository<Game>) {}

    getById(gameId: number) {
        const game = this.gamesRepository.findOne(gameId);
        if (!gameId) {
            throw new NotFoundException(`Game with given id does not exist`);
        }
        return game;
    }
}
