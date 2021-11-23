import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tournament } from './tournament.entity';
import { User } from './user.entity';

@Entity()
export class TournamentAdmin {
    @PrimaryGeneratedColumn()
    @Expose()
    tournamentAdminId: number;

    @Expose()
    @ManyToOne(() => Tournament, (tournament) => tournament.tournamentAdmins)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @ManyToOne(() => User, (user) => user.tournamentAdmins)
    @JoinColumn({ name: `userId` })
    user: User;

    @Expose()
    @Column()
    isAccepted: boolean;
}
