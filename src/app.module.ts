import * as Joi from 'joi';
import * as entities from './entities';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { GamesModule } from './modules/games/games.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import JwtAuthGuard from './modules/auth/guards/jwt-auth.guard';
import { MatchesModule } from './modules/matches/matches.module';
import { PlayersModule } from './modules/players/players.module';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { SuspensionsModule } from './modules/suspensions/suspensions.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';

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
                    logging: true,
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
                        entities.Invitation,
                        entities.TiebreakerRule,
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
export class AppModule { }
