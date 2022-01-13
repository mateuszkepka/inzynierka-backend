import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import RequestWithUser from './interfaces/request-with-user.interface';
import JwtRefreshGuard from './guards/jwt-refresh-auth.guard';
import { Public } from 'src/roles/public.decorator';

@Controller(`auth`)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post(`register`)
    @Public()
    async register(@Body() registrationData: RegisterDto) {
        return this.authService.register(registrationData);
    }

    @Post(`login`)
    @HttpCode(200)
    async logIn(@Req() request: RequestWithUser) {
        const { user } = request;
        const accessTokenCookie = this.authService.getCookieWithJwtToken(user.userId);
        const refreshTokenCookie = this.authService.getCookieWithJwtRefreshToken(user.userId);
        await this.usersService.setCurrentRefreshToken(refreshTokenCookie.token, user.userId);
        request.res?.setHeader(`Set-Cookie`, [accessTokenCookie, refreshTokenCookie.cookie]);
        return user;
    }

    @Post(`logout`)
    async logOut(@Req() request: RequestWithUser) {
        const { user } = request;
        await this.usersService.removeRefreshToken(user.userId);
        request.res.setHeader(`Set-Cookie`, this.authService.getCookiesForLogOut());
    }

    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const { user } = request;
        return user;
    }

    @Get(`refresh`)
    @UseGuards(JwtRefreshGuard)
    refresh(@Req() request: RequestWithUser) {
        const { user } = request;
        const accessTokenCookie = this.authService.getCookieWithJwtToken(user.userId);

        request.res.setHeader(`Set-Cookie`, accessTokenCookie);
        return request.user;
    }
}
