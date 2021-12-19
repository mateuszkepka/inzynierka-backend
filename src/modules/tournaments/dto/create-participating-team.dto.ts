import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateParticipatingTeamDto {
    @IsNotEmpty()
    @IsNumber()
    teamId: number;

    @IsNotEmpty()
    @IsArray()
    @Type(() => RosterMember)
    roster: RosterMember[]

    @IsOptional()
    @IsArray()
    @Type(() => RosterMember)
    subs: RosterMember[]
}

export class RosterMember {
    username: string;
    playerId: number;
}