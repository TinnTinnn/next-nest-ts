import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum  } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import { ProductCategory, ProductUnit } from "@prisma/client"



export class CreateProductDto {
  @ApiProperty({ description: "Unique product indentifier",
  example: "MACH-001" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: "Product name", example: "Fresh Milk" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: "Product category", example: "Favoring" })
  @IsEnum(ProductCategory)
  @IsNotEmpty()
  category: ProductCategory

  @ApiProperty({ description: "Unit of measurement", example: "Piece" })
  @IsEnum(ProductUnit)
  @IsNotEmpty()
  unit: ProductUnit

  @ApiProperty({ description: "Unit price", example: 12.0 })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({ description: "Minimum stock level", example: 10 })
  @IsNumber()
  @Min(0)
  minStock: number

  @ApiProperty({ description: "Initial stock quantity", example: 50 })
  @IsNumber()
  @Min(0)
  initialStock: number

  @ApiProperty({ description: "Product description", example: "Professional gelato batch freezer imported from Italy.", required: false })
  @IsString()
  @IsOptional()
  description?: string
}