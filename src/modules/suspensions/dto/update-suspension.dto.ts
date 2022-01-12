import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSuspensionDto {
    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
