import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, Player, Team, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { TournamentStatus } from '../tournaments/dto/tourrnament.status-enum';
import { Role } from 'src/roles/roles.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesDto } from './dto/roles.dto';
import { GetUsersTournamentsQuery } from './dto/get-users-tournaments.dto';
import { MatchStatus } from '../matches/interfaces/match-status.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
    ) { }

    async getById(userId: number) {
        const user = await this.usersRepository.findOne({
            where: { userId: userId }
        });
        if (!user) {
            throw new NotFoundException(`User with this id does not exist`);
        }
        return user;
    }

    async getByUsername(username: string) {
        const user = await this.usersRepository.findOne({
            where: { username: username }
        });
        if (!user) {
            throw new NotFoundException(`User with this username does not exist`);
        }
        return user;
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne({
            where: { email: email }
        });
        return user;
    }

    async getAccounts(userId: number) {
        await this.getById(userId);
        const accounts = await this.playersRepository
            .createQueryBuilder(`player`)
            .innerJoin(`player.user`, `user`)
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
                `match.matchId`, `match.matchStartDate`, `match.status`,
                `match.winner`, `match.numberOfMaps`,
                `match.firstRoster`, `match.secondRoster`
            ])
            .addSelect([
                `firstRoster.participatingTeamId`, `secondRoster.participatingTeamId`,
                `firstRoster.team`, `secondRoster.team`,
                `firstRoster.roster`, `secondRoster.roster`
            ])
            .addSelect([
                `firstTeam.teamId`, `firstTeam.teamName`,
                `secondTeam.teamId`, `secondTeam.teamName`
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
            .where(`firstUser.userId = :userId OR secondUser.userId = :userId`, { userId: userId })
        if (status && status !== null) {
            queryBuilder.andWhere(`match.status = :status`, { status: status })
        }
        const matches = await queryBuilder.getMany();
        if (matches.length === 0) {
            throw new NotFoundException(`No matches found`)
        }
        return matches;
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
            .getMany()
        if (teams.length === 0) {
            throw new NotFoundException(`This player is not a member of any team`);
        }
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
                queryBuilder.innerJoin(`tournament.rosters`, `roster`)
                    .innerJoin(`roster.team`, `team`)
                    .innerJoin(`team.members`, `invitation`)
                    .innerJoin(`invitation.player`, `player`)
                    .innerJoin(`player.user`, `user`)
                break;
            case Role.TournamentAdmin:
                queryBuilder.innerJoin(`tournament.tournamentAdmins`, `admins`)
                    .innerJoin(`admins.user`, `user`)
                break;
            case Role.Organizer:
                queryBuilder.innerJoin(`tournament.organizer`, `user`)
                break;
        }
        switch (status) {
            case TournamentStatus.Finished:
                queryBuilder.andWhere(`tournament.tournamentEndDate < :date`, { date: new Date() })
                break;
            case TournamentStatus.Ongoing:
                queryBuilder.andWhere(`tournament.tournamentStartDate < :date1`, { date1: new Date() })
                queryBuilder.andWhere(`tournament.tournamentEndDate > :date2`, { date2: new Date() })
                break;
            case TournamentStatus.Upcoming:
                queryBuilder.andWhere(`tournament.tournamentStartDate > :date`, { date: new Date() })
                break;
        }
        const tournaments = await queryBuilder.getMany();
        if (tournaments.length === 0) {
            throw new NotFoundException(`No tournaments with given parameters found`)
        }
        return tournaments;
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
        var tournaments = [];
        try {
            tournaments = await this.getTournamentsByUser(userId, queryParams);
        } catch (ignore) { }
        if (tournaments.length !== 0) {
            throw new ForbiddenException(`You can not delete your account when you have ongoing tournaments`);
        }
        return this.usersRepository.remove(user);
    }

    /* -------------------------------------------------------------------------- */
    /*                                     JWT                                    */
    /* -------------------------------------------------------------------------- */

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        const currentRefreshToken = await argon2.hash(refreshToken, {
            type: argon2.argon2id,
        });
        await this.usersRepository.update(userId, { currentRefreshToken });
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getById(userId);

        const isRefreshTokenMatching = await argon2.verify(user.currentRefreshToken, refreshToken, {
            type: argon2.argon2id,
        });

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
