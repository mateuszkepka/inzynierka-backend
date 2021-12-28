import {
    GamesSeeder,
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
    TournamentsSeeder,
    UsersSeeder,
    TournamentAdminSeeder,
    InvitationsSeeder
} from './tables-seeders';

import { Injectable } from '@nestjs/common';

@Injectable()
export class Seeder {
    constructor(
        private readonly usersSeeder: UsersSeeder,
        private readonly gamesSeeder: GamesSeeder,
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
        private readonly ladderStandingSeeder: LadderStandingSeeder,
        private readonly ladderSeeder: LadderSeeder,
        private readonly rosterSeeder: ParticipatingTeamSeeder,
        private readonly invitationsSeeder: InvitationsSeeder,
    ) { }

    async seed() {
        const createdUsers = await this.usersSeeder.seed(10);
        const createdGame = await this.gamesSeeder.seed();
        const createdPlayers = await this.playersSeeder.seed(
            10,
            createdUsers,
            createdGame
        );
        const createdTeams = await this.teamsSeeder.seed(10, createdPlayers);
        const createdPresets = await this.presetsSeeder.seed(10);
        const createdPrizes = await this.prizesSeeder.seed(10);
        const createdTournaments = await this.tournamentsSeeder.seed(
            10,
            createdPrizes,
            createdPresets,
            createdUsers,
            createdGame,
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
        const createdLadders = await this.ladderSeeder.seed(10, createdTournaments);
        await this.invitationsSeeder.seed(10, createdPlayers, createdTeams);
        await this.tournamentAdminSeeder.seed(10, createdTournaments, createdUsers);
        await this.performancesSeeder.seed(10, createdPlayers, createdMaps);
        await this.suspensionsSeeder.seed(10, createdUsers);
        await this.ladderStandingSeeder.seed(10, createdTeams, createdLadders);
    }
}
