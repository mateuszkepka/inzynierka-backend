import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/modules/users/users.service';

interface DecodedToken {
    userId: number;
    iat: number;
    exp: number;
}

@Injectable()
export class AssignUserInterceptor implements NestInterceptor {
    constructor(private usersService: UsersService) {}

    async intercept(context: ExecutionContext, handler: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const cookie = request.get(`cookie`);
        const token = cookie.split(`=`, 2)[1].split(`;`, 1)[0];
        const decoded: DecodedToken = jwt.decode(token) as DecodedToken;
        const { userId } = decoded || {};

        if (userId) {
            const user = await this.usersService.getById(userId);
            request.currentUser = user;
        }

        return handler.handle();
    }
}
