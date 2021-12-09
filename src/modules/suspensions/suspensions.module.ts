import { Module } from '@nestjs/common';
import { Suspension } from 'src/entities';
import { SuspensionsController } from './suspensions.controller';
import { SuspensionsService } from './suspensions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Suspension]), UsersModule],
    providers: [SuspensionsService],
    exports: [SuspensionsService],
    controllers: [SuspensionsController],
})
export class SuspensionsModule { }
