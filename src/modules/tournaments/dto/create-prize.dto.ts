import { IsNumber, IsString } from 'class-validator';

export class CreatePrizeDto {
    @IsString()
    currency: string;

    @IsString()
    distribution: string;

    @IsNumber()
    tournamentId: number;
}
