import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly teamsService: TeamsService
  ) { }

  async getById(id: number) {
    const invitation = await this.invitationsRepository.findOne({
      relations: [`player`, `team`],
      where: { invitationId: id }
    });
    if (!invitation) {
      throw new NotFoundException(`Invitation with this id doesn't exist`)
    }
    return invitation;
  }

  async findPending(status: InvitationStatus, user: User) {
    if (status === InvitationStatus.Pending) {
      const invitation = await this.usersRepository
        .createQueryBuilder(`user`)
        .select(`invitation.invitationId`, `invitationId`)
        .addSelect(`player.playerId`, `playerId`)
        .addSelect(`player.summonerName`, `summonerName`)
        .addSelect(`team.teamId`, `teamId`)
        .addSelect(`team.teamName`, `teamName`)
        .innerJoin(`user.accounts`, `player`)
        .innerJoin(`player.teams`, `invitation`)
        .innerJoin(`invitation.team`, `team`)
        .where(`user.userId = :userId`, { userId: user.userId })
        .andWhere(`invitation.status = :status`, { status: InvitationStatus.Pending })
        .getRawMany()
      return JSON.stringify(invitation);
    } else {
      throw new NotFoundException()
    }
  }

  async create(createInvitationDto: CreateInvitationDto) {
    const { teamId, playerId } = createInvitationDto;
    const team = await this.teamsService.getById(teamId);
    const player = await this.playersService.getById(playerId);
    const ifInvited = await this.invitationsRepository.findOne({
      where: { team: team, player: player }
    })
    if (ifInvited?.status === InvitationStatus.Accepted) {
      throw new NotFoundException(`This player is already in the team`);
    }
    if (ifInvited?.status === InvitationStatus.Pending) {
      throw new NotFoundException(`This player is already invited to this team`);
    }
    if (ifInvited?.status === InvitationStatus.Refused) {
      await this.invitationsRepository.update(ifInvited.invitationId, {
        invitationId: ifInvited.invitationId,
        status: InvitationStatus.Pending
      });
      return this.getById(ifInvited.invitationId);
    }
    const invitation = this.invitationsRepository.create({
      player: player,
      team: team
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
    const teams = await this.usersService.getTeams(user.userId);
    if (Object.keys(teams).length === 0) {
      console.log(`bez teamu`)
      throw new BadRequestException();
    }
    console.log(invitation);
    // TEAM WHICH INVITATION IS ABOUT
    const teamOnInvitation = await this.teamsService.getById(invitation.team.teamId)
    if (!teams.some(team => team.teamId === teamOnInvitation.teamId)) {
      console.log(`to nie jest team wysylajacego request`)
      throw new BadRequestException();
    }
    // ACCOUNTS OF THE USER WHO SENDS REQUEST
    const accounts = await this.usersService.getAccounts(user.userId);
    // PLAYER TO BE DELETED FROM THE TEAM
    
    const playerOnInvitation = await this.playersService.getById(invitation.player.playerId)
    //const owner = await this.playersService.getOwner(invitation.player.playerId)
    if (accounts.some(account => account.ownedTeams.some(team => team.teamId === teamOnInvitation.teamId))) {
      console.log(`typ ownuje team`)
      // INVITATION IS NOT ACCEPTED = THE PLAYER IS NOT A TEAM MEMBER
      if (invitation.status === InvitationStatus.Refused) {
        console.log(`typ odrzucil zapro`)
        throw new BadRequestException();
      }
      // CAPTAIN CANNOT KICK HIMSELF
      if (playerOnInvitation) {
        console.log(`lota od admina`)
        return this.invitationsRepository.remove(invitation);
      }
    }
    if (playerOnInvitation.user.userId !== user.userId) {
      console.log(`typ jest w teamie ale próbuje wyjebac innego, a nie jest kapitanem`)
      throw new BadRequestException();
    }
    return this.invitationsRepository.remove(invitation);
  }
}
