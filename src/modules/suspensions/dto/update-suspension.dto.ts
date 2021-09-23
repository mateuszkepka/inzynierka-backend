import { IsDate, IsOptional, IsString } from 'class-validator';

import { User } from 'src/entities';

export class UpdateSuspensionDto {
    @IsDate()
    @IsOptional()
    suspensionStartDate: Date;

    @IsDate()
    @IsOptional()
    suspensionEndDate: Date;

    @IsString()
    @IsOptional()
    reason: string;

    @IsOptional()
    user: User;
}
