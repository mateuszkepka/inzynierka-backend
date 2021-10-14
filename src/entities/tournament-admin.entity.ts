import { Entity, ManyToOne } from 'typeorm';

import { Tournament } from './tournament.entity';
import { User } from '../modules/users/user.entity';

@Entity()
export class TournamentAdmin {
    @ManyToOne(() => Tournament, (tournament) => tournament.tournamentAdmins, { primary: true })
    tournament: Tournament;

    @ManyToOne(() => User, (user) => user.tournamentAdmins, { primary: true })
    user: User;
}
