import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common"
import { Role } from "src/modules/auth/dto/roles.enum";
import { TournamentsService } from "../tournaments.service";

@Injectable()
export class UserIsOrganizer implements CanActivate {
    constructor(
        private readonly tournamentsService: TournamentsService,
    ) { }
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.roles.includes(Role.Admin)) {
            return true;
        }
        const tournamentId = Number(request.params.tournamentId);
        const tournament = await this.tournamentsService.getById(tournamentId);
        if (user.userId !== tournament.organizer.userId) {
            return true;
        }
        return false;
    }
}