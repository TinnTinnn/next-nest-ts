import { Module, forwardRef } from "@nestjs/common"
import { StockInService } from "./stock-in.service"
import { StockInController } from "./stock-in.controller"
import { ProductsModule } from "../products/products.module"
import { PrismaModule } from "../prisma/prisma.module"

@Module({
  imports: [
    forwardRef(() => ProductsModule), // Use forwardRef to handle circular dependency
    PrismaModule
  ],
  controllers: [StockInController],
  providers: [StockInService],
  exports: [StockInService],
})
export class StockInModule {}
