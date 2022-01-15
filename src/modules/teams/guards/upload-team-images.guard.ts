import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { TeamsService } from '../teams.service';

@Injectable()
export class UploadTeamImagesGuard implements CanActivate {
    constructor(
        @Inject(TeamsService) private readonly teamsService: TeamsService,
        @Inject(UsersService) private readonly usersService: UsersService,
    ) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const accountList = await this.usersService.getAccounts(user.userId);
        const team = await this.teamsService.getById(request.params.id);
        if (accountList.find((player) => player.playerId === team.captain.playerId)) {
            return true;
        }
        return false;
    }
}
