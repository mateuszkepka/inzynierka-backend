import { Entity, ManyToOne, PrimaryColumn } from "typeorm";

import { Player } from "./player.entity";
import { Roster } from "./roster.entity";

@Entity()
export class ActiveRoster {
    @PrimaryColumn()
    @ManyToOne(() => Player, (player) => player.activeRosters)
    player: Player;

    @PrimaryColumn()
    @ManyToOne(() => Roster, (roster) => roster.activeRosters)
    roster: Roster;
}