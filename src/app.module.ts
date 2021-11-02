import * as Joi from 'joi';
import * as entities from './entities';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, ValidationPipe } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { SuspensionsModule } from './modules/suspensions/suspensions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { TeamsModule } from './modules/teams/teams.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
            validationSchema: Joi.object({
                DB_NAME: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_USER: Joi.string().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRATION_TIME: Joi.string().required(),
                JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
                JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
            }),
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
                        entities.Game,
                        entities.Group,
                        entities.GroupRule,
                        entities.GroupStanding,
                        entities.Ladder,
                        entities.LadderStanding,
                        entities.Map,
                        entities.Match,
                        entities.Performance,
                        entities.ParticipatingTeam,
                        entities.Player,
                        entities.Preset,
                        entities.Prize,
                        entities.Suspension,
                        entities.Team,
                        entities.PlayerTeam,
                        entities.TiebreakerRule,
                        entities.Tournament,
                        entities.TournamentAdmin,
                        entities.User,
                    ],
                };
            },
        }),
        AuthModule,
        UsersModule,
        SuspensionsModule,
        TournamentsModule,
        TeamsModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
            }),            
        },
    ],
})
export class AppModule { }
