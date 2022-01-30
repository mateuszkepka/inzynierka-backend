import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, Match, Player, Team, User } from 'src/database/entities';
import { Brackets, Connection, Repository } from 'typeorm';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { MatchStatus } from '../matches/interfaces/match-status.enum';
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
        let team = await this.teamsRepository.findOne({
            relations: [`captain`, `captain.game`],
            where: { teamId: teamId },
        });
        if (!team) {
            throw new NotFoundException(`Team with given id does not exist`);
        }
        return team;
    }

    async getMembers(teamId: number) {
        await this.getById(teamId);
        const members = await this.playersRepository
            .createQueryBuilder(`player`)
            .addSelect(`user.userId`)
            .addSelect(`user.username`)
            .innerJoinAndSelect(`player.teams`, `invitation`)
            .innerJoinAndSelect(`invitation.team`, `team`)
            .innerJoinAndSelect(`team.game`, `game`)
            .innerJoin(`player.user`, `user`)
            .where(`team.teamId = :id`, { id: teamId })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getMany();
        if (members.length === 0) {
            throw new NotFoundException(`This team has no members`);
        }
        return members;
    }

    async getAvailablePlayers(teamId: number, user: User) {
        const team = await this.getById(teamId);
        const players = await this.playersRepository
            .createQueryBuilder(`player`)
            .innerJoin(`player.user`, `user`)
            .leftJoin(`player.teams`, `invitation`)
            .leftJoin(`invitation.team`, `team`)
            .where(`user.userId != :userId`, { userId: user.userId })
            .andWhere(`player.region = :region`, { region: team.region })
            .andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select(`player.playerId`)
                    .from(Player, `player`)
                    .leftJoin(`player.teams`, `invitation`)
                    .leftJoin(`invitation.team`, `team`)
                    .where(`team.teamId = :teamId`, { teamId: team.teamId })
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where(`invitation.status = :s1`, {
                                s1: InvitationStatus.Accepted
                            }).orWhere(`invitation.status = :s2`, {
                                s2: InvitationStatus.Pending
                            });
                        })
                    )
                    .getQuery();
                return `player.playerId NOT IN ` + subQuery;
            })
            .orderBy(`player.playerId`)
            .getMany();
        if (players.length === 0) {
            throw new NotFoundException(`No players to invite found`);
        }
        return players;
    }

    async getMatchesByTeams(teamId: number, status: MatchStatus) {
        await this.getById(teamId);
        const queryBuilder = this.matchesRepository
            .createQueryBuilder(`match`)
            .addSelect([`firstRoster.team`, `secondRoster.team`])
            .addSelect([`firstRoster.participatingTeamId`, `secondRoster.participatingTeamId`])
            .addSelect([`firstTeam.teamId`, `firstTeam.teamName`, `secondTeam.teamId`, `secondTeam.teamName`])
            .innerJoin(`match.firstRoster`, `firstRoster`)
            .innerJoin(`match.secondRoster`, `secondRoster`)
            .innerJoin(`firstRoster.team`, `firstTeam`)
            .innerJoin(`secondRoster.team`, `secondTeam`)
            .where(`firstTeam.teamId = :teamId OR secondTeam.teamId = :teamId`, { teamId: teamId });
        if (status && status !== null) {
            queryBuilder.andWhere(`match.status = :status`, { status: status });
        }
        const matches = await queryBuilder.getMany();
        if (matches.length === 0) {
            throw new NotFoundException(`No matches found`);
        }
        return matches;
    }

    async create(createTeamDto: CreateTeamDto) {
        const captain = await this.playersService.getById(createTeamDto.playerId);
        const ifExists = await this.teamsRepository.findOne({
            where: { teamName: createTeamDto.name },
        });
        if (ifExists) {
            throw new BadRequestException(`This team name is already taken`);
        }
        const team = this.teamsRepository.create({
            teamName: createTeamDto.name,
            captain: captain,
            region: captain.region,
            game: captain.game,
        });
        await this.connection.transaction(async (manager) => {
            await manager.save(team);
            const insertedTeam = await manager.findOne(Team, {
                teamName: team.teamName,
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

    public async setTeamProfile(id: number, image: Express.Multer.File) {
        const team = await this.getById(id);
        if (team.profilePicture) {
            if (team.profilePicture !== `default-team-avatar.png`) {
                const fs = require(`fs`);
                const path = `./uploads/teams/avatars/` + team.profilePicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous team profile failed to remove`);
                }
            }
        }
        team.profilePicture = image.filename;
        this.teamsRepository.save(team);
        return team;
    }

    public async setTeamBackground(id: number, image: Express.Multer.File) {
        const team = await this.getById(id);
        if (team.backgroundPicture) {
            if (team.backgroundPicture !== `default-team-background.png`) {
                const fs = require(`fs`);
                const path = `./uploads/teams/backgrounds/` + team.backgroundPicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous team background failed to remove`);
                }
            }
        }
        team.backgroundPicture = image.filename;
        this.teamsRepository.save(team);
        return team;
    }

    async update(teamId: number, attrs: Partial<UpdateTeamDto>) {
        const team = await this.getById(teamId);
        const members = await this.getMembers(teamId);
        const captain = await this.playersService.getById(attrs.captainId);
        if (!members.some((member) => member.playerId === attrs.captainId)) {
            throw new BadRequestException(`Given player is not a member of the team`);
        }
        Object.assign(team, attrs);
        return this.teamsRepository.update(teamId, {
            teamName: attrs.name,
            captain: captain,
        });
    }

    async remove(teamId: number) {
        const team = await this.getById(teamId);
        return this.teamsRepository.remove(team);
    }
}
