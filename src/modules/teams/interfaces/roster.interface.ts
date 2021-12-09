import { PlayerInRoster } from '../../players/interfaces/player.interface';

export interface Roster {
    roster: PlayerInRoster[];
    subs: PlayerInRoster[];
}