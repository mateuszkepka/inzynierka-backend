import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
    @IsNotEmpty()
    @IsNumber()
    tournamentId: number;

    @IsNotEmpty()
    @IsDateString()
    matchStartDate: Date;

    @IsNotEmpty()
    @IsString()
    tournamentStage: string;

    @IsOptional()
    @IsNumber()
    firstRosterId: number;

    @IsOptional()
    @IsNumber()
    secondRosterId: number;

    @IsNotEmpty()
    @IsNumber()
    numberOfMaps: number;
}
