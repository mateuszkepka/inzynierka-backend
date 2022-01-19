import { Request } from 'express';
import { User } from 'src/database/entities';
import { Role } from 'src/modules/auth/dto/roles.enum';

interface RequestWithUser extends Request {
    user: User;
    roles: Role[];
}

export default RequestWithUser;
