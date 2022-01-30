import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UsersService } from "src/modules/users/users.service";
import { InvitationsService } from "../invitations.service";

@Injectable()
export class UserIsInvitedGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
        private readonly invitationsService: InvitationsService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const invitationId = Number(request.params.invitationId);
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const invitation = await this.invitationsService.getById(invitationId);
        if (accountList.find(player => player.playerId === invitation.player.playerId)) {
            return true;
        }
        return false;
    }
}