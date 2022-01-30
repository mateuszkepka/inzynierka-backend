import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation, User } from 'src/database/entities';
import { PlayersModule } from '../players/players.module';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invitation, User]),
        UsersModule,
        PlayersModule,
        TeamsModule,
    ],
    controllers: [InvitationsController],
    providers: [InvitationsService],
})
export class InvitationsModule { }
