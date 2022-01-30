import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupStanding, Map, Match, ParticipatingTeam, Performance, Team, Tournament } from 'src/database/entities';
import { GamesModule } from '../games/games.module';
import { PlayersModule } from '../players/players.module';
import { TeamsModule } from '../teams/teams.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { UsersModule } from '../users/users.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
    imports: [
        MulterModule.register({
            dest: './uploads'
        }),
        TypeOrmModule.forFeature([
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
export class MatchesModule { }
