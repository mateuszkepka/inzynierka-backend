import { Request } from 'express';
import { User } from 'src/database/entities';
import { Role } from 'src/roles/roles.enum';

interface RequestWithUser extends Request {
    user: User;
    roles: Role[];
}

export default RequestWithUser;
