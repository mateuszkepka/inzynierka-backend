import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, Match, Player, Team, User } from 'src/entities';
import { Brackets, Connection, Repository } from 'typeorm';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { MatchQueryDto } from '../matches/dto/get-matches.dto';
import { PlayersService } from '../players/players.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
    constructor(
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Invitation) private readonly invitationsRepository: Repository<Invitation>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        private readonly playersService: PlayersService,
        private readonly connection: Connection,
    ) { }

    async getAll() {
        const teams = await this.teamsRepository.find({
            relations: [`captain`],
        });
        if (!teams) {
            throw new NotFoundException(`No teams found`);
        }
        return teams;
    }

    async getById(teamId: number) {
        const team = await this.teamsRepository.findOne({
            relations: [`captain`, `captain.game`],
            where: { teamId: teamId },
        });
        if (!team) {
            throw new NotFoundException(`Team with given id does not exist`);
        }
        return team;
    }

    async getByName(teamName: string) {
        const team = await this.teamsRepository.findOne({
            where: { teamName: teamName },
        });
        if (!team) {
            throw new NotFoundException(`Team with given name does not exist`);
        }
        return team;
    }

    async getMembers(teamId: number) {
        const members = await this.playersRepository
            .createQueryBuilder(`player`)
            .innerJoinAndSelect(`player.teams`, `invitation`)
            .innerJoinAndSelect(`invitation.team`, `team`)
            .innerJoinAndSelect(`team.game`, `game`)
            .innerJoinAndSelect(`player.user`, `user`)
            .where(`team.teamId = :id`, { id: teamId })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getMany()
        if (members.length === 0) {
            throw new NotFoundException(`This team has no members`)
        }
        return members;
    }

    async getAvailablePlayers(teamId: number, user: User) {
        const team = await this.getById(teamId);
        const players = await this.playersRepository
            .createQueryBuilder(`player`)
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
                            qb.where(`invitation.status = :s1`, { s1: InvitationStatus.Accepted })
                                .orWhere(`invitation.status = :s2`, { s2: InvitationStatus.Pending });
                        }))
                    .getQuery();
                return `player.playerId NOT IN ` + subQuery;
            }).getMany();
        if (players.length === 0) {
            throw new NotFoundException(`No players to invite found`)
        }
        return players;
    }

    async getMatchesByTeams(teamId: number, queryParams: MatchQueryDto) {
        await this.getById(teamId);
        const queryBuilder = this.matchesRepository
            .createQueryBuilder(`match`)
            .innerJoinAndSelect(`match.firstRoster`, `firstRoster`)
            .innerJoinAndSelect(`match.secondRoster`, `secondRoster`)
            .innerJoinAndSelect(`firstRoster.team`, `firstTeam`)
            .innerJoinAndSelect(`secondRoster.team`, `secondTeam`)
            .where(`firstTeam.teamId = :teamId OR secondTeam.teamId = :teamId`, { teamId: teamId })
        if (queryParams?.status && queryParams.status !== null) {
            queryBuilder.andWhere(`match.status = :status`, { status: queryParams.status })
        }
        const matches = await queryBuilder.getMany();
        if (matches.length === 0) {
            throw new NotFoundException(`No matches found`)
        }
        return matches;
    }

    async create(createTeamDto: CreateTeamDto) {
        const captain = await this.playersService.getById(createTeamDto.playerId);
        const team = this.teamsRepository.create({
            teamName: createTeamDto.teamName,
            captain: captain,
            region: captain.region
        });
        await this.connection.transaction(async manager => {
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
        return team;
    }

    async update(teamId: number, attrs: Partial<UpdateTeamDto>) {
        const team = await this.getById(teamId);
        const members = await this.getMembers(teamId);
        const captain = await this.playersService.getById(attrs.captainId);
        if (!members.some(member => member.playerId === attrs.captainId)) {
            throw new BadRequestException(`Given player is not a member of the team`);
        }
        Object.assign(team, attrs);
        return this.teamsRepository.update(teamId, {
            teamName: attrs.teamName,
            captain: captain
        });
    }

    async remove(teamId: number) {
        const team = await this.getById(teamId);
        return this.teamsRepository.remove(team);
    }
}