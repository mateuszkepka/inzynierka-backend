import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common"
import { UsersService } from "src/modules/users/users.service";
import { InvitationsService } from "../invitations.service";

@Injectable()
export class UserIsInvitedGuard implements CanActivate {
    constructor(
        @Inject(UsersService) private readonly usersService: UsersService,
        @Inject(InvitationsService) private readonly invitationsService: InvitationsService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const invitationId = Number(request.params.id);
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const invitation = await this.invitationsService.getById(invitationId);
        // TODO temporary solution
        if (accountList.length === 0) {
            return false;
        }
        if (accountList.find(player => player.playerId === invitation.player.playerId)) {
            return true;
        }
        return false;
    }
}