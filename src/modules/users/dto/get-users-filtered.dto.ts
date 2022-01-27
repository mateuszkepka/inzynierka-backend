import { IsEnum, IsOptional } from "class-validator";
import { Role } from "src/modules/auth/dto/roles.enum";

export class GetUsersQuery {
    @IsOptional()
    @IsEnum(Role)
    role: Role
}