import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player, User } from 'src/entities';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
    imports: [TypeOrmModule.forFeature([Player, User])],
    providers: [PlayersService],
    exports: [PlayersService],
    controllers: [PlayersController],
})
export class PlayersModule {}
