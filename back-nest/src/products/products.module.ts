import { Module } from "@nestjs/common"
import { ProductsService } from "./products.service"
import { ProductsController } from "./products.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { StockInModule } from "../stock-in/stock-in.module" // Added

@Module({
  imports: [PrismaModule, StockInModule], // Added StockInModule
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
