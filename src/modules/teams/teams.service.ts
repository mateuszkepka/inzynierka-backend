import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Invitation, Team, User } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptPlayerInvitationDto } from './dto/accept-player-invitation.dto';
import { CreateInvitation } from './dto/create-invitation.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { InvitationStatus } from './interfaces/teams.interface';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Invitation) private readonly playersTeamsRepository: Repository<Invitation>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) { }

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

    async getById(teamId: number) {
        const team = await this.teamsRepository.findOne(
            { teamId },
            { relations: [`captain`, `members`] });
        if (!team) {
            throw new NotFoundException(`Team with this id does not exist`);
        }
        return team;
    }

    async getByName(name: string) {
        const team = await this.teamsRepository.findOne({ name });
        if (team) {
            return team;
        }
        throw new NotFoundException(`Team with such name does not exist`);
    }
    async createInvitaion(invitationData: CreateInvitation) {
        const playerId = invitationData.playerId;
        const teamId = invitationData.teamId;
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
        const tempInvitation = new Invitation();
        tempInvitation.player = player;
        tempInvitation.team = team;
        const invitation = await this.playersTeamsRepository.create(tempInvitation);
        await this.playersTeamsRepository.save(invitation);
        return invitation;
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

    async acceptPlayerInvitation(acceptData: AcceptPlayerInvitationDto, request: RequestWithUser) {
        const { user } = request;
        const playerList = await this.playersRepository
            .createQueryBuilder(`player_team`)
            .innerJoinAndSelect(`player_team.user`, `user`)
            .where(`user.userId= :id`, { id: user.userId })
            .getMany();
        if (!playerList) {
            throw new NotFoundException(`You cant create a team without player account`);
        }
        const playerInvitaion = await this.playersTeamsRepository.findOne({
            where: { invitationId: acceptData.invitationId },
            relations: [`player`],
        });
        if (!playerInvitaion) {
            throw new NotFoundException(`Invitation with this id was to found`);
        }
        let check = false;
        for (const player of playerList) {
            if (player.playerId === playerInvitaion.player.playerId) {
                check = true;
            }
        }
        if (!check) {
            throw new NotFoundException(`You dont have permission to accept this invitation`);
        }
        if (playerInvitaion.status === InvitationStatus.Accepted) {
            throw new NotFoundException(`This invitation is already accepted`);
        }
        playerInvitaion.status = InvitationStatus.Accepted;
        this.playersTeamsRepository.save(playerInvitaion);
        return playerInvitaion;
    }

    async getPendingInvitations(request: RequestWithUser) {
        const { user } = request;
        const playerList = await this.playersRepository
            .createQueryBuilder(`player_team`)
            .innerJoinAndSelect(`player_team.user`, `user`)
            .where(`user.userId= :id`, { id: user.userId })
            .getMany();
        if (!playerList) {
            throw new NotFoundException(`You can not browse invitations without player account`);
        }
        const invitationList = [];
        for (const player of playerList) {
            const tmpList = await this.playersTeamsRepository
                .createQueryBuilder(`player_team`)
                .innerJoinAndSelect(`player_team.team`, `team`)
                .where(`player_team.playerId = :id`, { id: player.playerId })
                .andWhere(`player_team.invitationStatus = :status`, { status: InvitationStatus.Pending })
                .getMany();
            if (tmpList.length === 0) {
                throw new NotFoundException(`You have no pending invitations`);
            }
            invitationList.push(tmpList);
        }
        return JSON.stringify(invitationList);
    }

    async remove(id: number) {
        const team = await this.getById(id);
        if (!team) {
            throw new NotFoundException(`Tournament not found`);
        }
        return this.teamsRepository.remove(team);
    }

    async getAllTeams() {
        const team = await this.teamsRepository.find({
            relations: [`captain`, `members`]
        });
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