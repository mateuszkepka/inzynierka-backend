import { Expose, Transform } from 'class-transformer';
import { MatchStatus } from 'src/modules/matches/interfaces/match-status.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Group, LadderStanding, Team } from '.';
import { Map } from './map.entity';
import { ParticipatingTeam } from './participating-team.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Match {
    @Expose()
    @PrimaryGeneratedColumn()
    matchId: number;

    @Expose()
    @Column()
    matchStartDate: Date;

    @Expose()
    @Column({ default: null, nullable: true })
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
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Tournament, (tournament) => tournament.matches)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose({ name: `groupId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.groupId;
        } else {
            return
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Group, (group) => group.matches, { nullable: true })
    group: Group;

    @Expose()
    @OneToMany(() => LadderStanding, (standing) => standing.match, { nullable: true })
    standings: LadderStanding[];

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

    @Expose()
    @OneToMany(() => Map, (map) => map.match)
    maps: Map[];
}