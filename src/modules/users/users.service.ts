import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { Match, Player, Team, Tournament, User } from 'src/database/entities';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { Brackets, Repository } from 'typeorm';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { MatchStatus } from '../matches/interfaces/match-status.enum';
import { TournamentStatus } from '../tournaments/dto/tourrnament.status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQuery } from './dto/get-users-filtered.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { RolesDto } from './dto/roles.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
    ) { }

    async getAll() {
        const users = await this.usersRepository.find();
        return users;
    }

    async getById(userId: number) {
        const user = await this.usersRepository.findOne({
            where: { userId: userId },
        });
        if (!user) {
            throw new NotFoundException(`User with this id does not exist`);
        }
        return user;
    }

    async getUsersFiltered(queryParams: GetUsersQuery) {
        const { role } = queryParams;
        const queryBuilder = this.usersRepository
            .createQueryBuilder(`user`)
            .where(`1=1`);
        if (role) {
            queryBuilder.andWhere(`:role = any("user"."roles")`, { role: role })
        }
        const users = await queryBuilder.getMany();
        if (users.length === 0) {
            throw new NotFoundException(`No tournaments found`);
        }
        return users;
    }

    async getByUsername(username: string) {
        const user = await this.usersRepository.findOne({
            where: { username: username },
        });
        return user;
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne({
            where: { email: email },
        });
        return user;
    }

    async getAccounts(userId: number) {
        await this.getById(userId);
        const accounts = await this.playersRepository
            .createQueryBuilder(`player`)
            .innerJoinAndSelect(`player.user`, `user`)
            .innerJoinAndSelect(`player.game`, `game`)
            .where(`user.userId = :userId`, { userId: userId })
            .getMany();
        if (accounts.length === 0) {
            throw new NotFoundException(`This player has no games connected`);
        }
        return accounts;
    }

    async getMatchesByUser(userId: number, status: MatchStatus) {
        await this.getById(userId);
        const queryBuilder = this.matchesRepository
            .createQueryBuilder(`match`)
            .select([
                `match.matchId`,
                `match.matchStartDate`,
                `match.status`,
                `match.winner`,
                `match.numberOfMaps`,
                `match.firstRoster`,
                `match.secondRoster`,
            ])
            .addSelect([
                `firstRoster.participatingTeamId`,
                `secondRoster.participatingTeamId`,
                `firstRoster.team`,
                `secondRoster.team`,
                `firstRoster.roster`,
                `secondRoster.roster`,
            ])
            .addSelect([
                `firstTeam.teamId`,
                `firstTeam.teamName`,
                `secondTeam.teamId`,
                `secondTeam.teamName`,
            ])
            .innerJoin(`match.firstRoster`, `firstRoster`)
            .innerJoin(`match.secondRoster`, `secondRoster`)
            .innerJoin(`firstRoster.team`, `firstTeam`)
            .innerJoin(`secondRoster.team`, `secondTeam`)
            .innerJoin(`firstTeam.members`, `firstInvitation`)
            .innerJoin(`secondTeam.members`, `secondInvitation`)
            .innerJoin(`firstInvitation.player`, `firstPlayer`)
            .innerJoin(`secondInvitation.player`, `secondPlayer`)
            .innerJoin(`firstPlayer.user`, `firstUser`)
            .innerJoin(`secondPlayer.user`, `secondUser`)
        queryBuilder.andWhere(
            new Brackets((subQuery) => {
                subQuery
                    .where(`firstUser.userId = :userId`)
                    .orWhere(`secondUser.userId = :userId`, { userId: userId });
            }),
        );
        if (status === MatchStatus.Scheduled) {
            queryBuilder.andWhere(
                new Brackets((subQuery) => {
                    subQuery
                        .where(`match.status = :status1`, { status1: MatchStatus.Scheduled })
                        .orWhere(`match.status = :status2`, { status2: MatchStatus.Resolving })
                        .orWhere(`match.status = :status3`, { status3: MatchStatus.Unresolved })
                        .orWhere(`match.status = :status4`, { status4: MatchStatus.Postponed });
                }),
            );
        } else {
            queryBuilder.andWhere(`match.status = :status5`, { status5: status });
        }
        return queryBuilder.getMany();
    }

    async getTeamsByUser(userId: number) {
        await this.getById(userId);
        const teams = await this.teamsRepository
            .createQueryBuilder(`team`)
            .innerJoinAndSelect(`team.game`, `game`)
            .innerJoin(`team.members`, `invitation`)
            .innerJoin(`invitation.player`, `player`)
            .innerJoin(`player.user`, `user`)
            .where(`user.userId = :userId`, { userId: userId })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getMany();
        return teams;
    }

    async getTournamentsByUser(userId: number, queryParams: GetUsersTournamentsQuery) {
        await this.getById(userId);
        const queryBuilder = this.tournamentsRepository
            .createQueryBuilder(`tournament`)
            .where(`user.userId = :userId`, { userId: userId });
        const { status, role } = queryParams;
        switch (role) {
            case Role.Player:
                queryBuilder
                    .innerJoin(`tournament.rosters`, `roster`)
                    .innerJoin(`roster.team`, `team`)
                    .innerJoin(`team.members`, `invitation`)
                    .innerJoin(`invitation.player`, `player`)
                    .innerJoin(`player.user`, `user`);
                break;
            case Role.TournamentAdmin:
                queryBuilder
                    .innerJoin(`tournament.tournamentAdmins`, `admins`)
                    .innerJoin(`admins.user`, `user`);
                break;
            case Role.Organizer:
                queryBuilder.innerJoin(`tournament.organizer`, `user`);
                break;
        }
        if (status) {
            queryBuilder.andWhere(`tournament.status = :status`, { status: status });
        }
        return queryBuilder.getMany();
    }

    async create(body: CreateUserDto) {
        const user = this.usersRepository.create(body);
        return this.usersRepository.save(user);
    }

    async grantRole(userId: number, body: RolesDto) {
        const { role } = body;
        const user = await this.getById(userId);
        if (user.roles.includes(role)) {
            throw new BadRequestException(`This user already possesses this role`);
        }
        user.roles.push(role);
        return this.usersRepository.save(user);
    }

    async revokeRole(userId: number, body: RolesDto) {
        const { role } = body;
        const user = await this.getById(userId);
        if (!user.roles.includes(role)) {
            throw new BadRequestException(`This user doesnt't have given role`);
        }
        const index = user.roles.indexOf(role, 0);
        user.roles.splice(index, 1);
        return this.usersRepository.save(user);
    }

    async update(userId: number, attributes: UpdateUserDto) {
        const user = await this.getById(userId);
        Object.assign(user, attributes);
        return this.usersRepository.save(user);
    }

    async remove(userId: number) {
        const user = await this.getById(userId);
        const queryParams = new GetUsersTournamentsQuery();
        queryParams.status = TournamentStatus.Ongoing;
        queryParams.role = Role.Organizer;
        const tournaments = await this.getTournamentsByUser(userId, queryParams);
        if (tournaments.length !== 0) {
            throw new ForbiddenException(`You can not delete your account when you have ongoing tournaments`);
        }
        return this.usersRepository.remove(user);
    }

    public async setProfileImage(userId: number, image) {
        const user = await this.getById(userId);
        if (user.profilePicture) {
            if (user.profilePicture !== `default-user-avatar.png`) {
                const fs = require(`fs`);
                const path = `./uploads/users/avatars/` + user.profilePicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous user avatar failed to remove`);
                }
            }
        }
        user.profilePicture = image.filename;
        this.usersRepository.save(user);
        return user;
    }

    public async setProfileBackground(userId, image) {
        const user = await this.getById(userId);
        if (user.backgroundPicture) {
            if (user.backgroundPicture !== `default-user-background.png`) {
                const fs = require(`fs`);
                const path = `./uploads/users/backgrounds/` + user.backgroundPicture;
                try {
                    fs.unlinkSync(path);
                } catch (err) {
                    console.error(`Previous user backgrounds failed to remove`);
                }
            }
        }
        user.backgroundPicture = image.filename;
        this.usersRepository.save(user);
        return user;
    }

    /* -------------------------------------------------------------------------- */
    /*                                     JWT                                    */
    /* -------------------------------------------------------------------------- */

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        // const currentRefreshToken = await argon2.hash(refreshToken, {
        //     type: argon2.argon2id,
        // });

        const currentRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersRepository.update(userId, { currentRefreshToken });
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getById(userId);
        // const isRefreshTokenMatching = await argon2.verify(user.currentRefreshToken, refreshToken, {
        //     type: argon2.argon2id,
        // });

        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.currentRefreshToken);
        if (isRefreshTokenMatching) {
            return user;
        }
        return null;
    }

    async removeRefreshToken(userId: number) {
        return this.usersRepository.update(userId, {
            currentRefreshToken: null,
        });
    }
}
