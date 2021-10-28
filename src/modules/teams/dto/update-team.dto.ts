import { IsString, IsNumber, IsOptional } from 'class-validator';
export class UpdateTeamDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    creationDate: Date;
}
