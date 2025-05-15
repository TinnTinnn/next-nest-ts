import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"

export class CreateProductDto {
  @ApiProperty({ description: "Unique product indentifier",
  example: "P001" })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: "Product name", example: "A4 Paper Double A" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: "Product category", example: "Stationery" })
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({ description: "Unit of measurement", example: "Ream" })
  @IsString()
  @IsNotEmpty()
  unit: string

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

  @ApiProperty({ description: "Product description", example: "High quality A4 paper for printing", required: false })
  @IsString()
  @IsOptional()
  description?: string
}