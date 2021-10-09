import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
export class UpdateTournamentDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    numberofPlayers: number;

    @IsNumber()
    @IsOptional()
    numberofTeams: number;

    @IsDate()
    @IsOptional()
    registerStartDate: Date;

    @IsDate()
    @IsOptional()
    registerEndDate: Date;

    @IsDate()
    @IsOptional()
    tournamentStartDate: Date;

    @IsDate()
    @IsOptional()
    tournamentEndDate: Date;

    @IsString()
    @IsOptional()
    description: string;
}
