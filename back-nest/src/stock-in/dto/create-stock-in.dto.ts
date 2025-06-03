import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"
import { Supplier } from "@prisma/client";


export class CreateStockInDto {
  @ApiProperty({ description: "Reference number", example: "IN-20240515-001" })
  @IsString()
  @IsNotEmpty()
  reference: string

  @ApiProperty({ description: "Date of stock in", example: "2024-05-15T00:00:00.000Z" })
  @IsDateString()
  date: string

  @ApiProperty({
    description: "Supplier",
    enum: Supplier,
    example: "CARPIGIANI"
  })
  @IsEnum(Supplier)
  @IsNotEmpty()
  supplier: Supplier

  @ApiProperty({ description: "Product ID", example: "product-uuid" })
  @IsString()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ description: "Quantity", example: 50 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ description: "Unit price", example: 12.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number

  @ApiProperty({ description: "Additional notes", example: "Regular monthly order", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
