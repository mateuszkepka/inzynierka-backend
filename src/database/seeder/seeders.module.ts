import * as entities from 'src/entities';
import * as seeders from './tables-seeders';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            entities.User,
            entities.Game,
            entities.Group,
            entities.Match,
            entities.Performance,
            entities.Player,
            entities.Preset,
            entities.Prize,
            entities.Suspension,
            entities.Team,
            entities.Tournament,
        ]),
    ],
    providers: [
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.GroupsSeeder,
        seeders.MatchesSeeder,
        seeders.PerformancesSeeder,
        seeders.PlayersSeeder,
        seeders.PresetsSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.TournamentsSeeder,
    ],
    exports: [
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.GroupsSeeder,
        seeders.MatchesSeeder,
        seeders.PerformancesSeeder,
        seeders.PlayersSeeder,
        seeders.PresetsSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.TournamentsSeeder,
    ],
})
export class SeedersModule {}
