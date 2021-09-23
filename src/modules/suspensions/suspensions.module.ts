import { Module } from '@nestjs/common';
import { Suspension } from 'src/entities';
import { SuspensionsController } from './suspensions.controller';
import { SuspensionsService } from './suspensions.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Suspension])],
    providers: [SuspensionsService],
    exports: [SuspensionsService],
    controllers: [SuspensionsController],
})
export class SuspensionsModule {}
