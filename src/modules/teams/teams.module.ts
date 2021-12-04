import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player, PlayerTeam, Team, User } from 'src/entities';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
    imports: [TypeOrmModule.forFeature([Team, Player, PlayerTeam, User])],
    providers: [TeamsService],
    exports: [TeamsService],
    controllers: [TeamsController],
})
export class TeamsModule {}
