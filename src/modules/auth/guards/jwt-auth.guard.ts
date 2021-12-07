import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, shouldBypassAuth } from 'src/roles/public.decorator';

@Injectable()
export default class JwtAuthGuard extends AuthGuard([`strategy_local`, `strategy_jwt`]) {
    constructor(private reflector: Reflector) {
        super();
    }
    canActivate(context: ExecutionContext) {
        if (shouldBypassAuth(context, this.reflector)) {
            return true;
        }
        return super.canActivate(context);
    }
}