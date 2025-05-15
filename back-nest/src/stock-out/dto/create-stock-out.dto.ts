import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsDateString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateStockOutDto {
  @ApiProperty({ description: "Reference number", example: "OUT-20240515-001" })
  @IsString()
  @IsNotEmpty()
  reference: string

  @ApiProperty({ description: "Date of stock out", example: "2024-05-15T00:00:00.000Z" })
  @IsDateString()
  date: string

  @ApiProperty({ description: "Department", example: "Accounting" })
  @IsString()
  @IsNotEmpty()
  department: string

  @ApiProperty({ description: "Requester", example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  requester: string

  @ApiProperty({ description: "Product ID", example: "product-uuid" })
  @IsString()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ description: "Quantity", example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ description: "Unit price", example: 12.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number

  @ApiProperty({ description: "Additional notes", example: "Monthly department supply", required: false })
  @IsString()
  @IsOptional()
  notes?: string
}
