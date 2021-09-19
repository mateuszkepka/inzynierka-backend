import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import RequestWithUser from "./interfaces/request-with-user.interface";
import JwtAuthGuard from "./jwt-auth.guard";
import { LocalAuthGuard } from "./local-auth.guard";

@Controller(`auth`)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post(`register`)
    async register(@Body() registrationData: RegisterDto) {
        return this.authService.register(registrationData);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post(`log-in`)
    async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
        const { user } = request;
        const cookie = this.authService.getCookieWithJwtToken(user.userId);
        response.setHeader(`Set-Cookie`, cookie);
        // TODO don't send password
        return response.send(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(`log-out`)
    async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
        response.setHeader(`Set-Cookie`, this.authService.getCookieForLogOut());
        return response.sendStatus(200);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const { user } = request;

        return user;
    }
}