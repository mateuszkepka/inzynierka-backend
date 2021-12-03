import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipatingTeam, Prize, Team, Tournament, TournamentAdmin, User } from 'src/entities';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Tournament,
            Team,
            ParticipatingTeam,
            TournamentAdmin,
            Prize,
            User,
        ]),
    ],
    providers: [TournamentsService],
    exports: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule {}
