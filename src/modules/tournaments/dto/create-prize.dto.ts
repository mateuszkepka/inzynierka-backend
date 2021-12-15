import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePrizeDto {
    @IsNotEmpty()
    @IsString()
    currency: string;

    @IsNotEmpty()
    @IsString()
    distribution: string;
}
