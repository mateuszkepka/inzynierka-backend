import { IsDateString, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { IsGreaterThan } from 'src/decorators/is-greater-than.validator';
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

    @IsNotEmpty()
    @ValidateIf(o => o.format.name === TournamentFormat.SingleRoundRobin || o.format.name === TournamentFormat.SingleRoundRobin)
    @IsGreaterThan(`numberOfTeams`, {
        message: `Each group must contain at least 2 teams`
    })
    @Min(1)
    @IsNumber()
    numberOfGroups: number;

    @IsNotEmpty()
    @IsNumber()
    @IsIn([1, 3, 5])
    numberOfMaps: number;

    @IsNotEmpty()
    @IsDateString()
    registerStartDate: Date;

    @IsOptional()
    @IsDateString()
    registerEndDate: Date;

    @IsNotEmpty()
    @IsDateString()
    tournamentStartDate: Date;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(24)
    endingHour: number

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(59)
    endingMinutes: number

    @IsNotEmpty()
    @IsString()
    description: string;
}
