import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGameDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    genre: string;
}
