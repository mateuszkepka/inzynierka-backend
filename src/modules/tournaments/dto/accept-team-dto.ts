import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptTeamDto {
    @IsNotEmpty()
    @IsBoolean()
    isApproved: boolean
}
