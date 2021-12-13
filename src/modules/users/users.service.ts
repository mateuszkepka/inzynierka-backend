import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, Team, Tournament, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';
import { TournamentStatus } from '../tournaments/interfaces/tourrnament.status-enum';
import { Role } from 'src/roles/roles.enum';
import { GetTournamentsQuery } from './dto/get-tournaments.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Team) private readonly teamsRepository: Repository<Team>,
        @InjectRepository(Tournament) private readonly tournamentsRepository: Repository<Tournament>
    ) { }

    async getById(userId: number) {
        const user = await this.usersRepository.findOne(userId);
        if (!user) {
            throw new NotFoundException(`User with this id does not exist`);
        }
        return user;
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne(email);
        if (!user) {
            throw new NotFoundException(`User with this email does not exist`);
        }
        return user;
    }

    async getAccounts(id: number) {
        await this.getById(id);
        const accounts = await this.playersRepository
            .createQueryBuilder(`player`)
            .innerJoin(`player.user`, `user`)
            .innerJoinAndSelect(`player.game`, `game`)
            .where(`user.userId = :userId`, { userId: id })
            .getMany();
        return accounts;
    }

    async getTeams(id: number) {
        await this.getById(id);
        const teams = await this.teamsRepository
            .createQueryBuilder(`team`)
            .innerJoin(`team.members`, `invitation`)
            .innerJoin(`invitation.player`, `player`)
            .innerJoin(`player.user`, `user`)
            .innerJoin(`player.game`, `game`)
            .where(`user.userId = :userId`, { userId: id })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getMany()
        return teams;
    }

    async getTournaments(id: number, queryParams: GetTournamentsQuery) {
        await this.getById(id);
        const queryBuilder = this.tournamentsRepository
            .createQueryBuilder(`tournament`)
            .where(`user.userId = :userId`, { userId: id });
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
            default:
                break;
        }
        switch (status) {
            case TournamentStatus.Past:
                queryBuilder.andWhere(`tournament.tournamentEndDate < :date`, { date: new Date() })
                break;
            case TournamentStatus.Ongoing:
                queryBuilder.andWhere(`tournament.tournamentStartDate < :date1`, { date1: new Date() })
                queryBuilder.andWhere(`tournament.tournamentEndDate > :date2`, { date2: new Date() })
                break;
            case TournamentStatus.Upcoming:
                queryBuilder.andWhere(`tournament.tournamentStartDate > :date`, { date: new Date() })
                break;
            default:
                break;
        }
        return queryBuilder.getMany();
    }

    async create(user: CreateUserDto) {
        const newUser = this.usersRepository.create(user);
        this.usersRepository.save(newUser);
        return await newUser;
    }

    async update(id: number, attributes: Partial<UpdateUserDto>) {
        const user = await this.getById(id);
        Object.assign(user, attributes);
        return this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.getById(id);
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
