import { player } from "src/modules/players/interfaces/player";

export interface Roster {
    roster: player[];
    subs: player[];
}