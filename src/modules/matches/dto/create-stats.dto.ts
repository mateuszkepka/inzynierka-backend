import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStatsDto {
    @IsNotEmpty()
    @IsString()
    summonerName: string;

    @IsNotEmpty()
    @IsNumber()
    kills: number;

    @IsNotEmpty()
    @IsNumber()
    deaths: number;

    @IsNotEmpty()
    @IsNumber()
    assists: number;
}