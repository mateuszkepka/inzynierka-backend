import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RegionsLoL } from 'src/modules/games/interfaces/regions';
export class UpdatePlayerDto {
    @IsOptional()
    @IsString()
    summonerName: string;

    @IsOptional()
    @IsEnum(RegionsLoL)
    region: RegionsLoL;
}
