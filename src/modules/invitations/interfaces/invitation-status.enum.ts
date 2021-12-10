export enum InvitationStatus {
    Pending = `pending`,
    Refused = `refused`,
    Accepted = `accepted`,
}

export enum ResponseStatus {
    Refused = `refused`,
    Accepted = `accepted`,
}

export type Status = InvitationStatus | ResponseStatus;
