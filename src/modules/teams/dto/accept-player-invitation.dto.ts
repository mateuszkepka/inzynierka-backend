import { IsNumber } from 'class-validator';

export class AcceptPlayerInvitationDto {
    @IsNumber()
    playerTeamId: number;
}
