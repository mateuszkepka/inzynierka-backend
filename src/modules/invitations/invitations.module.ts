import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation, User } from 'src/entities';
import { PlayersModule } from '../players/players.module';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, User]), UsersModule, PlayersModule, TeamsModule],
  controllers: [InvitationsController],
  providers: [InvitationsService]
})
export class InvitationsModule { }
