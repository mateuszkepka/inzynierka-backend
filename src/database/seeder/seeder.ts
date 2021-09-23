import {
    GamesSeeder,
    GroupsSeeder,
    MatchesSeeder,
    PerformancesSeeder,
    PlayersSeeder,
    PresetsSeeder,
    PrizesSeeder,
    SuspensionsSeeder,
    TeamsSeeder,
    TournamentsSeeder,
    UsersSeeder,
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
    ) {}

    async seed() {
        await this.usersSeeder.seed(10);
        await this.gamesSeeder.seed(10);
        await this.groupsSeeder.seed(10);
        await this.matchesSeeder.seed(10);
        await this.performancesSeeder.seed(10);
        await this.playersSeeder.seed(10);
        await this.presetsSeeder.seed(10);
        await this.prizesSeeder.seed(10);
        await this.teamsSeeder.seed(10);
        await this.tournamentsSeeder.seed(10);
        await this.suspensionsSeeder.seed(10);
    }
}
