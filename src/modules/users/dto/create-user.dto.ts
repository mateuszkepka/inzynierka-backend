import { IsEmail, IsString } from 'class-validator';

// TODO add all properties
export class CreateUserDto {
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
