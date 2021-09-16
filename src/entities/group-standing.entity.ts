import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Group } from "./group.entity";
import { Roster } from "./roster.entity";

@Entity()
export class GroupStanding {
    @PrimaryGeneratedColumn()
    groupStandingId: number;

    @Column()
    place: number;

    @Column()
    points: number;

    @ManyToOne(() => Group, (group) => group.groupStandings)
    group: Group;

    @ManyToOne(() => Roster, (roster) => roster.groupStandings)
    roster: Roster;
}