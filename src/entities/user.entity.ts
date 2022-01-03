import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Expose, Transform } from 'class-transformer';
import { Performance, Report } from '.';

import { Player } from './player.entity';
import { Role } from 'src/roles/roles.enum';
import { Suspension } from './suspension.entity';
import { Tournament } from './tournament.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { UserStatus } from 'src/modules/users/interfaces/user-status.enum';

@Entity()
@Unique([`university`, `studentId`])
export class User {
    @Expose()
    @PrimaryGeneratedColumn()
    userId: number;

    @Expose()
    @Column({ nullable: true, unique: true })
    username: string;

    @Expose()
    @Column({ nullable: true, unique: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Expose()
    @Column({ nullable: true })
    country: string;

    @Expose()
    @Column({ nullable: true })
    university: string;

    @Expose()
    @Column({ nullable: true })
    studentId: string;

    @Column(`text`, { array: true, default: [`user`], nullable: true })
    roles: Role[];

    @Column({
        type: `enum`,
        enum: UserStatus,
        default: UserStatus.Active,
    })
    status: UserStatus;

    @Column({ nullable: true })
    currentRefreshToken?: string;

    @Expose()
    @OneToMany(() => Performance, (performance) => performance.user)
    performances: Performance[];

    @Expose()
    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    organizedTournaments: Tournament[];

    @Expose()
    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @Expose()
    @Transform(
        ({ value }) => {
            if (value !== undefined) {
                return value[0].playerId;
            } else {
                return;
            }
        },
        { toPlainOnly: true },
    )
    @OneToMany(() => Player, (player) => player.user)
    accounts: Player[];

    @Expose()
    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.user)
    tournamentAdmins: TournamentAdmin[];

    @Expose()
    @OneToMany(() => Report, (report) => report.reportedUser)
    reportsReceived: Report[];

    @Expose()
    @OneToMany(() => Report, (report) => report.reportingUser)
    reportsSent: Report[];
}
