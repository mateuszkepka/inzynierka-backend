import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateTeamDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    playerId: number;
}
