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
                    logging: true,
                    entities: [
                        entities.Game,
                        entities.Group,
                        entities.GroupRule,
                        entities.Ladder,
                        entities.LadderStanding,
                        entities.Map,
                        entities.Match,
                        entities.Performance,
                        entities.Player,
                        entities.Format,
                        entities.Prize,
                        entities.ParticipatingTeam,
                        entities.Suspension,
                        entities.Team,
                        entities.Invitation,
                        entities.TiebreakerRule,
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
