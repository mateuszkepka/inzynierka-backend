import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    SerializeOptions,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import JwtRefreshGuard from './guards/jwt-refresh-auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { DefaultUserDto } from '../users/dto/default-user.dto';

@Controller(`auth`)
// @SerializeOptions({
//     strategy: `excludeAll`,
// })
@Serialize(DefaultUserDto)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post(`register`)
    async register(@Body() registrationData: RegisterDto) {
        return this.authService.register(registrationData);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post(`log-in`)
    async logIn(@Req() request: RequestWithUser) {
        const { user } = request;
        const accessTokenCookie = this.authService.getCookieWithJwtToken(user.userId);
        const refreshTokenCookie = this.authService.getCookieWithJwtRefreshToken(user.userId);

        await this.usersService.setCurrentRefreshToken(refreshTokenCookie.token, user.userId);

        request.res?.setHeader(`Set-Cookie`, [accessTokenCookie, refreshTokenCookie.cookie]);
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Post(`log-out`)
    async logOut(@Req() request: RequestWithUser) {
        const { user } = request;
        await this.usersService.removeRefreshToken(user.userId);
        request.res.setHeader(`Set-Cookie`, this.authService.getCookiesForLogOut());
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const { user } = request;
        return user;
    }

    @UseGuards(JwtRefreshGuard)
    @Get(`refresh`)
    refresh(@Req() request: RequestWithUser) {
        const { user } = request;
        const accessTokenCookie = this.authService.getCookieWithJwtToken(user.userId);

        request.res.setHeader(`Set-Cookie`, accessTokenCookie);
        return request.user;
    }
}
