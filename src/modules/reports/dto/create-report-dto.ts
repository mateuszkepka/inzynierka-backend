import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    description: string;
}
