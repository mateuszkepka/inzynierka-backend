import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/roles.enum';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    university: string;

    @IsOptional()
    @IsString()
    studentId: string;

    @IsOptional()
    @IsEnum(Role)
    role: Role;
}
