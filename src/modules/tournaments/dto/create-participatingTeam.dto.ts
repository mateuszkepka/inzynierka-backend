import { IsNumber } from 'class-validator';

export class CreateParticipatingTeamDto {
    @IsNumber()
    tournamentId: number;

    @IsNumber()
    teamId: number;
}
