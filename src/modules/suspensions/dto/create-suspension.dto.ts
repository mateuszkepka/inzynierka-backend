import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSuspensionDto {
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
