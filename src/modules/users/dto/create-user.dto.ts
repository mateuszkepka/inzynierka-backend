import { IsEmail, IsString } from "class-validator";

// TODO add all properties
export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}