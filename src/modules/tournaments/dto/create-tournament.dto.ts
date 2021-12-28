import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TournamentFormat } from '../../formats/dto/tournament-format-enum';

export class CreateTournamentDto {
    @IsNotEmpty()
    @IsNumber()
    gameId: number;

    @IsNotEmpty()
    @IsEnum(TournamentFormat)
    format: TournamentFormat;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    numberOfPlayers: number;

    @IsNotEmpty()
    @IsNumber()
    numberOfTeams: number;

    @IsOptional()
    @IsNumber()
    numberOfGroups: number;

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
