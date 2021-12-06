import { IsNumber } from 'class-validator';

export class CreateInvitation {
    @IsNumber()
    teamId: number;

    @IsNumber()
    playerId: number;
}
