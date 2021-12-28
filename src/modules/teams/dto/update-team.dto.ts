import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateTeamDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    captainId: number;
}
