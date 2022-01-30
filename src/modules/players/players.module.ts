import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player, Team, User } from 'src/database/entities';
import { GamesModule } from '../games/games.module';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
    imports: [TypeOrmModule.forFeature([Player, User, Team]), GamesModule],
    providers: [PlayersService],
    exports: [PlayersService],
    controllers: [PlayersController],
})
export class PlayersModule { }
