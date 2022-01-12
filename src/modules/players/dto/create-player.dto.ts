import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RegionsLoL } from 'src/modules/games/interfaces/regions';
export class AddPlayerAccountDto {
    @IsNotEmpty()
    @IsString()
    summonerName: string;

    @IsNotEmpty()
    @IsNumber()
    gameId: number;

    @IsNotEmpty()
    @IsEnum(RegionsLoL)
    region: RegionsLoL;
}
