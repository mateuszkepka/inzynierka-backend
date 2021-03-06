import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { MatchStatus } from '../interfaces/match-status.enum';

export class UpdateMatchDto {
    @IsOptional()
    @IsNumber()
    tournamentId: number;

    @IsOptional()
    @IsDateString()
    matchStartDate: Date;

    @IsOptional()
    @IsDateString()
    matchEndDate: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    winner: number;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(MatchStatus)
    matchStatus: MatchStatus;

    @IsOptional()
    @IsNumber()
    firstRosterId: number;

    @IsOptional()
    @IsNumber()
    secondRosterId: number;

    @IsOptional()
    @IsNumber()
    numberOfMaps: number;
}
