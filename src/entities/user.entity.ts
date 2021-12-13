import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Player } from './player.entity';
import { Suspension } from './suspension.entity';
import { Tournament } from './tournament.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { Expose } from 'class-transformer';
import { Role } from 'src/roles/roles.enum';

@Entity()
@Unique([`university`, `studentId`])
export class User {
    @Expose()
    @PrimaryGeneratedColumn()
    userId: number;

    @Expose()
    @Column({ unique: true })
    username: string;

    @Expose()
    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Expose()
    @Column()
    country: string;

    @Column()
    university: string;

    @Column()
    studentId: string;

    @Column(`text`, {
        array: true,
        default: [`user`],
    })
    roles: Role[];

    @Column({ nullable: true })
    currentRefreshToken?: string;

    @Expose()
    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    organizedTournaments: Tournament[];

    @Expose()
    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @Expose()
    @OneToMany(() => Player, (player) => player.user)
    accounts: Player[];

    @Expose()
    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.user)
    tournamentAdmins: TournamentAdmin[];
}
