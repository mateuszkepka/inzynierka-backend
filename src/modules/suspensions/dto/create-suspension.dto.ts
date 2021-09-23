import { IsDate, IsString } from 'class-validator';

import { User } from 'src/entities';

export class CreateSuspensionDto {
    @IsDate()
    suspensionStartDate: Date;

    @IsDate()
    suspensionEndDate: Date;

    @IsString()
    reason: string;

    user: User;
}
