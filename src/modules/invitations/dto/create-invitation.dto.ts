import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateInvitationDto {
    @IsNotEmpty()
    @IsNumber()
    teamId: number;

    @IsNotEmpty()
    @IsNumber()
    playerId: number;
}
