import { IsEnum, IsNotEmpty } from 'class-validator';
import { ResponseStatus } from '../interfaces/invitation-status.enum';

export class UpdateInvitationDto {
    @IsNotEmpty()
    @IsEnum(ResponseStatus)
    status: ResponseStatus;
}
