import { IsNumber } from 'class-validator';

export class CreatePlayerTeam {
    @IsNumber()
    teamId: number;

    @IsNumber()
    playerId: number;
}
