import { Module } from "@nestjs/common"
import { StockInService } from "./stock-in.service"
import { StockInController } from "./stock-in.controller"
import { ProductsModule } from "../products/products.module"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [ProductsModule, PrismaModule],
  controllers: [StockInController],
  providers: [StockInService],
})
export class StockInModule {}
