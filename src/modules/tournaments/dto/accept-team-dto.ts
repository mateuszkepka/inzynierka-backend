import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptTeamDto {
    @IsNotEmpty()
    @IsNumber()
    participatingTeamId: number;
}
