import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_SECRET as string,
            ignoreExpiration: false,
            algorithms: ['HS256']
        });
    }

    async validate(payload: any) {
        console.log('JWT payload:', payload);
        if (!payload || !payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }
        return payload;
    }
}
