import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, PlayerTeam, Team } from 'src/entities';
import { Repository } from 'typeorm';
import { CreatePlayerTeam } from './dto/create-playerTeam.dto';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Player)
        private readonly playersRepository: Repository<Player>,
        @InjectRepository(PlayerTeam)
        private readonly playersTeamsRepository: Repository<PlayerTeam>,
    ) {}

    async getById(teamId: number) {
        const team = await this.teamsRepository.findOne({ teamId });
        if (team) {
            return team;
        }
        throw new NotFoundException(`Team with this id does not exist`);
    }

    async getByName(name: string) {
        const team = await this.teamsRepository.findOne({ name });
        if (team) {
            return team;
        }
        throw new NotFoundException(`Team with such name does not exist`);
    }
    async createInvitaion(playerTeamData: CreatePlayerTeam) {
        const playerId = playerTeamData.playerId;
        const teamId = playerTeamData.teamId;
        const player = await this.playersRepository.findOne({ playerId });
        const team = await this.teamsRepository.findOne({ teamId });
        const test = await this.playersTeamsRepository
            .createQueryBuilder(`player_team`)
            .innerJoinAndSelect(`player_team.team`, `team`)
            .innerJoinAndSelect(`player_team.player`, `player`)
            .where(`team.teamId = :id and player.playerId = :id2`, {
                id: teamId,
                id2: playerId,
            })
            .getOne();
        if (!player) {
            throw new NotFoundException(`Player with this id does not exists`);
        }
        if (!team) {
            throw new NotFoundException(`Team with this id does not exists`);
        }
        if (test) {
            throw new NotFoundException(`This player is already invited to this team`);
        }
        const tempPlayerTeam = new PlayerTeam();
        tempPlayerTeam.player = player;
        tempPlayerTeam.team = team;
        tempPlayerTeam.isAccepted = false;
        const playerTeam = await this.playersTeamsRepository.create(tempPlayerTeam);
        await this.playersTeamsRepository.save(playerTeam);
        return playerTeam;
    }

    async create(team: CreateTeamDto) {
        const player = await this.playersRepository.findOne(team.playerId);
        if (!player) {
            throw new NotFoundException(`You cant create a team without player account`);
        }
        const newTeam = new Team();
        newTeam.name = team.name;
        newTeam.creationDate = new Date();
        newTeam.captain = player;
        await this.teamsRepository.save(newTeam);
        return newTeam;
    }

    async remove(id: number) {
        const team = await this.getById(id);
        if (!team) {
            throw new NotFoundException(`Tournament not found`);
        }
        return this.teamsRepository.remove(team);
    }

    async getAllTeams() {
        const team = await this.teamsRepository.find({ relations: [`captain`] });
        const teams = JSON.stringify(team);
        if (!teams) {
            throw new NotFoundException(`Not even single team exists in the system`);
        }
        return teams;
    }

    async update(id: number, attributes: Partial<Team>) {
        const team = await this.getById(id);
        if (!team) {
            throw new NotFoundException(`Team not found`);
        }

        Object.assign(team, attributes);
        return this.teamsRepository.save(team);
    }
}
