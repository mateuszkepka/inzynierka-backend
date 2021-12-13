import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class AddPlayerAccountDto {
    @IsNotEmpty()
    @IsString()
    summonerName: string;

    @IsNotEmpty()
    @IsNumber()
    gameId: number;
    
    @IsNotEmpty()
    @IsString()
    region: string;
}
