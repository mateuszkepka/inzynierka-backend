import { IsEnum, IsNotEmpty } from "class-validator";
import { MatchStatus } from "src/modules/matches/match-status.enum";

export class MatchStatusQuery {
    @IsNotEmpty()
    @IsEnum(MatchStatus)
    status: MatchStatus
}