import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        credentials: true,
        origin: true,
    });
    app.use(cookieParser());
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), { strategy: `excludeAll` }),
    );
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
