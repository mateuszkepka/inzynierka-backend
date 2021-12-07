import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSuspensionDto {
    @IsDateString()
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}