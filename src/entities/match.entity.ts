import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Map } from './map.entity';
import { ParticipatingTeam } from './participating-team.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    matchId: number;

    @Column()
    matchStartDate: Date;

    @Column()
    matchEndDate: Date;

    @Column()
    tournamentStage: string;

    @Column()
    matchResult: string;

    @ManyToOne(() => Tournament, (tournament) => tournament.matches)
    @JoinColumn({ name: "tournamentId" })
    tournament: Tournament;

    @ManyToOne(() => ParticipatingTeam)
    @JoinColumn({ name: "firstRosterId" })
    firstRoster: ParticipatingTeam;

    @ManyToOne(() => ParticipatingTeam)
    @JoinColumn({ name: "secondRosterId" })
    secondRoster: ParticipatingTeam;

    @OneToMany(() => Map, (map) => map.match)
    maps: Map[];
}
