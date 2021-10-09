import {
    ActiveRosterSeeder,
    GamesSeeder,
    GroupRuleSeeder,
    GroupStandingSeeder,
    GroupsSeeder,
    LadderSeeder,
    LadderStandingSeeder,
    MapSeeder,
    MatchesSeeder,
    PerformancesSeeder,
    PlayersSeeder,
    PresetsSeeder,
    PrizesSeeder,
    SuspensionsSeeder,
    TeamsSeeder,
    TiebrakerRuleSeeder,
    TournamentsSeeder,
    UsersSeeder,
} from './tables-seeders';

import { Injectable } from '@nestjs/common';
import { RosterSeeder } from './tables-seeders/roster.seeder';
import { TournamentAdminSeeder } from './tables-seeders/tournament-admin.seeder';

@Injectable()
export class Seeder {
    constructor(
        private readonly usersSeeder: UsersSeeder,
        private readonly gamesSeeder: GamesSeeder,
        private readonly groupsSeeder: GroupsSeeder,
        private readonly matchesSeeder: MatchesSeeder,
        private readonly performancesSeeder: PerformancesSeeder,
        private readonly playersSeeder: PlayersSeeder,
        private readonly presetsSeeder: PresetsSeeder,
        private readonly prizesSeeder: PrizesSeeder,
        private readonly teamsSeeder: TeamsSeeder,
        private readonly tournamentsSeeder: TournamentsSeeder,
        private readonly suspensionsSeeder: SuspensionsSeeder,
        private readonly tournamentAdminSeeder: TournamentAdminSeeder,
        private readonly rosterSeeder: RosterSeeder,
        private readonly mapSeeder: MapSeeder,
        private readonly activeRosterSeeder: ActiveRosterSeeder,
        private readonly groupRuleSeeder: GroupRuleSeeder,
        private readonly groupStandingSeeder: GroupStandingSeeder,
        private readonly ladderStandingSeeder: LadderStandingSeeder,
        private readonly ladderSeeder: LadderSeeder,
        private readonly tiebrakerRuleSeeder: TiebrakerRuleSeeder,
    ) {}

    async seed() {
        const createdTeams = await this.teamsSeeder.seed(10);
        const createdRosters = await this.rosterSeeder.seed(10, createdTeams);

        const createdUsers = await this.usersSeeder.seed(10);
        const createdPresets = await this.presetsSeeder.seed(10);
        const createdTournaments = await this.tournamentsSeeder.seed(
            10,
            createdPresets,
            createdUsers,
        );
        const createdMatches = await this.matchesSeeder.seed(
            10,
            createdRosters,
            createdTournaments,
        );
        const createdMaps = await this.mapSeeder.seed(10, createdMatches);
        const createdGroups = await this.groupsSeeder.seed(10, createdTournaments);
        const createdTiebrakerRules = await this.tiebrakerRuleSeeder.seed(10);
        const createdPlayers = await this.playersSeeder.seed(10, createdUsers);
        const createdLadders = await this.ladderSeeder.seed(10, createdTournaments);

        await this.tournamentAdminSeeder.seed(10, createdTournaments, createdUsers);

        await this.gamesSeeder.seed(10, createdTournaments);
        await this.prizesSeeder.seed(10, createdTournaments);

        await this.performancesSeeder.seed(10, createdPlayers, createdMaps);
        await this.suspensionsSeeder.seed(10, createdUsers);

        await this.activeRosterSeeder.seed(10, createdPlayers, createdRosters);

        await this.groupStandingSeeder.seed(10, createdRosters, createdGroups);

        await this.groupRuleSeeder.seed(10, createdGroups, createdTiebrakerRules);

        await this.ladderStandingSeeder.seed(10, createdRosters, createdLadders);
    }
}
