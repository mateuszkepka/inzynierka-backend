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
            entities.Format,
            entities.Prize,
            entities.Suspension,
            entities.Team,
            entities.Tournament,
            entities.ParticipatingTeam,
            entities.LadderStanding,
            entities.Ladder,
            entities.Map,
            entities.Invitation,
            entities.TournamentAdmin,
        ]),
    ],
    providers: [
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.MatchesSeeder,
        seeders.PerformancesSeeder,
        seeders.PlayersSeeder,
        seeders.PresetsSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.ParticipatingTeamSeeder,
        seeders.TournamentsSeeder,
        seeders.LadderStandingSeeder,
        seeders.LadderSeeder,
        seeders.MapSeeder,
        seeders.InvitationsSeeder,
        seeders.TournamentAdminSeeder,
    ],
    exports: [
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.MatchesSeeder,
        seeders.PerformancesSeeder,
        seeders.PlayersSeeder,
        seeders.PresetsSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.ParticipatingTeamSeeder,
        seeders.TournamentsSeeder,
        seeders.LadderStandingSeeder,
        seeders.LadderSeeder,
        seeders.MapSeeder,
        seeders.InvitationsSeeder,
        seeders.TournamentAdminSeeder,
    ],
})
export class SeedersModule {}
