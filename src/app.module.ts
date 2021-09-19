import * as entities from './entities';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, ValidationPipe } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: `postgres`,
          database: config.get<string>(`DB_NAME`),
          username: config.get<string>(`DB_USER`),
          password: config.get<string>(`DB_PASSWORD`),
          synchronize: true,
          entities: [
            entities.ActiveRoster,
            entities.Game,
            entities.Group,
            entities.GroupRule,
            entities.GroupStanding,
            entities.Ladder,
            entities.LadderStanding,
            entities.Map,
            entities.Match,
            entities.Performance,
            entities.Player,
            entities.Preset,
            entities.Prize,
            entities.Roster,
            entities.Suspension,
            entities.Team,
            entities.TiebrakerRule,
            entities.Tournament,
            entities.TournamentAdmin,
            entities.User,
          ]
        }
      }
    })
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      })
    }
  ],
})
export class AppModule {}
