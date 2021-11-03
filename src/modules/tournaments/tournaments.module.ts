import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipatingTeam, Team, Tournament } from 'src/entities';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Tournament, Team, ParticipatingTeam])],
    providers: [TournamentsService],
    exports: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule {}
