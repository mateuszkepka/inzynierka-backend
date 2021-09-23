import * as argon2 from 'argon2';

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import PostgresErrorCode from 'src/database/postgresErrorCodes.enum';
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
        const hashedPassword = await argon2.hash(registrationData.password, {
            type: argon2.argon2id,
        });

        try {
            const createdUser = await this.usersService.create({
                ...registrationData,
                password: hashedPassword,
            });
            return createdUser;
        } catch (error) {
            if (error?.code === PostgresErrorCode.UniqueViolation) {
                throw new BadRequestException(`User with that email already exists`);
            }
            throw new InternalServerErrorException(`Something went wrong`);
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
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>(
            `JWT_EXPIRATION_TIME`,
        )}`;
    }

    getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = { userId };

        const token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>(`JWT_REFRESH_TOKEN_SECRET`),
            expiresIn: this.configService.get<string>(`JWT_REFRESH_TOKEN_EXPIRATION_TIME`),
        });

        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>(
            `JWT_REFRESH_TOKEN_EXPIRATION_TIME`,
        )}`;

        return { cookie, token };
    }

    getCookiesForLogOut() {
        return [
            `Authentication=; HttpOnly; Path=/; Max-Age=0`,
            `Refresh=; HttpOnly; Path=/; Max-Age=0`,
        ];
    }

    private async verifyPassword(hashedPassword: string, plainTextPassword: string) {
        const isPasswordMatching = await argon2.verify(hashedPassword, plainTextPassword, {
            type: argon2.argon2id,
        });

        if (!isPasswordMatching) {
            throw new BadRequestException(`Wrong credentials provided`);
        }
    }
}
