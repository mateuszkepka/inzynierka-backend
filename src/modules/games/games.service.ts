import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/database/entities';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
    constructor(@InjectRepository(Game) private readonly gamesRepository: Repository<Game>) {}

    async getById(gameId: number) {
        const game = await this.gamesRepository.findOne({ where: { gameId: gameId } });
        if (!game) {
            throw new NotFoundException(`Game with given id does not exist`);
        }
        return game;
    }

    async getAll() {
        const games = await this.gamesRepository.find({});
        if (games.length === 0) {
            throw new NotFoundException(`No Games found`);
        }
        return games;
    }

    async create(createGameDto: CreateGameDto) {
        const game = new Game();
        const checktitle = await this.gamesRepository.findOne({
            where: { title: createGameDto.title },
        });
        if (checktitle) {
            throw new BadRequestException(`Game with that name already exists`);
        }
        game.title = createGameDto.title;
        game.genre = createGameDto.genre;
        return await this.gamesRepository.save(game);
    }

    async update(gameId: number, attrs: Partial<UpdateGameDto>) {
        const checktitle = await this.gamesRepository.findOne({ where: { title: attrs.title } });
        if (checktitle) {
            throw new BadRequestException(`Game with that name already exists`);
        }
        const game = await this.getById(gameId);
        Object.assign(game, attrs);
        return this.gamesRepository.save(game);
    }
}
