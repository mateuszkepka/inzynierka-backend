import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, ParticipatingTeam, Prize, Team, Tournament, TournamentAdmin, User } from 'src/entities';
import { GamesModule } from '../games/games.module';
import { PlayersModule } from '../players/players.module';
import { SuspensionsModule } from '../suspensions/suspensions.module';
import { SuspensionsService } from '../suspensions/suspensions.service';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Tournament,
            Match,
            ParticipatingTeam,
            TournamentAdmin,
            Prize,
            User,
        ]),
        UsersModule,
        TeamsModule,
        GamesModule,
        PlayersModule,
        SuspensionsModule
    ],
    providers: [TournamentsService],
    exports: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule { }
