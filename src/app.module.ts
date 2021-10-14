import * as Joi from 'joi';
import * as entities from './entities';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';

import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { SuspensionsModule } from './modules/suspensions/suspensions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { CurrentUserMiddleware } from './modules/users/middlewares/current-user.middleware';

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
                    ],
                };
            },
        }),
        AuthModule,
        UsersModule,
        SuspensionsModule,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CurrentUserMiddleware).forRoutes('users');
    }
}
