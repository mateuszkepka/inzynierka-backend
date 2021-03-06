import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "src/modules/auth/dto/roles.enum";
import { TournamentsService } from "../tournaments.service";

@Injectable()
export class UserIsTournamentAdmin implements CanActivate {
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
        if (user.userId === tournament.organizer.userId) {
            return true;
        }
        const admins = await this.tournamentsService.getAdmins(tournamentId);
        if (admins.some((admin) => admin.userId === user.userId)) {
            return true;
        }
        return false;
    }
}
