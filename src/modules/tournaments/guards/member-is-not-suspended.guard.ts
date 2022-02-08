import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { User } from "src/database/entities";
import { Role } from "src/modules/auth/dto/roles.enum";
import { SuspensionStatus } from "src/modules/suspensions/dto/suspension-status.enum";
import { SuspensionsService } from "src/modules/suspensions/suspensions.service";
import { TeamsService } from "src/modules/teams/teams.service";

@Injectable()
export class MemberIsNotSuspended implements CanActivate {
    constructor(
        private readonly suspensionsService: SuspensionsService,
        private readonly teamsService: TeamsService
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.roles.includes(Role.Admin)) {
            return true;
        }
        const teamId = request.params.teamId;
        const members = await this.teamsService.getMembers(teamId);
        const bannedUsers: User[] = []
        members.forEach(async (member) => {
            const suspensions = await this.suspensionsService
                .getFiltered(member.user.userId, SuspensionStatus.Active);
            if (suspensions.length !== 0) {
                bannedUsers.push(suspensions[0].user)
            }
        })
        if (bannedUsers.length !== 0) {
            const message = `Following users have an active suspensions:\n`
            bannedUsers.forEach(user => message.concat(`- `, user.username));
            throw new ForbiddenException(message);
        }
        return true;
    }
}