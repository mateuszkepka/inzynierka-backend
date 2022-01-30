import { Expose, Transform } from 'class-transformer';
import { AdjustDate } from 'src/decorators/adjust-date.validator';
import { MatchStatus } from 'src/modules/matches/interfaces/match-status.enum';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group, Ladder, Team } from '.';
import { Map } from './map.entity';
import { ParticipatingTeam } from './participating-team.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Match {
    @BeforeInsert()
    setDates() {
        this.matchStartDate = new Date();
    }

    @Expose()
    @PrimaryGeneratedColumn()
    matchId: number;

    @Expose()
    @AdjustDate()
    matchStartDate: Date;

    @Expose()
    @AdjustDate({ nullable: true, default: null })
    matchEndDate: Date;

    @Expose()
    @Column({
        type: `enum`,
        enum: MatchStatus,
        default: MatchStatus.Scheduled,
    })
    status: MatchStatus;

    @Expose()
    @Column({ default: null, nullable: true })
    winner: number;

    @Expose()
    @Column({ nullable: true })
    numberOfMaps: number;

    @Expose({ name: `tournamentId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.tournamentId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Tournament, (tournament) => tournament.matches)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose({ name: `groupId` })
    @Transform(({ value }) => {
        if (value != null) {
            return value.groupId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Group, (group) => group.matches, { nullable: true })
    @JoinColumn({ name: `groupId` })
    group: Group;

    @Expose()
    @Column({ nullable: true, default: null })
    round: number;

    @Expose()
    @Column({ nullable: true, default: null })
    position: number;

    @Expose()
    @ManyToOne(() => Ladder, (ladder) => ladder.matches)
    @JoinColumn({ name: `ladderId` })
    ladder: Ladder;

    @Expose()
    @ManyToOne(() => ParticipatingTeam, { nullable: true })
    @JoinColumn({ name: `firstRosterId` })
    firstRoster: ParticipatingTeam;

    @Expose()
    @ManyToOne(() => ParticipatingTeam, { nullable: true })
    @JoinColumn({ name: `secondRosterId` })
    secondRoster: ParticipatingTeam;

    @Expose()
    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: `firstTeamId` })
    firstTeam: Team;

    @Expose()
    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn({ name: `secondTeamId` })
    secondTeam: Team;

    @AdjustDate({ nullable: true, default: null })
    firstCaptainDate: Date;

    @AdjustDate({ nullable: true, default: null })
    secondCaptainDate: Date;

    @Expose()
    @OneToMany(() => Map, (map) => map.match)
    maps: Map[];
}
