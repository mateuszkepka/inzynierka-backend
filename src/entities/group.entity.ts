import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { GroupRule } from "./group-rule.entity";
import { GroupStanding } from "./group-standing.entity";
import { Tournament } from "./tournament.entity";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    groupId: number;

    @Column()
    numberOfTeams: number;

    @Column()
    numberOfQualifying: number;

    @OneToMany(() => GroupRule, (groupRule) => groupRule.group)
    groupRules: GroupRule[]; 

    @OneToMany(() => GroupStanding, (groupStanding) => groupStanding.group)
    groupStandings: GroupStanding[];

    @ManyToOne(() => Tournament, (tournament) => tournament.groups)
    tournament: Tournament;
}