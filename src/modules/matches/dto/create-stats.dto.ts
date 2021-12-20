import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateStatsDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

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