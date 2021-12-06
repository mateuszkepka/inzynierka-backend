import { IsNumber } from "class-validator";

export class CreateInvitationDto {
    @IsNumber()
    teamId: number;

    @IsNumber()
    playerId: number;
}
