import { Expose } from 'class-transformer';
import { MatchStatus } from 'src/modules/matches/match-status.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
    @Column({ nullable: true })
    matchEndDate: Date;

    @Expose()
    @Column()
    tournamentStage: string;

    @Expose()
    @Column({
        type: `enum`,
        enum: MatchStatus,
        default: MatchStatus.Scheduled,
    })
    matchStatus: MatchStatus;

    @Expose()
    @Column({ nullable: true })
    matchResult: string;

    @Expose()
    @Column({ nullable: true })
    numberOfMaps: number;

    @Expose()
    @ManyToOne(() => Tournament, (tournament) => tournament.matches)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @Expose()
    @ManyToOne(() => ParticipatingTeam)
    @JoinColumn({ name: `firstRosterId` })
    firstRoster: ParticipatingTeam;

    @Expose()
    @ManyToOne(() => ParticipatingTeam)
    @JoinColumn({ name: `secondRosterId` })
    secondRoster: ParticipatingTeam;

    @Expose()
    @OneToMany(() => Map, (map) => map.match)
    maps: Map[];
}
