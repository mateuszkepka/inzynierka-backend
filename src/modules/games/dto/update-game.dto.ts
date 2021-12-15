import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGameDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    genre: string;
}
