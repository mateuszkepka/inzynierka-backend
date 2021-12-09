import { IsDateString, IsNotEmpty, IsString, MinDate } from 'class-validator';

export class UpdateSuspensionDto {
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
