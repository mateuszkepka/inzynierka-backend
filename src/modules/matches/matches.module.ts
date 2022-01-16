import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupStanding, Map, Match, ParticipatingTeam, Performance, Team, Tournament } from 'src/database/entities';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TeamsModule } from '../teams/teams.module';
import { GamesModule } from '../games/games.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
        MulterModule.register({
            dest: './uploads'
        }), TypeOrmModule.forFeature([
            ParticipatingTeam,
            GroupStanding,
            Performance,
            Tournament,
            Match,
            Team,
            Map,
        ]),
        TournamentsModule,
        PlayersModule,
        UsersModule,
        GamesModule,
        TeamsModule,
    ],
    providers: [MatchesService],
    exports: [MatchesService],
    controllers: [MatchesController],
})
export class MatchesModule {}
