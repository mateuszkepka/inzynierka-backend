import { IsEnum, IsOptional } from "class-validator";
import { TournamentStatus } from "./tourrnament.status.enum";

export class TournamentQueryDto {
    @IsOptional()
    @IsEnum(TournamentStatus)
    status: TournamentStatus
}