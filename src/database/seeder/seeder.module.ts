import * as entities from '../../entities';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { Seeder } from './seeder';
import { SeedersModule } from './seeders.module';
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
                    ],
                };
            },
        }),
        SeedersModule,
    ],
    providers: [Seeder],
})
export class SeederModule {}
