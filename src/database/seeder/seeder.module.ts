import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '../entities';
import { Seeder } from './seeder';
import { SeedersModule } from './seeders.module';



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
                    // url: process.env.DATABASE_URL,
                    // ssl: {
                    //     rejectUnauthorized: false,
                    // },
                    database: config.get<string>(`DB_NAME`),
                    username: config.get<string>(`DB_USER`),
                    password: config.get<string>(`DB_PASSWORD`),
                    dropSchema: true,
                    synchronize: true,
                    logging: true,
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
        SeedersModule,
    ],
    providers: [Seeder],
})
export class SeederModule { }
