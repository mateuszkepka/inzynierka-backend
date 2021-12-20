import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Map, Match, ParticipatingTeam, Performance } from 'src/entities';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TeamsModule } from '../teams/teams.module';
import { GamesModule } from '../games/games.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Match,
            Map,
            ParticipatingTeam,
            Performance
        ]),
        TournamentsModule,
        UsersModule,
        GamesModule,
        TeamsModule,
    ],
    providers: [MatchesService],
    exports: [MatchesService],
    controllers: [MatchesController],
})
export class MatchesModule { }
