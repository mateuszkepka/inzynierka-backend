import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suspension } from 'src/database/entities';
import { UsersModule } from '../users/users.module';
import { SuspensionsController } from './suspensions.controller';
import { SuspensionsService } from './suspensions.service';

@Module({
    imports: [TypeOrmModule.forFeature([Suspension]), UsersModule],
    providers: [SuspensionsService],
    exports: [SuspensionsService],
    controllers: [SuspensionsController],
})
export class SuspensionsModule { }
