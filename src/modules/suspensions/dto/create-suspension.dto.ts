import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

import { User } from 'src/entities';

export class CreateSuspensionDto {
    @IsDateString()
    suspensionStartDate: Date;

    @IsDateString()
    suspensionEndDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    player: User;

    @IsNotEmpty()
    admin: User;
}