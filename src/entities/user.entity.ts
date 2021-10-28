import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { Suspension } from './suspension.entity';
import { Tournament } from './tournament.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { Expose } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Expose()
    @Column()
    username: string;

    @Expose()
    @Column({ unique: true })
    email: string;

    @Expose()
    @Column()
    password: string;

    @Expose()
    @Column()
    country: string;

    @Expose()
    @Column()
    university: string;

    @Expose()
    @Column()
    studentId: string;

    @Column({
        nullable: true,
    })
    currentRefreshToken?: string;

    @Expose()
    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    @Expose()
    organizedTournaments: Tournament[];

    @Expose()
    @OneToMany(() => Suspension, (suspension) => suspension.user)
    @Expose()
    suspensions: Suspension[];

    @Expose()
    @OneToMany(() => Player, (player) => player.user)
    accounts: Player[];

    @Expose()
    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.user)
    tournamentAdmins: TournamentAdmin[];
}
