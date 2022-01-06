import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTournamentDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    numberOfPlayers: number;

    @IsNumber()
    @IsOptional()
    numberOfTeams: number;

    @IsDateString()
    @IsOptional()
    registerStartDate: Date;

    @IsDateString()
    @IsOptional()
    registerEndDate: Date;

    @IsDateString()
    @IsOptional()
    tournamentStartDate: Date;

    // @IsDateString()
    // @IsOptional()
    // tournamentEndDate: Date;

    @IsString()
    @IsOptional()
    description: string;
}
