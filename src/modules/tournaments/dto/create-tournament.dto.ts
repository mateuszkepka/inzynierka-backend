import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTournamentDto {
    @IsNotEmpty()
    @IsNumber()
    gameId: number

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    numberOfPlayers: number;

    @IsNotEmpty()
    @IsNumber()
    numberOfTeams: number;

    @IsNotEmpty()
    @IsDateString()
    registerStartDate: Date;

    @IsOptional()
    @IsDateString()
    registerEndDate: Date;

    @IsNotEmpty()
    @IsDateString()
    tournamentStartDate: Date;

    @IsOptional()
    @IsDateString()
    tournamentEndDate: Date;

    @IsNotEmpty()
    @IsString()
    description: string;
}
