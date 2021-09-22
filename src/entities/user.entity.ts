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
    organizedTournaments: Tournament[];

    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @OneToMany(() => Player, (player) => player.user)
    players: Player[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.tournament)
    tournamentAdmins: TournamentAdmin[];
}
