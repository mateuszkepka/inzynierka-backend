import { Expose, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { Player, Suspension } from 'src/entities';


export class DefaultUserDto {
    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
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
}