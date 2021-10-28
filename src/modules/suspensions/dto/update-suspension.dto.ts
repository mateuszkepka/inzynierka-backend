import { IsDateString, IsOptional, IsString } from 'class-validator';

import { User } from 'src/entities';

export class UpdateSuspensionDto {
    @IsDateString()
    @IsOptional()
    suspensionStartDate: Date;

    @IsDateString()
    @IsOptional()
    suspensionEndDate: Date;

    @IsString()
    @IsOptional()
    reason: string;

    @IsOptional()
    user: User;
}
