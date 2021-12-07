import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateTeamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    captainId: number
}