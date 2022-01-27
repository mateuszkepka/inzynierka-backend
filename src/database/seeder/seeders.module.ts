import * as entities from 'src/database/entities';
import * as seeders from './tables-seeders'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentsModule } from 'src/modules/tournaments/tournaments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MatchesModule } from 'src/modules/matches/matches.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            entities.Game,
            entities.GroupStanding,
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
        TournamentsModule,
        MatchesModule
    ],
    providers: [
        seeders.FormatsSeeder,
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.MatchesSeeder,
        seeders.PlayersSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.ParticipatingTeamSeeder,
        seeders.TournamentsSeeder,
        seeders.MapSeeder,
        seeders.InvitationsSeeder,
        seeders.TournamentAdminSeeder,
    ],
    exports: [
        seeders.UsersSeeder,
        seeders.GamesSeeder,
        seeders.MatchesSeeder,
        seeders.PlayersSeeder,
        seeders.FormatsSeeder,
        seeders.PrizesSeeder,
        seeders.SuspensionsSeeder,
        seeders.TeamsSeeder,
        seeders.ParticipatingTeamSeeder,
        seeders.TournamentsSeeder,
        seeders.MapSeeder,
        seeders.InvitationsSeeder,
        seeders.TournamentAdminSeeder,
    ],
})
export class SeedersModule {}
