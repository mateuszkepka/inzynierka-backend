import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, User } from 'src/entities';
import { Repository } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { TeamsService } from '../teams/teams.service';
import { UsersService } from '../users/users.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationStatus } from './interfaces/invitation-status.enum';

@Injectable()
export class InvitationsService {
    constructor(
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly playersService: PlayersService,
        private readonly usersService: UsersService,
        private readonly teamsService: TeamsService,
    ) { }

    async getById(id: number) {
        const invitation = await this.invitationsRepository.findOne({
            relations: [`player`, `team`, `player.game`],
            where: { invitationId: id },
        });
        if (!invitation) {
            throw new NotFoundException(`Invitation with this id doesn't exist`);
        }
        return invitation;
    }

    async getFiltered(status: InvitationStatus, user: User) {
        if (status === InvitationStatus.Pending) {
            const invitation = await this.invitationsRepository
                .createQueryBuilder(`invitation`)
                .innerJoinAndSelect(`invitation.player`, `player`)
                .innerJoinAndSelect(`invitation.team`, `team`)
                .innerJoinAndSelect(`player.user`, `user`)
                .where(`user.userId = :userId`, { userId: user.userId })
                .andWhere(`invitation.status = :status`, { status: InvitationStatus.Pending })
                .getMany();
            if (invitation.length === 0) {
                throw new NotFoundException(`You have no pending invitations`);
            }
            return invitation;
        } else {
            throw new NotFoundException();
        }
    }

    async create(createInvitationDto: CreateInvitationDto) {
        const { teamId, playerId } = createInvitationDto;
        const team = await this.teamsService.getById(teamId);
        const player = await this.playersService.getById(playerId);
        if (player.region !== team.region) {
            throw new BadRequestException(`The invited player has to be from the same region`);
        }
        const ifInvited = await this.invitationsRepository.findOne({
            where: { team: team, player: player },
        });
        if (ifInvited?.status === InvitationStatus.Accepted) {
            throw new NotFoundException(`This player is already in the team`);
        }
        if (ifInvited?.status === InvitationStatus.Pending) {
            throw new NotFoundException(`This player is already invited to this team`);
        }
        if (ifInvited?.status === InvitationStatus.Refused) {
            await this.invitationsRepository.update(ifInvited.invitationId, {
                invitationId: ifInvited.invitationId,
                status: InvitationStatus.Pending,
            });
            return this.getById(ifInvited.invitationId);
        }
        const invitation = this.invitationsRepository.create({
            player: player,
            team: team,
        });
        return await this.invitationsRepository.save(invitation);
    }

    async update(id: number, attrs: Partial<UpdateInvitationDto>) {
        const invitation = await this.getById(id);
        if (invitation.status === attrs.status) {
            throw new BadRequestException(`You have already responded this invitation`);
        }
        Object.assign(invitation, attrs);
        return await this.invitationsRepository.save(invitation);
    }

    async remove(id: number, user: User) {
        const invitation = await this.getById(id);
        // TEAMS OF THE USER WHO SENDS REQUEST
        var teams = []
        try {
            teams = await this.usersService.getTeams(user.userId);
        } catch (ignore) {
            throw new ForbiddenException(`You are not a team member`);
        }
        // THE TEAM WHICH INVITATION IS ABOUT
        const teamOnInvitation = await this.teamsService.getById(invitation.team.teamId);
        if (!(teams.some((team) => team.teamId === teamOnInvitation.teamId))) {
            throw new ForbiddenException(`You are not a team member`);
        }
        // ACCOUNTS OF THE USER WHO SENDS REQUEST
        const accounts = await this.usersService.getAccounts(user.userId);
        // A PLAYER TO BE DELETED FROM THE TEAM
        const playerOnInvitation = await this.playersService.getById(invitation.player.playerId);
        // CHECKING IF THE USER IS THE TEAM'S CAPTAIN
        if (accounts.some((account) => account.playerId === teamOnInvitation.captain.playerId)) {
            // INVITATION IS NOT ACCEPTED = THE PLAYER IS NOT A TEAM MEMBER
            if (invitation.status === InvitationStatus.Refused) {
                throw new BadRequestException(`The player is not a team member`);
            }
            // A CAPTAIN CANNOT KICK HIMSELF
            if (playerOnInvitation) {
                throw new ForbiddenException(`You can not kick a team's captain`)
            }
            // THE CAPTAIN KICKS A TEAM MEMBER
            return this.invitationsRepository.remove(invitation);
        }
        // A USER IS NOT A CAPTAIN AND IS TRYING TO KICK ANOTHER MEMBER
        if (playerOnInvitation.user.userId !== user.userId) {
            throw new ForbiddenException(`Only captain's can kick players`);
        }
        // PLAYER LEAVING THE TEAM
        return this.invitationsRepository.remove(invitation);
    }
}
