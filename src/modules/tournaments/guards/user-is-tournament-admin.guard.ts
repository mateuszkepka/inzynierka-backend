import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Role } from 'src/roles/roles.enum';
import { TournamentsService } from '../tournaments.service';

@Injectable()
export class UserIsTournamentAdmin implements CanActivate {
    constructor(
        @Inject(TournamentsService) private readonly tournamentsService: TournamentsService,
    ) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user.roles.includes(Role.Admin)) {
            return true;
        }
        const tournamentId = Number(request.params.id);
        const admins = await this.tournamentsService.getAdmins(tournamentId);
        if (admins.some((admin) => admin.userId === user.userId)) {
            return true;
        }
        return false;
    }
}
