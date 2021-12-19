import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
    @IsString()
    tournamentStage: string;

    @IsOptional()
    @IsNumber()
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
