import {
    Body,
    Controller,
    Post,
    Res,
    Get,
    Req,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import {JwtAuthGuard} from "./guards/jwt-auth.guard";

interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

interface RequestWithUser extends Request {
    user: JwtPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Post('register')
    async register(@Body() body, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.register(body);
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return { access_token: tokens.access_token };
    }

    @Post('login')
    async login(@Body() body, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(body);
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return { access_token: tokens.access_token };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user);

        if (!req.user) {
            console.log('Auth Guard Failed');
            throw new ForbiddenException('No user found in request');
        }

        const userId = req.user.sub;
        console.log('User ID:', userId);

        if (!userId) {
            throw new ForbiddenException('Invalid user');
        }

        try {
            await this.authService.logout(userId);
            res.clearCookie('refresh_token');
            return { message: 'Logged out' };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    @Post('refresh')
    async refresh(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        const userId = req.user?.sub;
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        res.cookie('refresh_token', tokens.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return { access_token: tokens.access_token };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req: RequestWithUser) {
        console.log('JWT Payload:', req.user);
        return req.user; // ข้อมูล user จาก access token
    }
}
