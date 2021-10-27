import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User)
    private readonly usersRepository: Repository<User>) { }

    async findById(userId: number) {
        if (!userId) {
            return null;
        }
        const user = await this.usersRepository.findOne(
            { userId },
            { relations: ['suspensions', 'accounts', `organizedTournaments`, `tournamentAdmins`] },
        );
        return this.usersRepository.findOne(userId);
    }

    // async getById(userId: number) {
    //     const user = await this.usersRepository.findOne(
    //         { userId },
    //         { relations: [`suspensions`, `players`, `organizedTournaments`, `tournamentAdmins`] },
    //     );
    //     if (user) {
    //         return user;
    //     }
    //     throw new NotFoundException(`User with this id does not exist`);
    // }

    getByEmail(email: string) {
        const user = this.usersRepository.findOne({ email });
        if (user) {
            return user;
        }
        throw new NotFoundException('User with this email does not exist');
    }

    create(user: CreateUserDto) {
        const newUser = this.usersRepository.create(user);
        this.usersRepository.save(newUser);
        return newUser;
    }

    async update(id: number, attributes: Partial<User>) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, attributes);
        return this.usersRepository.save(user);
    }

    async remove(id: number) {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
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
        const user = await this.findById(userId);

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