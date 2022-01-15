import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class CreateParticipatingTeamDto {
    @IsNotEmpty()
    @IsNumber()
    teamId: number;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RosterMember)
    roster: RosterMember[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RosterMember)
    subs: RosterMember[];
}

export class RosterMember {
    @Expose()
    @IsNotEmpty()
    @IsString()
    username: string;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    playerId: number;
}
