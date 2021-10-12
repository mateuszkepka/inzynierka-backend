import { IsString, IsNumber } from 'class-validator';
export class CreateTeamDto {
    @IsString()
    name: string;

    @IsNumber()
    creationDate: Date;
}
