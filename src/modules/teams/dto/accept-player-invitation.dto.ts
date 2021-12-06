import { IsNumber } from 'class-validator';

export class AcceptPlayerInvitationDto {
    @IsNumber()
    invitationId: number;
}
