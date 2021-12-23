import { IsEnum, IsNotEmpty } from 'class-validator';
import { ParticipationStatus } from 'src/modules/teams/participation-status';

export class VerifyTeamDto {
    @IsNotEmpty()
    @IsEnum(ParticipationStatus)
    status: ParticipationStatus
}
