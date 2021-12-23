import { IsEnum, IsOptional } from "class-validator";
import { ParticipationStatus } from "src/modules/teams/participation-status";

export class ParticipatingTeamQuery {
    @IsOptional()
    @IsEnum(ParticipationStatus)
    status: ParticipationStatus
}