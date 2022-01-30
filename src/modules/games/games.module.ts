import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/database/entities';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
    imports: [TypeOrmModule.forFeature([Game])],
    controllers: [GamesController],
    providers: [GamesService],
    exports: [GamesService],
})
export class GamesModule { }
