import { IsEmail, IsOptional, IsString } from 'class-validator';

// TODO add all properties
export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    @IsOptional()
    username: string;

    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    university: string;

    @IsString()
    @IsOptional()
    studentId: string;
}
