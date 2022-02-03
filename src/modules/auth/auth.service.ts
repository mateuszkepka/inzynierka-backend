// import * as argon2 from 'argon2';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/database/entities';
import { UsersService } from 'src/modules/users/users.service';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registrationData: RegisterDto) {
        // const hashedPassword = await argon2.hash(registrationData.password, {
        //     type: argon2.argon2id,
        // });
        const exceptions = [];
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        const emailCheck = await this.usersRepository.findOne({
            where: { email: registrationData.email },
        });
        if (emailCheck) {
            exceptions.push(`This email is already taken!`);
        }
        const usernameCheck = await this.usersRepository.findOne({
            where: { username: registrationData.username },
        });
        if (usernameCheck) {
            exceptions.push(`This username is already taken!`);
        }
        const universityCheck = await this.usersRepository.findOne({
            where: {
                university: registrationData.university,
                studentId: registrationData.studentId,
            },
        });
        if (universityCheck) {
            exceptions.push(`This student id on your university is already taken!`);
        }
        if (exceptions.length > 0) {
            throw new BadRequestException(exceptions);
        }
        return await this.usersService.create({
            ...registrationData,
            password: hashedPassword,
        });
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
            `Authentication=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
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
