import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { User } from "src/entities";

@Injectable()
export class AccountOwnerGuard implements CanActivate {
    constructor() { }
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user: User = request.user;
        if (user.accounts.length !== 0) {
            return true;
        }
        return false;
    }
}