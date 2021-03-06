import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Role } from "src/modules/auth/dto/roles.enum";
import { UsersService } from "src/modules/users/users.service";
import { TeamsService } from "../teams.service";

@Injectable()
export class UserIsCaptainGuard implements CanActivate {
    constructor(
        private readonly teamsService: TeamsService,
        private readonly usersService: UsersService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (request.user.roles.includes(Role.Admin)) {
            return true;
        }
        let teamId = undefined;
        if (request.params.teamId) {
            teamId = request.params.teamId;
        }
        if (request.body.teamId) {
            teamId = request.body.teamId;
        }
        if (teamId === undefined) {
            return false;
        }
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const team = await this.teamsService.getById(teamId);
        if (accountList.find((player) => player.playerId === team.captain.playerId)) {
            return true;
        }
        throw new ForbiddenException(`You must be a team's captain to perform this action`);
    }
}
