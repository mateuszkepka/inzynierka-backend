import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupStanding, Map, Match, ParticipatingTeam, Performance, Team } from 'src/entities';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { TeamsModule } from '../teams/teams.module';
import { GamesModule } from '../games/games.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ParticipatingTeam,
            GroupStanding,
            Performance,
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
