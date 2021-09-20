import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    username: string;

    @IsString()
    country: string;

    @IsString()
    university: string;

    @IsString()
    studentId: string;
}
