import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

    @IsNotEmpty()
    @IsNumber()
    firstRosterId: number;

    @IsNotEmpty()
    @IsNumber()
    secondRosterId: number;

    @IsNotEmpty()
    @IsNumber()
    numberOfMaps: number;
}
