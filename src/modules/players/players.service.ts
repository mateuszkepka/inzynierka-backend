import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team, User } from 'src/entities';
import { Brackets, Repository } from 'typeorm';
import { GamesService } from '../games/games.service';
import { RegionsLoL } from '../games/regions';
import { AddPlayerAccountDto } from './dto/create-player.dto';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        private readonly gamesService: GamesService,
    ) { }

    async getById(playerId: number) {
        const player = await this.playersRepository.findOne({
            relations: [`ownedTeams`],
            where: { playerId: playerId }
        });
        if (player) {
            return player;
        }
        throw new NotFoundException(`Player with this id does not exist`);
    }

    async create(playerDto: AddPlayerAccountDto, user: User) {
        const { summonerName, gameId, region } = playerDto;
        const game = await this.gamesService.getById(gameId);
        if (!Object.values(RegionsLoL).includes(region)) {
            throw new NotFoundException(`Wrong region provided`);
        }
        const player = this.playersRepository.create({ summonerName, region, user, game });
        return this.playersRepository.save(player);
    }

    async remove(id: number) {
        const player = await this.getById(id);
        if (!player) {
            throw new NotFoundException(`Player not found`);
        }
        return this.playersRepository.remove(player);
    }

    async getAllPlayers() {
        const players = await this.usersRepository
            .createQueryBuilder(`user`)
            .select(`user.userId`)
            .addSelect(`user.username`)
            .addSelect(`user.email`)
            .addSelect(`user.country`)
            .addSelect(`player.playerId`)
            .addSelect(`player.summonerName`)
            .addSelect(`game.title`)
            .innerJoin(`user.accounts`, `player`)
            .innerJoin(`player.game`, `game`)
            .getMany();
        if (!players) {
            throw new NotFoundException(`No players found`);
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
