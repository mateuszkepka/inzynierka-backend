import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match, Player, Team, Tournament, User } from 'src/database/entities';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        MulterModule.register({
            dest: './uploads/teams'
        }),
        TypeOrmModule.forFeature([User, Player, Team, Tournament, Match])
    ],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule { }
