import { IsDateString, IsString } from 'class-validator';

import { User } from 'src/entities';

export class CreateSuspensionDto {
    @IsDateString()
    suspensionStartDate: Date;

    @IsDateString()
    suspensionEndDate: Date;

    @IsString()
    reason: string;

    user: User;
}
