import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation, Match, ParticipatingTeam, Player, Team, Tournament, User } from 'src/entities';
import { UsersModule } from '../users/users.module';
import { PlayersModule } from '../players/players.module';
import { TournamentsModule } from '../tournaments/tournaments.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Match,
            Team,
            Player,
            Invitation,
            User,
            Tournament,
            ParticipatingTeam,
        ]),
        PlayersModule,
        UsersModule,
        TournamentsModule,
    ],
    providers: [MatchesService],
    exports: [MatchesService],
    controllers: [MatchesController],
})
export class MatchesModule {}
