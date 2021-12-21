import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game, Report, User } from 'src/entities';
import { UsersModule } from '../users/users.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Report,
            User,
        ]),
        UsersModule,
    ],
    providers: [ReportsService],
    exports: [ReportsService],
    controllers: [ReportsController],
})
export class ReportsModule { }