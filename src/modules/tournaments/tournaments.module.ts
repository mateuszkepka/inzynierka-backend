import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from 'src/entities';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Tournament])],
    providers: [TournamentsService],
    exports: [TournamentsService],
    controllers: [TournamentsController],
})
export class TournamentsModule {}
