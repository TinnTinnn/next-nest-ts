import { Module, forwardRef } from "@nestjs/common"
import { StockOutService } from "./stock-out.service"
import { StockOutController } from "./stock-out.controller"
import { ProductsModule } from "../products/products.module"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [
    forwardRef(() => ProductsModule),
    PrismaModule
  ],
  controllers: [StockOutController],
  providers: [StockOutService],
  exports: [StockOutService],
})
export class StockOutModule {}