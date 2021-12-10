import { IsNumber, IsString } from 'class-validator';
export class AddPlayerAccountDto {
    @IsString()
    summonerName: string;

    @IsNumber()
    gameId: number;

    @IsString()
    region: string;
}
