import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { Player, Suspension, Tournament } from 'src/entities';

export class DefaultUserDto {
    @Expose()
    userId: number;

    @Expose()
    username: string;

    @Expose()
    email: string;

    password: string;

    @Expose()
    country: string;

    @Expose()
    university: string;

    @Expose()
    studentId: string;

    @Expose()
    @IsArray()
    @Type(() => Suspension)
    @ValidateNested({ each: true })
    suspensions: Suspension[];

    @Expose()
    @IsArray()
    @Type(() => Player)
    @ValidateNested({ each: true })
    accounts: Player[];

    @Expose()
    @IsArray()
    @Type(() => Tournament)
    @ValidateNested({ each: true })
    organizedTournaments: Tournament[];
}
