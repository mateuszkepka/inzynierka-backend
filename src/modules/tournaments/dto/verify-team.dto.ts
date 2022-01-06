import { IsEnum, IsNotEmpty } from 'class-validator';
import { ParticipationStatus } from 'src/modules/teams/dto/participation-status';

export class VerifyTeamDto {
    @IsNotEmpty()
    @IsEnum(ParticipationStatus)
    status: ParticipationStatus
}
