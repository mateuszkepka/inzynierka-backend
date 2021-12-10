import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, Player, Team, User } from 'src/entities';
import { Brackets, Connection, Repository } from 'typeorm';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { PlayersService } from '../players/players.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Invitation)
        private readonly invitationsRepository: Repository<Invitation>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        private readonly playersService: PlayersService,
        private readonly connection: Connection,
    ) {}

    async getAvailablePlayers(teamId: number, user: User) {
        const team = await this.getById(teamId);
        const players = await this.playersRepository
            .createQueryBuilder(`player`)
            .select(`player.playerId`)
            .addSelect(`player.summonerName`)
            .innerJoin(`player.user`, `user`)
            .innerJoin(`player.teams`, `invitation`)
            .innerJoin(`invitation.team`, `team`)
            .where(`user.userId != :userId`, { userId: user.userId })
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select(`player.playerId`)
                    .from(Player, `player`)
                    .innerJoin(`player.teams`, `invitation`)
                    .innerJoin(`invitation.team`, `team`)
                    .where(`team.teamId = :teamId`, { teamId: team.teamId })
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where(`invitation.status = :s1`, {
                                s1: InvitationStatus.Accepted,
                            }).orWhere(`invitation.status = :s2`, { s2: InvitationStatus.Pending });
                        }),
                    )
                    .getQuery();
                return `player.playerId NOT IN ` + subQuery;
            })
            .getMany();
        return players;
    }

    async getAll() {
        const teams = await this.teamsRepository.find({
            relations: [`captain`, `members`, `members.player`],
        });
        if (!teams) {
            throw new NotFoundException(`No teams found`);
        }
        return teams;
    }

    async getById(teamId: number) {
        const team = await this.teamsRepository.findOne({
            relations: [`captain`, `members`],
            where: { teamId: teamId },
        });
        if (!team) {
            throw new NotFoundException(`Team with given id does not exist`);
        }
        return team;
    }

    async getByName(name: string) {
        const team = await this.teamsRepository.findOne({
            where: { teamName: name },
        });
        if (!team) {
            throw new NotFoundException(`Team with given name does not exist`);
        }
        return team;
    }

    async getMembers(teamId: number) {
        const members = await this.teamsRepository
            .createQueryBuilder(`team`)
            .select(`user.userId`, `userId`)
            .addSelect(`user.username`, `username`)
            .addSelect(`player.playerId`, `playerId`)
            .addSelect(`player.summonerName`, `summonerName`)
            .addSelect(`invitation.invitationId`, `invitation`)
            .innerJoin(`team.members`, `invitation`)
            .innerJoin(`invitation.player`, `player`)
            .innerJoin(`player.user`, `user`)
            .where(`team.teamId = :id`, { id: teamId })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getRawMany();
        console.log(members);
        return members;
    }

    async create(createTeamDto: CreateTeamDto) {
        const captain = await this.playersService.getById(createTeamDto.captainId);
        const team = this.teamsRepository.create({
            teamName: createTeamDto.teamName,
            captain: captain,
        });
        return await this.connection.transaction(async (manager) => {
            await manager.save(team);
            const insertedTeam = await manager.findOne(Team, {
                teamName: team.teamName,
                creationDate: team.creationDate,
                captain: team.captain,
            });
            const invitation = this.invitationsRepository.create({
                player: captain,
                team: insertedTeam,
                status: InvitationStatus.Accepted,
            });
            await manager.save(invitation);
        });
    }

    async update(id: number, attrs: Partial<UpdateTeamDto>) {
        const team = await this.getById(id);
        const members = await this.getMembers(id);
        const captain = await this.playersService.getById(attrs.captainId);
        if (!members.some((member) => member.playerId === attrs.captainId)) {
            throw new BadRequestException(`Given player is not a member of the team`);
        }
        Object.assign(team, attrs);
        return this.teamsRepository.update(id, {
            teamName: attrs.teamName,
            captain: captain,
        });
    }

    async remove(id: number) {
        const team = await this.getById(id);
        return this.teamsRepository.remove(team);
    }
}
