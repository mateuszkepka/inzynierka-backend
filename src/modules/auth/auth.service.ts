// import * as argon2 from 'argon2';

import * as bcrypt from 'bcrypt';

import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(registrationData: RegisterDto) {
        // const hashedPassword = await argon2.hash(registrationData.password, {
        //     type: argon2.argon2id,
        // });

        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        try {
            const createdUser = await this.usersService.create({
                ...registrationData,
                password: hashedPassword,
            });
            return createdUser;
        } catch (error) {
            const username = error.detail.search(`username`);
            const email = error.detail.search(`email`);
            const university = error.detail.search(`university`);
            if (username > 0) {
                throw new BadRequestException(`This username is already taken!`);
            } else if (email > 0) {
                throw new BadRequestException(`This email is already taken!`);
            } else if (university) {
                throw new BadRequestException(
                    `This student id on your university is already taken!`,
                );
            } else {
                throw new BadRequestException(`Something went wrong`);
            }
        }
    }

    async getAuthenticatedUser(email: string, plainTextPassword: string) {
        try {
            const user = await this.usersService.getByEmail(email);
            await this.verifyPassword(user.password, plainTextPassword);
            return user;
        } catch (error) {
            throw new BadRequestException(`Wrong credentials provided`);
        }
    }

    getCookieWithJwtToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>(`JWT_SECRET`),
            expiresIn: this.configService.get<string>(`JWT_EXPIRATION_TIME`),
        });
        return `Authentication=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${this.configService.get<string>(
            `JWT_EXPIRATION_TIME`,
        )}`;
    }

    getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>(`JWT_REFRESH_TOKEN_SECRET`),
            expiresIn: this.configService.get<string>(`JWT_REFRESH_TOKEN_EXPIRATION_TIME`),
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${this.configService.get<string>(
            `JWT_REFRESH_TOKEN_EXPIRATION_TIME`,
        )}`;
        return { cookie, token };
    }

    getCookiesForLogOut() {
        return [
            `Authentication=; HttpOnly; SameSite=None; Secure; Path=/; Max-Age=0`,
            `Refresh=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
        ];
    }

    private async verifyPassword(hashedPassword: string, plainTextPassword: string) {
        // const isPasswordMatching = await argon2.verify(hashedPassword, plainTextPassword, {
        //     type: argon2.argon2id,
        // });

        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
        if (!isPasswordMatching) {
            throw new BadRequestException(`Wrong credentials provided`);
        }
    }
}
