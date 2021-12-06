import { IsEnum } from 'class-validator';
import { ResponseStatus } from 'src/modules/teams/interfaces/teams.interface';

export class UpdateInvitationDto {
    @IsEnum(ResponseStatus)
    status: ResponseStatus
}
