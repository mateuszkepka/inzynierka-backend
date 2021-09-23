import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    console.log(`REQUEST`, request?.cookies);
                    return request?.cookies?.Authentication;
                },
            ]),
            secretOrKey: configService.get<string>(`JWT_SECRET`),
        });
    }

    async validate(payload: TokenPayload) {
        console.log(payload);
        return this.usersService.getById(payload.userId);
    }
}
