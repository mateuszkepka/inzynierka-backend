import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, User } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { CreatePlayerDto } from './dto/create-player.dto';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async getById(playerId: number) {
        const player = await this.playersRepository.findOne(
            { playerId },
            { relations: [`ownedTeams`] },
        );
        if (player) {
            return player;
        }
        throw new NotFoundException(`Player with this id does not exist`);
    }
    //here we will need to add player field verification
    async create(player: CreatePlayerDto, request: RequestWithUser) {
        const { user } = request;
        const tmpPlayer = new Player();
        tmpPlayer.PUUID = player.PUUID;
        tmpPlayer.accountId = player.accountId;
        tmpPlayer.summonerId = player.summonerId;
        tmpPlayer.region = player.region;
        tmpPlayer.user = user;
        const newPlayer = await this.playersRepository.create(tmpPlayer);
        await this.playersRepository.save(newPlayer);
        return newPlayer;
    }

    async remove(id: number) {
        const player = await this.getById(id);
        if (!player) {
            throw new NotFoundException(`Player not found`);
        }
        return this.playersRepository.remove(player);
    }

    async getAll() {
        const players = await this.playersRepository
            .createQueryBuilder('player')
            .innerJoin('player.user', 'user')
            .leftJoin('player.game', 'game')
            .select(['player.summonerName', 'player.region',
                'user.userId', 'user.username', 'user.country', 'game.title'])
            .getMany();
        if (!players) {
            throw new NotFoundException('No players found');
        }
        return players;
    }

    async update(id: number, attributes: Partial<Player>) {
        const player = await this.getById(id);
        if (!player) {
            throw new NotFoundException(`Player not found`);
        }

        Object.assign(player, attributes);
        return this.playersRepository.save(player);
    }
}
