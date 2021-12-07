import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common"
import { UsersService } from "src/modules/users/users.service";
import { Role } from "src/roles/roles.enum";
import { TeamsService } from "../teams.service";

@Injectable()
export class UserIsCaptainGuard implements CanActivate {
    constructor(
        @Inject(TeamsService) private readonly teamsService: TeamsService,
        @Inject(UsersService) private readonly usersService: UsersService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (request.user.roles.includes(Role.Admin)) {
            return true;
        }
        let teamId = undefined;
        if (request.method === `GET` || request.method === `PUT` || request.method === `DELETE`) {
            teamId = Number(request.params.id);
        }
        if (request.method === 'POST') {
            teamId = Number(request.body.teamId);
        }
        if (teamId === undefined) {
            return false;
        }
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const team = await this.teamsService.getById(teamId);
        // TODO temporary solution
        if (accountList.length === 0) {
            return false;
        }
        if (accountList.find(player => player.playerId === team.captain.playerId)) {
            return true;
        }
        return false;
    }
}