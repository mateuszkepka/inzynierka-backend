import { IsDate, IsNotEmpty, IsString } from 'class-validator';

import { User } from 'src/entities';

export class CreateSuspensionDto {
    @IsNotEmpty()
    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;

    @IsNotEmpty()
    @IsString()
    reason: string;

    @IsNotEmpty()
    player: User;

    @IsNotEmpty()
    admin: User;
}