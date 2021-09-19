import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { ActiveRoster } from "./active-roster.entity";
import { GroupStanding } from "./group-standing.entity";
import { LadderStanding } from "./ladder-standing.entity";
import { Match } from "./match.entity";
import { Team } from "./team.entity";

@Entity()
export class Roster {
    @PrimaryGeneratedColumn()
    rosterId: number;

    @Column()
    signDate: Date;

    @Column()
    isRegistered: boolean;

    @OneToMany(() => ActiveRoster, (activeRoster) => activeRoster.roster)
    activeRosters: ActiveRoster[];

    @OneToMany(() => GroupStanding, (groupStanding) => groupStanding.roster)
    groupStandings: GroupStanding[];

    @OneToMany(() => LadderStanding, (ladderStanding) => ladderStanding.roster)
    ladderStandings: LadderStanding[];

    @OneToMany(() => Match, (match) => match.firstRoster || match.secondRoster)
    matches: Match[];

    @ManyToOne(() => Team, (team) => team.rosters)
    team: Team;
}