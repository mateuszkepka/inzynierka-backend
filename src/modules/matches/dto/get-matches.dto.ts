import { IsEnum, IsOptional } from "class-validator";
import { MatchStatus } from "src/modules/matches/interfaces/match-status.enum";

export class MatchQueryDto {
    @IsOptional()
    @IsEnum(MatchStatus)
    status: MatchStatus
}