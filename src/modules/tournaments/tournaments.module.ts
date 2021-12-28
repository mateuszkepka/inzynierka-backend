import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, Match, ParticipatingTeam, Prize, Tournament, TournamentAdmin, User } from 'src/entities';
import { FormatsModule } from '../formats/formats.module';
import { GamesModule } from '../games/games.module';
import { PlayersModule } from '../players/players.module';
import { SuspensionsModule } from '../suspensions/suspensions.module';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { GroupsService } from './groups.service';
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
            Group,
            User,
        ]),
        UsersModule,
        TeamsModule,
        GamesModule,
        PlayersModule,
        SuspensionsModule,
        FormatsModule,
    ],
    providers: [TournamentsService, GroupsService],
    exports: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule { }
