import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/modules/auth/dto/roles.enum';

export class RolesDto {
    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}
