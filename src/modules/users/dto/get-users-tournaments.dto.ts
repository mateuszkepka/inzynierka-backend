import { IsEnum, IsIn, IsNotEmpty, IsOptional } from "class-validator";
import { TournamentStatus } from "src/modules/tournaments/dto/tourrnament.status.enum";
import { Role } from "src/modules/auth/dto/roles.enum";

export class GetUsersTournamentsQuery {
    @IsOptional()
    @IsEnum(TournamentStatus)
    status: TournamentStatus;

    @IsNotEmpty()
    @IsIn([Role.Player, Role.TournamentAdmin, Role.Organizer])
    role: Role.Player | Role.TournamentAdmin | Role.Organizer;
}
