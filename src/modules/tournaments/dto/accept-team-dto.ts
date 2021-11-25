import { IsNumber } from 'class-validator';

export class AcceptTeamDto {
    @IsNumber()
    participatingTeamId: number;
}
