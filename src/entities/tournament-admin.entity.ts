import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tournament } from './tournament.entity';
import { User } from './user.entity';

@Entity()
export class TournamentAdmin {
    @ManyToOne(() => Tournament, (tournament) => tournament.tournamentAdmins, { primary: true })
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @ManyToOne(() => User, (user) => user.tournamentAdmins, { primary: true })
    @JoinColumn({ name: `userId` })
    user: User;
}
