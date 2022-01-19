import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { shouldBypassAuth } from 'src/decorators/public.decorator';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        if (shouldBypassAuth(context, this.reflector)) {
            return true;
        }
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (user.roles?.includes(Role.Admin)) {
            return true;
        }
        return requiredRoles.some((role) => user.roles?.includes(role));
    }
}
