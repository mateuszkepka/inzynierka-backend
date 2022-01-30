import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupStanding, Ladder, Match, ParticipatingTeam, Prize, Team, Tournament, TournamentAdmin, User } from 'src/database/entities';
import { FormatsModule } from '../formats/formats.module';
import { GamesModule } from '../games/games.module';
import { PlayersModule } from '../players/players.module';
import { SuspensionsModule } from '../suspensions/suspensions.module';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { GroupsService } from './groups.service';
import { LaddersService } from './ladders.service';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
    imports: [MulterModule.register({
        dest: './uploads/tournaments',
    }),
    TypeOrmModule.forFeature([
        ParticipatingTeam,
        TournamentAdmin,
        GroupStanding,
        Tournament,
        Ladder,
        Match,
        Prize,
        Group,
        User,
        Team
    ]),
        UsersModule,
        TeamsModule,
        GamesModule,
        PlayersModule,
        SuspensionsModule,
        FormatsModule,
    ],
    providers: [TournamentsService, LaddersService, GroupsService],
    exports: [TournamentsService, LaddersService, GroupsService],
    controllers: [TournamentsController],
})
export class TournamentsModule { }
