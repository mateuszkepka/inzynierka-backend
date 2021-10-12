import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
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

    async create(team: CreateTeamDto) {
        const newTeam = await this.teamsRepository.create(team);
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
        const team = await this.teamsRepository.find();
        const teams = JSON.stringify(team);
        if (teams == null) {
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
