import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateParticipatingTeamDto {
    @IsNotEmpty()
    @IsNumber()
    teamId: number;

    @IsNotEmpty()
    @IsString({ each: true })
    roster: string[]

    @IsOptional()
    @IsString({ each: true })
    subs: string[]
}