import {
    GamesSeeder,
    FormatsSeeder,
    UsersSeeder,
    PlayersSeeder,
    SuspensionsSeeder,
    TeamsSeeder,
    InvitationsSeeder,
    PrizesSeeder,
    // LadderSeeder,
    // LadderStandingSeeder,
    // MapSeeder,
    // MatchesSeeder,
    // ParticipatingTeamSeeder,
    // PerformancesSeeder,
    // TournamentsSeeder,
    // TournamentAdminSeeder,
} from './tables-seeders';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Seeder {
    constructor(
        private readonly gamesSeeder: GamesSeeder,
        private readonly formatsSeeder: FormatsSeeder,
        private readonly usersSeeder: UsersSeeder,
        private readonly playersSeeder: PlayersSeeder,
        private readonly suspensionsSeeder: SuspensionsSeeder,
        private readonly teamsSeeder: TeamsSeeder,
        private readonly invitationsSeeder: InvitationsSeeder,
        private readonly prizesSeeder: PrizesSeeder,
        // private readonly matchesSeeder: MatchesSeeder,
        // private readonly performancesSeeder: PerformancesSeeder,
        // private readonly tournamentsSeeder: TournamentsSeeder,
        // private readonly tournamentAdminSeeder: TournamentAdminSeeder,
        // private readonly mapSeeder: MapSeeder,
        // private readonly ladderStandingSeeder: LadderStandingSeeder,
        // private readonly ladderSeeder: LadderSeeder,
        // private readonly rosterSeeder: ParticipatingTeamSeeder,
    ) { }

    async seed() {
        const game = await this.gamesSeeder.seed();
        const formats = await this.formatsSeeder.seed();
        const users = await this.usersSeeder.seed(100);
        const players = await this.playersSeeder.seed(users, game);
        const suspensions = await this.suspensionsSeeder.seed(users);
        const teams = await this.teamsSeeder.seed(players);
        const invitations = await this.invitationsSeeder.seed(players, teams);
        const prizes = await this.prizesSeeder.seed(10);
    }
}
