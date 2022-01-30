export enum MatchStatus {
    Scheduled = `scheduled`,
    Postponed = `postponed`,
    Finished = `finished`,
    Cancelled = `cancelled`,
    Resolving = `resolving`,
    Unresolved = `unresolved`
}

export enum FilteredMatchStatus {
    Scheduled = `scheduled`,
    Finished = `finished`,
    Cancelled = `cancelled`,
    Resolving = `resolving`,
}

export type DatabaseMatchStatus = MatchStatus | FilteredMatchStatus;
