import { Injectable } from '@nestjs/common';
import {
    FormatsSeeder, GamesSeeder, InvitationsSeeder, MapSeeder, MatchesSeeder, ParticipatingTeamSeeder, PlayersSeeder, PrizesSeeder, SuspensionsSeeder,
    TeamsSeeder, TournamentAdminSeeder, TournamentsSeeder, UsersSeeder
} from './tables-seeders';

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
        private readonly tournamentsSeeder: TournamentsSeeder,
        private readonly rostersSeeder: ParticipatingTeamSeeder,
        private readonly adminsSeeder: TournamentAdminSeeder,
        private readonly matchesSeeder: MatchesSeeder,
        private readonly mapsSeeder: MapSeeder,
    ) { }

    async seed() {
        const game = await this.gamesSeeder.seed();
        const formats = await this.formatsSeeder.seed();
        const users = await this.usersSeeder.seed(300);
        const players = await this.playersSeeder.seed(users, game);
        const teams = await this.teamsSeeder.seed(players);
        const prizes = await this.prizesSeeder.seed(20);
        const tournaments = await this.tournamentsSeeder.seed(20, prizes, formats, users, game);
        await this.adminsSeeder.seed(tournaments);
        await this.suspensionsSeeder.seed(users);
        await this.invitationsSeeder.seed(players, teams);
        await this.rostersSeeder.seed(tournaments);
        await this.matchesSeeder.seed(tournaments);
        await this.mapsSeeder.seed();
    }
}