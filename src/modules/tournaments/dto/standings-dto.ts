import { Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class StandingsDto {
    @Expose()
    @IsNumber()
    teamId: number;

    @Expose()
    @IsString()
    teamName: string;

    @Expose()
    @IsNumber()
    points: number;

    @Expose()
    @IsNumber()
    place: number;
}