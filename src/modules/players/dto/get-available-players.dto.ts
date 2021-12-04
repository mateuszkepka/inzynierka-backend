import { IsNumber } from 'class-validator';

export class GetAvailablePlayersDto {
    @IsNumber()
    teamId: number;
}
