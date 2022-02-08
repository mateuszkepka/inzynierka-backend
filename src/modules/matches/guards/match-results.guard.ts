import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "src/modules/auth/dto/roles.enum";
import { MatchesService } from "../matches.service";

@Injectable()
export class MatchResultsGuard implements CanActivate {
    constructor(
        private readonly matchesService: MatchesService,
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        if (request.user.roles.includes(Role.Admin)) {
            return true;
        }
        let matchId = undefined;
        if (request.params.matchId) {
            matchId = request.params.matchId;
        }
        if (request.body.matchId) {
            matchId = request.body.matchId;
        }
        if (matchId === undefined) {
            return false;
        }
        const user = request.user;
        const match = await this.matchesService.getWithRelations(matchId);
        if (match.firstTeam.captain.user.userId === user.userId && match.firstCaptainDate == null) {
            return true;
        }
        if (match.secondTeam.captain.user.userId === user.userId && match.secondCaptainDate == null) {
            return true;
        }
        return false;
    }
}
