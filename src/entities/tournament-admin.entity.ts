import { Expose } from 'class-transformer';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tournament } from './tournament.entity';
import { User } from './user.entity';

@Entity()
export class TournamentAdmin {
    @PrimaryGeneratedColumn()
    @Expose()
    tournamentAdminId: number;

    @Expose()
    @ManyToOne(() => Tournament, (tournament) => tournament.tournamentAdmins, {
        onDelete: `CASCADE`,
        eager: true,
    })
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @ManyToOne(() => User, (user) => user.tournamentAdmins, {
        onDelete: `CASCADE`,
        cascade: true,
        eager: true,
    })
    @JoinColumn({ name: `userId` })
    user: User;
}
