import { IsDateString, IsNotEmpty, IsString, MinDate } from 'class-validator';

export class UpdateSuspensionDto {
    @IsNotEmpty()
    @IsDateString()
    //czemu nie dziala?
    //@MinDate(new Date())
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;
}
