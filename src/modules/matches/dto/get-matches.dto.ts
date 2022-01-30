import { IsEnum, IsOptional } from 'class-validator';
import { FilteredMatchStatus, MatchStatus } from 'src/modules/matches/interfaces/match-status.enum';

export class MatchQuery {
    @IsOptional()
    @IsEnum(FilteredMatchStatus)
    status: MatchStatus;
}
