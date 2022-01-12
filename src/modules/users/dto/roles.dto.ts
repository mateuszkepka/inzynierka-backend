import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/roles/roles.enum';

export class RolesDto {
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}
