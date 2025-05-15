import { IsOptional, IsString, IsEnum } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export enum StockStatus {
  ALL = "all",
  IN_STOCK = "in-stock",
  LOW_STOCK = "low-stock",
  OUT_OF_STOCK = "out-of-stock",
}

export class ProductFilterDto {
  @ApiPropertyOptional({ description: "Filter by category", example: "Stationery" })
  @IsOptional()
  @IsString()
  category?: string

  @ApiPropertyOptional({ description: "Search term", example: "paper" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: "Filter by stock status",
    enum: StockStatus,
    example: StockStatus.LOW_STOCK,
  })
  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus
}
