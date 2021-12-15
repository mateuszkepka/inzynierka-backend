import { IsEnum, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import { TournamentStatus } from "src/modules/tournaments/interfaces/tourrnament.status-enum";
import { Role } from "src/roles/roles.enum";

export class GetTournamentsQuery {
    @IsOptional()
    @IsEnum(TournamentStatus)
    status: TournamentStatus;

    @IsNotEmpty()
    @IsIn([Role.Player, Role.TournamentAdmin, Role.Organizer])
    role: Role.Player | Role.TournamentAdmin | Role.Organizer
}