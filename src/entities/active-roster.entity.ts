import { Entity, ManyToOne } from 'typeorm';

import { Player } from './player.entity';
import { Roster } from './roster.entity';

@Entity()
export class ActiveRoster {
    @ManyToOne(() => Player, (player) => player.activeRosters, { primary: true })
    player: Player;

    @ManyToOne(() => Roster, (roster) => roster.activeRosters, { primary: true })
    roster: Roster;
}
