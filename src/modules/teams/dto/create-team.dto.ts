import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateTeamDto {
    @IsNotEmpty()
    @IsString()
    teamName: string;
    
    @IsNotEmpty()
    @IsNumber()
    captainId: number;
}
