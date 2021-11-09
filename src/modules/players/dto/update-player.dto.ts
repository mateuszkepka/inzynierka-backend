import { IsOptional, IsString } from 'class-validator';
export class UpdatePlayerDto {
    @IsString()
    @IsOptional()
    PUUID: string;

    @IsString()
    @IsOptional()
    accountId: string;

    @IsString()
    @IsOptional()
    summonerId: string;

    @IsString()
    @IsOptional()
    region: string;
}
