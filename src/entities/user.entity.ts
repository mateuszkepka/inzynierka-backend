import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { Player } from './player.entity';
import { Suspension } from './suspension.entity';
import { Tournament } from './tournament.entity';
import { TournamentAdmin } from './tournament-admin.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @Expose()
    userId: number;

    @Column()
    @Expose()
    username: string;

    @Column({ unique: true })
    @Expose()
    email: string;

    @Column()
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
    players: Player[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.user)
    @Expose()
    tournamentAdmins: TournamentAdmin[];
}
