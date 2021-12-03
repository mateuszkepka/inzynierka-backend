import { PlayerInRoster } from '../players/player.interface';

export interface Roster {
    roster: PlayerInRoster[];
    subs: PlayerInRoster[];
}

export enum InvitationStatus {
    PENDING,
    REFUSED,
    ACCEPTED,
}
