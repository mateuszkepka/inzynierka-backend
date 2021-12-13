import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player, Team, User } from 'src/entities';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
    imports: [TypeOrmModule.forFeature([Player, User, Team]), GamesModule, UsersModule],
    providers: [PlayersService],
    exports: [PlayersService],
    controllers: [PlayersController],
})
export class PlayersModule {}
