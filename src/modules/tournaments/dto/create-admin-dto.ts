import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAdminDto {
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
