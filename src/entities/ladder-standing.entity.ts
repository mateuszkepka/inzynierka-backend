import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Ladder } from "./ladder-entity";
import { Roster } from "./roster.entity";

@Entity()
export class LadderStanding {
    @PrimaryGeneratedColumn()
    ladderStandingId: number;

    @Column()
    stage: string;

    @ManyToOne(() => Roster, (roster) => roster.ladderStandings)
    roster: Roster;

    @ManyToOne(() => Ladder, (ladder) => ladder.ladderStandings)
    ladder: Ladder;
}