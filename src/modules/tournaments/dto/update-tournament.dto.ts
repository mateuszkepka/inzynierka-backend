import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TournamentFormat } from 'src/modules/formats/dto/tournament-format.enum';

export class UpdateTournamentDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(TournamentFormat)
    format: TournamentFormat;

    @IsOptional()
    @IsNumber()
    numberOfPlayers: number;

    @IsOptional()
    @IsNumber()
    numberOfTeams: number;

    @IsOptional()
    @IsNumber()
    numberOfMaps: number;

    @IsOptional()
    @IsDateString()
    registerStartDate: Date;

    @IsOptional()
    @IsDateString()
    registerEndDate: Date;

    @IsOptional()
    @IsDateString()
    tournamentStartDate: Date;

    @IsOptional()
    @IsNumber()
    endingHour: number;

    @IsOptional()
    @IsNumber()
    endingMinutes: number;

    @IsOptional()
    @IsString()
    description: string;
}
