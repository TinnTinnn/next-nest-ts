import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        console.log('JwtAuthGuard canActivate');
        
        // Get the request from context
        const request = context.switchToHttp().getRequest();
        console.log('Request headers:', request.headers);
        
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        console.log('JwtAuthGuard handleRequest');
        console.log('Error:', err);
        console.log('User:', user);
        console.log('Info:', info);
        
        if (err || !user) {
            console.log('Auth failed:', err || info);
            throw err || new UnauthorizedException();
        }
        
        return user;
    }
}
