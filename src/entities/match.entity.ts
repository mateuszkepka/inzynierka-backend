import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Map } from "./map.entity";
import { Roster } from "./roster.entity";
import { Tournament } from "./tournament.entity";

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
    tournament: Tournament;

    @ManyToOne(() => Roster, (roster) => roster.matches)
    firstRoster: Roster;

    @ManyToOne(() => Roster, (roster) => roster.matches)
    secondRoster: Roster;

    @OneToMany(() => Map, (map) => map.match)
    maps: Map[]
}