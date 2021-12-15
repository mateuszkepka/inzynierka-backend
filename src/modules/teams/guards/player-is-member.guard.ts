import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common"
import { Role } from "src/roles/roles.enum";
import { TeamsService } from "../teams.service";

@Injectable()
export class PlayerIsMemberGuard implements CanActivate {
    constructor(
        @Inject(TeamsService) private readonly teamsService: TeamsService,
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (request.user.roles.includes(Role.Admin)) {
            return true;
        }
        const teamId = Number(request.params.id);
        const captainId = request.body.captainId;
        const team = await this.teamsService.getMembers(teamId);
        // if (team.find((playerId: number) => playerId === captainId)) {
        //     return true;
        // }
        return false;
    }
}