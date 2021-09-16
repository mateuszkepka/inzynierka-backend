import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { LadderStanding } from "./ladder-standing.entity";
import { Tournament } from "./tournament.entity";

@Entity()
export class Ladder {
    @PrimaryGeneratedColumn()
    ladderId: number;

    @OneToMany(() => LadderStanding, (ladderStanding) => ladderStanding.roster)
    ladderStandings: LadderStanding[];

    @ManyToOne(() => Tournament, (tournament) => tournament.ladders)
    tournament: Tournament;
    
}