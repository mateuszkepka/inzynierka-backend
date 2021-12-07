import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, User } from 'src/entities';
import { Repository } from 'typeorm';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
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
    private readonly usersService: UsersService,
    private readonly playersService: PlayersService,
    private readonly teamsService: TeamsService
  ) { }

  async create(createInvitationDto: CreateInvitationDto) {
    const { teamId, playerId } = createInvitationDto;
    const team = await this.teamsService.getById(teamId);
    const player = await this.playersService.getById(playerId);
    const ifInvited = await this.invitationsRepository
      .createQueryBuilder(`invitation`)
      .select(`status`)
      .where(`invitation.teamId = :teamId`, { teamId: teamId })
      .andWhere(`invitation.playerId = :playerId`, { playerId: playerId })
      .getOne();
    if (ifInvited?.status === InvitationStatus.Accepted) {
      throw new NotFoundException(`This player is already in the team`);
    }
    if (ifInvited?.status === InvitationStatus.Pending) {
      throw new NotFoundException(`This player is already invited to this team`);
    }
    const invitation = this.invitationsRepository.create({
      player: player,
      team: team
    });
    return await this.invitationsRepository.save(invitation);
  }

  async getById(id: number) {
    const invitation = await this.invitationsRepository.findOne({
      relations: [`player`],
      where: { invitationId: id }
    });
    if (!invitation) {
      throw new NotFoundException(`Invitation with this id doesn't exist`)
    }
    return invitation;
  }

  async findPending(status: InvitationStatus, request: RequestWithUser) {
    if (status === InvitationStatus.Pending) {
      const { user } = request;
      const invitation = await this.usersRepository
        .createQueryBuilder(`user`)
        .select(`invitation.invitationId`, `invitationId`)
        .addSelect(`player.playerId`, `playerId`)
        .addSelect(`player.summonerName`, `summonerName`)
        .addSelect(`team.teamId`, `teamId`)
        .addSelect(`team.name`, `teamName`)
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

  async update(id: number, updateInvitationDto: UpdateInvitationDto) {
    const invitation = await this.getById(id);
    if (invitation.status === updateInvitationDto.status) {
      throw new ForbiddenException(`You have already responded this invitation`);
    }
    invitation.status = updateInvitationDto.status;
    return await this.invitationsRepository.save(invitation);
  }

  async remove(id: number) {
    return 'ss'
    //return await this.invitationsRepository.delete(id);
  }
}
