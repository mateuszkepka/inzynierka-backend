import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class UserIsAccountOwner implements CanActivate {
    constructor(
        private readonly usersService: UsersService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        let playerId = undefined;
        if (request.params.playerId) {
            playerId = request.params.playerId;
        }
        if (request.body.playerId) {
            playerId = request.body.playerId;
        }
        if (playerId === undefined) {
            return false;
        }
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        if (accountList.find((player) => player.user.userId === user.userId)) {
            return true;
        }
        throw new ForbiddenException(`You must be an account's owner to perform this action`);
    }
}