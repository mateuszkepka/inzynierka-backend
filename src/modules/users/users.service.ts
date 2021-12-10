import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player, User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { InvitationStatus } from '../invitations/interfaces/invitation-status.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
    ) {}

    async getById(userId: number) {
        const user = await this.usersRepository.findOne(
            { userId },
            { relations: [`accounts`, `suspensions`, `organizedTournaments`, `tournamentAdmins`] },
        );
        if (!user) {
            throw new NotFoundException(`User with this id does not exist`);
        }
        return user;
    }

    async getByEmail(email: string) {
        const user = await this.usersRepository.findOne(
            { email },
            { relations: [`accounts`, `suspensions`, `organizedTournaments`, `tournamentAdmins`] },
        );
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
            .leftJoinAndSelect(`player.ownedTeams`, `teams`)
            .where(`user.userId = :userId`, { userId: id })
            .getMany();
        return accounts;
    }

    async getTeams(id: number) {
        await this.getById(id);
        const teams = await this.usersRepository
            .createQueryBuilder(`user`)
            .select(`user.userId`, `userId`)
            .addSelect(`team.teamId`, `teamId`)
            .addSelect(`team.teamName`, `teamName`)
            .addSelect(`team.captain`, `captainId`)
            .addSelect(`player.playerId`, `playerId`)
            .addSelect(`player.summonerName`, `summonerName`)
            .innerJoin(`user.accounts`, `player`)
            .innerJoin(`player.teams`, `invitation`)
            .innerJoin(`invitation.team`, `team`)
            .where(`user.userId = :userId`, { userId: id })
            .andWhere(`invitation.status = :status`, { status: InvitationStatus.Accepted })
            .getRawMany();
        return teams;
    }

    async create(user: CreateUserDto) {
        const newUser = this.usersRepository.create(user);
        this.usersRepository.save(newUser);
        return newUser;
    }

    async update(id: number, attributes: Partial<User>) {
        const user = await this.getById(id);
        if (!user) {
            throw new NotFoundException(`User not found`);
        }

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
