import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Role } from "src/roles/roles.enum";

@Injectable()
export class UserIsUserGuard implements CanActivate {
    constructor() { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.roles.includes(Role.Admin)) {
            return true;
        }
        const userId = Number(request.params.id);
        if (user.userId === userId) {
            return true
        }
        return false;
    }
}