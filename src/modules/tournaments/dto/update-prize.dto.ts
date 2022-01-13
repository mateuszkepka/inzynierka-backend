import { IsOptional, IsString } from 'class-validator';

export class UpdatePrizeDto {
    @IsOptional()
    @IsString()
    currency: string;

    @IsOptional()
    @IsString()
    distribution: string;
}
