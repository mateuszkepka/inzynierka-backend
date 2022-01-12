import { IsEnum, IsOptional } from 'class-validator';
import { MatchStatus } from 'src/modules/matches/interfaces/match-status.enum';

export class MatchQuery {
    @IsOptional()
    @IsEnum(MatchStatus)
    status: MatchStatus;
}
