import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import * as entities from './database/entities';
import { AuthModule } from './modules/auth/auth.module';
import JwtAuthGuard from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { FormatsModule } from './modules/formats/formats.module';
import { GamesModule } from './modules/games/games.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SuspensionsModule } from './modules/suspensions/suspensions.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { UsersModule } from './modules/users/users.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
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
                    // ssl: {
                    //     rejectUnauthorized: false,
                    // },
                    // url: process.env.DATABASE_URL,
                    database: config.get<string>(`DB_NAME`),
                    username: config.get<string>(`DB_USER`),
                    password: config.get<string>(`DB_PASSWORD`),
                    synchronize: false,
                    logging: false,
                    entities: [
                        entities.Game,
                        entities.Group,
                        entities.GroupStanding,
                        entities.Ladder,
                        entities.Map,
                        entities.Match,
                        entities.Performance,
                        entities.ParticipatingTeam,
                        entities.Player,
                        entities.Format,
                        entities.Prize,
                        entities.Suspension,
                        entities.Team,
                        entities.Invitation,
                        entities.Tournament,
                        entities.TournamentAdmin,
                        entities.User,
                        entities.Report,
                    ],
                };
            },
        }),
        AuthModule,
        UsersModule,
        SuspensionsModule,
        TournamentsModule,
        TeamsModule,
        PlayersModule,
        GamesModule,
        InvitationsModule,
        MatchesModule,
        ReportsModule,
        FormatsModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}
