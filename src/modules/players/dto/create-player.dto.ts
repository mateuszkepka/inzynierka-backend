import { IsString } from 'class-validator';
export class CreatePlayerDto {
    @IsString()
    PUUID: string;

    @IsString()
    accountId: string;

    @IsString()
    summonerId: string;

    @IsString()
    region: string;
}
