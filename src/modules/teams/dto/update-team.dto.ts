import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTeamDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    captainId: number;
}
