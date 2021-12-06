import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common"
import { UsersService } from "src/modules/users/users.service";
import { InvitationsService } from "../invitations.service";

@Injectable()
export class InvitedPlayer implements CanActivate {
    constructor(
        @Inject(UsersService) private readonly usersService: UsersService,
        @Inject(InvitationsService) private readonly invitationsService: InvitationsService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const params = request.params;
        const invitationId = Number(params.id);
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const invitation = await this.invitationsService.findOne(invitationId);
        if (accountList.some(player => player.playerId !== invitation.player.playerId)) {
            return false;
        }
        return true;
    }
}