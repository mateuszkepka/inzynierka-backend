import {
    GamesSeeder,
    GroupRuleSeeder,
    GroupStandingSeeder,
    GroupsSeeder,
    LadderSeeder,
    LadderStandingSeeder,
    MapSeeder,
    MatchesSeeder,
    ParticipatingTeamSeeder,
    PerformancesSeeder,
    PlayersSeeder,
    PresetsSeeder,
    PrizesSeeder,
    SuspensionsSeeder,
    TeamsSeeder,
    TiebreakerRuleSeeder,
    TournamentsSeeder,
    UsersSeeder,
    TournamentAdminSeeder,
    PlayerTeamSeeder
} from './tables-seeders';

import { Injectable } from '@nestjs/common';

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
        private readonly mapSeeder: MapSeeder,
        private readonly groupRuleSeeder: GroupRuleSeeder,
        private readonly groupStandingSeeder: GroupStandingSeeder,
        private readonly ladderStandingSeeder: LadderStandingSeeder,
        private readonly ladderSeeder: LadderSeeder,
        private readonly tiebreakerRuleSeeder: TiebreakerRuleSeeder,
        private readonly rosterSeeder: ParticipatingTeamSeeder,
        private readonly playerTeamsSeeder: PlayerTeamSeeder,
    ) { }

    async seed() {
        const createdTeams = await this.teamsSeeder.seed(10);
        const createdGames = await this.gamesSeeder.seed(10);
        const createdUsers = await this.usersSeeder.seed(10);
        const createdPresets = await this.presetsSeeder.seed(10);
        const createdPrizes = await this.prizesSeeder.seed(10);
        const createdTournaments = await this.tournamentsSeeder.seed(
            10,
            createdPrizes,
            createdPresets,
            createdUsers,
            createdGames,
        );
        const createdRosters = await this.rosterSeeder.seed(
            10,
            createdTournaments,
            createdTeams);
        const createdMatches = await this.matchesSeeder.seed(
            10,
            createdRosters,
            createdTournaments,
        );
        const createdMaps = await this.mapSeeder.seed(10, createdMatches);
        const createdGroups = await this.groupsSeeder.seed(10, createdTournaments);
        const createdTiebreakerRules = await this.tiebreakerRuleSeeder.seed(10);
        const createdPlayers = await this.playersSeeder.seed(
            10,
            createdUsers,
            createdGames
        );
        const createdLadders = await this.ladderSeeder.seed(10, createdTournaments);

        await this.playerTeamsSeeder.seed(10, createdPlayers, createdTeams);
        await this.tournamentAdminSeeder.seed(10, createdTournaments, createdUsers);
        await this.performancesSeeder.seed(10, createdPlayers, createdMaps);
        await this.suspensionsSeeder.seed(10, createdUsers);
        await this.groupStandingSeeder.seed(10, createdTeams, createdGroups);
        await this.groupRuleSeeder.seed(10, createdGroups, createdTiebreakerRules);
        await this.ladderStandingSeeder.seed(10, createdTeams, createdLadders);
    }
}
