import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { TournamentsService } from '../tournaments.service';

@Injectable()
export class UploadTeamTournamentGuard implements CanActivate {
    constructor(
        @Inject(TournamentsService) private readonly tournamentsService: TournamentsService,
        @Inject(UsersService) private readonly usersService: UsersService,
    ) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tournament = await this.tournamentsService.getById(request.params.id);
        console.log(user.userId);
        console.log(tournament.organizer.userId);
        if (user.userId === tournament.organizer.userId) {
            return true;
        }
        return false;
    }
}
