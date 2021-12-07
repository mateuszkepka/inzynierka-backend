import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, Team } from 'src/entities';
import { Connection, Repository } from 'typeorm';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { PlayersService } from '../players/players.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>,
        private readonly playersService: PlayersService,
        private readonly connection: Connection
    ) { }

    async getAll() {
        const teams = await this.teamsRepository.find({
            relations: [`captain`, `members`, `members.player`]
        });
        if (!teams) {
            throw new NotFoundException(`No teams found`);
        }
        return teams;
    }

    async getById(teamId: number) {
        const team = await this.teamsRepository.findOne(
            { teamId },
            { relations: [`captain`, `members`] });
        if (!team) {
            throw new NotFoundException(`Team with given id does not exist`);
        }
        return team;
    }

    async getByName(name: string) {
        const team = await this.teamsRepository.findOne({ name });
        if (!team) {
            throw new NotFoundException(`Team with given name does not exist`);
        }
        return team;
    }

    async getMembers(teamId: number) {
        const memberList = await this.teamsRepository
            .createQueryBuilder(`team`)
            .select(`user.userId`, `userId`)
            .addSelect(`user.username`, `username`)
            .addSelect(`player.playerId`, `playerId`)
            .addSelect(`player.summonerName`, `summonerName`)
            .innerJoin(`team.members`, `invitation`)
            .innerJoin(`invitation.player`, `player`)
            .innerJoin(`player.user`, `user`)
            .where(`team.teamId = :id`, { id: teamId })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getRawMany();
        return JSON.stringify(memberList);
    }

    async create(createTeamDto: CreateTeamDto) {
        const player = await this.playersService.getById(createTeamDto.playerId);
        const team = this.teamsRepository.create({
            name: createTeamDto.name,
            captain: player
        });
        return await this.connection.transaction(async manager => {
            await manager.save(team);
            const insertedTeam = await manager.findOne(Team, {
                name: team.name,
                creationDate: team.creationDate,
                captain: team.captain
            })
            const invitation = this.invitationsRepository.create({
                player: player,
                team: insertedTeam,
                status: InvitationStatus.Accepted
            });
            await manager.save(invitation);
        });
    }

    async update(id: number, teamData: UpdateTeamDto) {
        const captain = await this.playersService.getById(teamData.captainId);
        const captainId = teamData.captainId;
        const team = JSON.parse(await this.getMembers(id));
        if (!team.some(member => member.playerId === captainId)) {
            throw new BadRequestException(`Given player is not a member of the team`);
        }
        return this.teamsRepository.update(id, {
            name: teamData.name,
            captain: captain
        });
    }

    async remove(id: number) {
        const team = await this.getById(id);
        return this.teamsRepository.remove(team);
    }
}