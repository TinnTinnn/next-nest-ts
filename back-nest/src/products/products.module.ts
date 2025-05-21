import { Module, forwardRef } from "@nestjs/common"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { StockInModule } from "../stock-in/stock-in.module"

@Module({
  imports: [
    PrismaModule, 
    forwardRef(() => StockInModule) // Use forwardRef to handle circular dependency
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
