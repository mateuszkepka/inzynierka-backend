import { Expose, Transform } from 'class-transformer';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { UserStatus } from 'src/modules/users/dto/user-status.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Report } from '.';
import { Player } from './player.entity';
import { Suspension } from './suspension.entity';
import { TournamentAdmin } from './tournament-admin.entity';
import { Tournament } from './tournament.entity';

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

    @Expose()
    @Column({
        type: `text`,
        array: true,
        default: [`user`],
    })
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
    @OneToMany(() => Tournament, (tournament) => tournament.organizer)
    organizedTournaments: Tournament[];

    @Expose()
    @OneToMany(() => Suspension, (suspension) => suspension.user)
    suspensions: Suspension[];

    @Expose()
    @Transform(({ value }) => {
        if (value !== undefined) {
            const returnValue: number[] = [];
            value.forEach((player: Player) => {
                returnValue.push(player.playerId)
            });
            return returnValue;
        } else {
            return;
        }
    }, { toPlainOnly: true })
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

    @Expose()
    @Column({ default: `default-user-avatar.png` })
    profilePicture: string;

    @Expose()
    @Column({ default: `default-user-background.png` })
    backgroundPicture: string;
}
