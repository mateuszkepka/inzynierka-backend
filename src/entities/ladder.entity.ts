import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Match } from '.';

import { LadderStanding } from './ladder-standing.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Ladder {
    @PrimaryGeneratedColumn()
    ladderId: number;

    @OneToMany(() => LadderStanding, (ladderStanding) => ladderStanding.team)
    ladderStandings: LadderStanding[];

    @ManyToOne(() => Tournament, (tournament) => tournament.ladders)
    @JoinColumn({ name: `tournamentId` })
    tournament: Tournament;

    @OneToMany(() => Match, (match) => match.ladder)
    matches: Match[]
}
