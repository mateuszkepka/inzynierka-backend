import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, User } from 'src/entities';
import { Role } from 'src/roles/roles.enum';
import { Connection, Repository } from 'typeorm';
import { GamesService } from '../games/games.service';
import { RegionsLoL } from '../games/interfaces/regions';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly gamesService: GamesService,
        private readonly connection: Connection,
    ) {}

    async getAll() {
        const players = await this.playersRepository.find({
            relations: [`game`, `user`],
        });
        if (players.length === 0) {
            throw new NotFoundException(`No players found`);
        }
        return players;
    }

    async getById(playerId: number) {
        const player = await this.playersRepository.findOne({
            relations: [`game`, `user`],
            where: { playerId: playerId },
        });
        if (!player) {
            throw new NotFoundException(`Player with this id does not exist`);
        }
        return player;
    }

    async getByNickname(nickname: string) {
        const player = await this.playersRepository.findOne({
            relations: [`game`],
            where: { summonerName: nickname },
        });
        return player;
    }

    async getOwner(playerId: number) {
        const owner = await this.usersRepository
            .createQueryBuilder(`user`)
            .innerJoin(`user.accounts`, `player`)
            .where(`player.playerId = :playerId`, { playerId: playerId })
            .getOne();
        return owner;
    }

    async create(body: AddPlayerAccountDto, user: User) {
        const { summonerName, gameId, region } = body;
        const ifExists = await this.getByNickname(summonerName);
        if (ifExists) {
            throw new BadRequestException(`This summoner name is already taken!`);
        }
        const game = await this.gamesService.getById(gameId);
        if (!Object.values(RegionsLoL).includes(region)) {
            throw new NotFoundException(`Wrong region provided`);
        }
        await this.connection.transaction(async (manager) => {
            const player = this.playersRepository.create({
                ...body,
                game: game,
                user: user,
            });
            if (!user.roles.includes(Role.Player)) {
                user.roles.push(Role.Player);
                await manager.save(user);
            }
            await manager.save(player);
        });
        return this.getByNickname(summonerName);
    }

    async update(id: number, attributes: Partial<UpdatePlayerDto>) {
        const player = await this.getById(id);
        Object.assign(player, attributes);
        return this.playersRepository.save(player);
    }

    async remove(id: number) {
        const player = await this.getById(id);
        return this.playersRepository.remove(player);
    }
}
