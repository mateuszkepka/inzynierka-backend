import { IsEnum, IsOptional } from "class-validator";
import { ParticipationStatus } from "src/modules/teams/dto/participation-status";

export class ParticipatingTeamQuery {
    @IsOptional()
    @IsEnum(ParticipationStatus)
    status: ParticipationStatus
}