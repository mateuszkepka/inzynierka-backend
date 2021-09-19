import { ConfigModule, ConfigService } from "@nestjs/config";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        UsersModule, 
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>(`JWT_SECRET`),
                signOptions: {
                    expiresIn: `${configService.get<string>(`JWT_EXPIRATION_TIME`)}s`,
                }
            })
        })
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}