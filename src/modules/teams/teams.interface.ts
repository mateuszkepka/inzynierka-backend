import { PlayerInRoster } from '../players/player.interface';

export interface Roster {
    roster: PlayerInRoster[];
    subs: PlayerInRoster[];
}

export enum InvitationStatus {
    Pending = "pending",
    Refused = "refused",
    Accepted = "accepted"
}
