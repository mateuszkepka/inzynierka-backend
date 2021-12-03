import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team, User } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { GamesService } from '../games/games.service';
import { RegionsLoL } from '../games/regions';
import { GetAvailablePlayersDto } from './dto/get-available-players.dto';
import { AddPlayerAccountDto } from './dto/create-player.dto';

@Injectable()
export class PlayersService {
    constructor(
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly gamesService: GamesService,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
    ) {}

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
    async getAvailablePlayers(teamdata: GetAvailablePlayersDto, request: RequestWithUser) {
        // const players = await this.playersRepository.find({
        //     where: {},
        //     relations: [`playerTeams`],
        // });
        const players = await this.teamsRepository.find({
            where: { teamId: teamdata.teamId },
            relations: [`playerTeams`],
        });
        return players;
    }

    async create(playerDto: AddPlayerAccountDto, request: RequestWithUser) {
        const { user } = request;
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
