import * as entities from 'src/entities';
import * as seeders from './tables-seeders';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            entities.Game,
            entities.Group,
            entities.GroupStanding,
            entities.Ladder,
            entities.LadderStanding,
            entities.Map,
            entities.Match,
            entities.Performance,
            entities.ParticipatingTeam,
            entities.Player,
            entities.Format,
            entities.Prize,
            entities.Suspension,
            entities.Team,
            entities.Invitation,
            entities.Tournament,
            entities.TournamentAdmin,
            entities.User,
            entities.Report,
        ]),
    ],
    providers: [
        seeders.FormatsSeeder,
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.MatchesSeeder,
        seeders.PerformancesSeeder,
        seeders.PlayersSeeder,
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
        seeders.FormatsSeeder,
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
