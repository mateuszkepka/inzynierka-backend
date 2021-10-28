import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsNumber()
    numberOfPlayers: number;

    @IsNumber()
    numberOfTeams: number;

    @IsDateString()
    registerStartDate: Date;

    @IsDateString()
    registerEndDate: Date;

    @IsDateString()
    tournamentStartDate: Date;

    @IsDateString()
    tournamentEndDate: Date;

    @IsString()
    description: string;
}
