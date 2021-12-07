import { IsEnum } from 'class-validator';
import { ResponseStatus } from '../interfaces/invitation-status.enum';

export class UpdateInvitationDto {
    @IsEnum(ResponseStatus)
    status: ResponseStatus
}
