import { Module } from "@nestjs/common"
import { StockOutService } from "./stock-out.service"
import { StockOutController } from "./stock-out.controller"
import { ProductsModule } from "../products/products.module"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [ProductsModule, PrismaModule],
  controllers: [StockOutController],
  providers: [StockOutService],
})
export class StockOutModule {}
