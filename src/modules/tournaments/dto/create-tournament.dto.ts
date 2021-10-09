import { IsString, IsNumber, IsDate } from 'class-validator';
export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsNumber()
    numberofPlayers: number;

    @IsNumber()
    numberofTeams: number;

    @IsDate()
    registerStartDate: Date;

    @IsDate()
    registerEndDate: Date;

    @IsDate()
    tournamentStartDate: Date;

    @IsDate()
    tournamentEndDate: Date;

    @IsString()
    description: string;
}
