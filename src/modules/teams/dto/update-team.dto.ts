import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTeamDto {
    @IsOptional()
    @IsString()
    teamName: string;

    @IsOptional()
    @IsNumber()
    captainId: number
}