import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player, Invitation, Team, User, Match } from 'src/entities';
import { PlayersModule } from '../players/players.module';
import { UsersModule } from '../users/users.module';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
    imports: [
        MulterModule.register({
            dest: `./uploads/teamProfileImages`,
        }),
        TypeOrmModule.forFeature([Team, Player, Invitation, User, Match]),
        PlayersModule,
        UsersModule,
    ],
    providers: [TeamsService],
    exports: [TeamsService],
    controllers: [TeamsController],
})
export class TeamsModule {}
