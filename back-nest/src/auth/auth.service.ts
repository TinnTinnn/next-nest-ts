import {ConflictException, Injectable, UnauthorizedException, ForbiddenException, InternalServerErrorException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';



@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async register(dto: RegisterDto) {
        const hash = await bcrypt.hash(dto.password, 10);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hash,
                    name: dto.name,
                },
            });
            const tokens = await this.getTokens(user.id, user.email, user.name, user.role);
            await this.updateRefreshToken(user.id, tokens.refresh_token);
            return tokens;
        } catch (error) {
            throw new ForbiddenException('Email is already taken');
        }
    }


    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new ForbiddenException('Invalid credentials');

        const pwMatches = await bcrypt.compare(dto.password, user.password);
        if (!pwMatches) throw new ForbiddenException('Invalid credentials');

        const tokens = await this.getTokens(user.id, user.email, user.name, user.role);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: number) {
        if (!userId) {
            throw new ForbiddenException('Invalid user');
        }
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { refreshToken: null },
            });
            return { message: 'Logged out successfully' };
        } catch (error) {
            console.error('Error in logout:', error);
            throw new InternalServerErrorException('Logout failed');
        }
    }

    private async updateRefreshToken(userId: number, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hash },
        });
    }

    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

        const rtMatches = await bcrypt.compare(rt, user.refreshToken);
        if (!rtMatches){
            console.warn(`Refresh token mismatch for user ${userId}`);
            throw new ForbiddenException('Access Denied');
        }


        const tokens = await this.getTokens(user.id, user.email,user.name, user.role);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async getTokens(userId: number, email: string, name: string, role: string) {
        const payload = { sub: userId, email, name, role };
        const [at, rt] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);
        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
