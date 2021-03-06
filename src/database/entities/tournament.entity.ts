import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Expose, Transform } from 'class-transformer';
import { ParticipatingTeam, TournamentAdmin } from '.';
import { AdjustDate } from 'src/decorators/adjust-date.validator';
import { Format } from './format.entity';
import { Game } from './game.entity';
import { Group } from './group.entity';
import { Ladder } from './ladder.entity';
import { Match } from './match.entity';
import { Prize } from './prize.entity';
import { TournamentStatus } from 'src/modules/tournaments/dto/tourrnament.status.enum';
import { User } from './user.entity';

@Entity()
export class Tournament {
    @BeforeInsert()
    setDates() {
        this.checkInCloseDate = new Date(this.tournamentStartDate.valueOf());
        this.checkInCloseDate.setMinutes(this.checkInCloseDate.getMinutes() - 5);
        this.checkInOpenDate = new Date(this.tournamentStartDate.valueOf());
        this.checkInOpenDate.setMinutes(this.checkInOpenDate.getMinutes() - 35);
    }

    @Expose()
    @PrimaryGeneratedColumn()
    tournamentId: number;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Column()
    numberOfPlayers: number;

    @Expose()
    @Column()
    numberOfTeams: number;

    @Expose()
    @Column({ nullable: true })
    numberOfGroups: number;

    @Expose()
    @Column()
    numberOfMaps: number;

    @Expose()
    @AdjustDate()
    registerStartDate: Date;

    @Expose()
    @AdjustDate()
    registerEndDate: Date;

    @Expose()
    @AdjustDate()
    tournamentStartDate: Date;

    @Expose()
    @AdjustDate()
    checkInOpenDate: Date;

    @Expose()
    @AdjustDate()
    checkInCloseDate: Date;

    @Expose()
    @Column()
    endingHour: number;

    @Expose()
    @Column()
    endingMinutes: number;

    @Expose()
    @Column({
        type: `enum`,
        enum: TournamentStatus,
        default: TournamentStatus.Upcoming,
    })
    status: TournamentStatus;

    @Expose()
    @Column()
    description: string;

    @Expose({ name: `gameId` })
    @Transform(({ value }) => {
        if (value === undefined) {
            return;
        }
        return value.gameId;
    }, { toPlainOnly: true })
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @Expose({ name: `organizerId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.userId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => User, (user) => user.organizedTournaments, { onDelete: `NO ACTION` })
    @JoinColumn({ name: `organizerId` })
    organizer: User;

    @OneToMany(() => Group, (group) => group.tournament)
    groups: Group[];

    @OneToMany(() => Ladder, (ladder) => ladder.tournament)
    ladders: Ladder[];

    @OneToMany(() => Match, (match) => match.tournament)
    matches: Match[];

    @OneToMany(() => TournamentAdmin, (tournamentAdmin) => tournamentAdmin.tournament)
    tournamentAdmins: TournamentAdmin[];

    @Expose({ name: `formatId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.name;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Format, { eager: true, nullable: true })
    @JoinColumn({ name: `formatId` })
    format: Format;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.tournament)
    rosters: ParticipatingTeam[];

    @Expose()
    @ManyToOne(() => Prize, { cascade: true, eager: true, nullable: true })
    @JoinColumn({ name: `prizeId` })
    prize: Prize;

    @Expose()
    @Column({ default: `default-tournament-avatar.png` })
    profilePicture: string;

    @Expose()
    @Column({ default: `default-tournament-background.png` })
    backgroundPicture: string;
}
