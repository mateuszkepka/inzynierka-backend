import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/database/entities';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, `strategy_local`) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: `email`,
        });
    }

    async validate(email: string, password: string): Promise<User> {
        return this.authService.getAuthenticatedUser(email, password);
    }
}
