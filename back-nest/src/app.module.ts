import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { RefreshTokenMiddleware } from './auth/middleware/refresh-token.middleware';
import { StockInModule } from './stock-in/stock-in.module';
import { StockOutModule } from './stock-out/stock-out.module';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    ProductsModule,
    StockInModule,
    StockOutModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RefreshTokenMiddleware).forRoutes('auth/logout');
  }
}