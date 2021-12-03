import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, PlayerTeam, Team } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { AcceptPlayerInvitationDto } from './dto/accept-player-invitation.dto';
import { CreatePlayerTeam } from './dto/create-playerTeam.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { InvitationStatus } from './teams.interface';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(PlayerTeam) private readonly playersTeamsRepository: Repository<PlayerTeam>,
    ) { }

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

    async acceptPlayerInvitation(acceptData: AcceptPlayerInvitationDto, request: RequestWithUser) {
        const { user } = request;
        const playerList = await this.playersRepository
            .createQueryBuilder(`player_team`)
            .innerJoinAndSelect(`player_team.user`, `user`)
            .where(`user.userId= :id`, {
                id: user.userId,
            })
            .getMany();
        if (!playerList) {
            throw new NotFoundException(`You cant create a team without player account`);
        }
        const playerInvitaion = await this.playersTeamsRepository.findOne({
            where: { playerTeamId: acceptData.playerTeamId },
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
        if (playerInvitaion.invitationStatus === InvitationStatus.ACCEPTED) {
            throw new NotFoundException(`This invitation is already accepted`);
        }
        playerInvitaion.invitationStatus = InvitationStatus.ACCEPTED;
        this.playersTeamsRepository.save(playerInvitaion);
        return playerInvitaion;
    }

    async getPendingInvitations(request: RequestWithUser) {
        const { user } = request;
        const playerList = await this.playersRepository
            .createQueryBuilder(`player_team`)
            .innerJoinAndSelect(`player_team.user`, `user`)
            .where(`user.userId= :id`, {
                id: user.userId,
            })
            .getMany();
        if (!playerList) {
            throw new NotFoundException(`You cant browse invitations without player account`);
        }
        const invitaionList = [];
        for (const player of playerList) {
            const tmplist = await this.playersTeamsRepository
                .createQueryBuilder(`player_team`)
                .innerJoinAndSelect(`player_team.player`, `player`)
                .where(`player.playerId= :id and player_team.isAccepted = false`, {
                    id: player.playerId,
                })
                .getMany();
            invitaionList.push(tmplist);
        }
        let nullcheck = false;
        for (const entry of invitaionList) {
            if (!entry.playerTeamId) {
                break;
            } else nullcheck = true;
        }
        if (nullcheck) {
            throw new NotFoundException(`You have no pending invitations`);
        }

        const invList = JSON.stringify(invitaionList);
        return invList;
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
