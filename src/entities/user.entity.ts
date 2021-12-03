import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Suspension } from './suspension.entity';
import { Tournament } from './tournament.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { Expose } from 'class-transformer';

@Entity()
export class User {
    @Expose()
    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    @Expose()
    username: string;

    @Column({ unique: true })
    @Expose()
    email: string;

    @Column()
    @Expose()
    password: string;

    @Column()
    @Expose()
    country: string;

    @Column()
    @Expose()
    university: string;

    @Column()
    @Expose()
    studentId: string;

    @Column({
        nullable: true,
    })
    currentRefreshToken?: string;

    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    @Expose()
    organizedTournaments: Tournament[];

    @OneToMany(() => Suspension, (suspension) => suspension.user)
    @Expose()
    suspensions: Suspension[];

    @OneToMany(() => Player, (player) => player.user)
    @Expose()
    accounts: Player[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.user)
    @Expose()
    tournamentAdmins: TournamentAdmin[];
}
