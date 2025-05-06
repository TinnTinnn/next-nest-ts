import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies?.refresh_token;
        if (token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as any;
                req['userId'] = payload.sub;
            } catch (err) {
                req['userId'] = null;
            }
        }
        next();
    }
}
