import { NestFactory } from '@nestjs/core';
import { Seeder } from './seeder';
import { SeederModule } from './seeder.module';

const bootstrap = async () => {
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const seeder = appContext.get(Seeder);
    await seeder.seed();
    appContext.close();
};
bootstrap();
