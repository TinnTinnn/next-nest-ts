import { IsInt, IsPositive, IsOptional, IsString, Min, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Supplier } from "@prisma/client";

export class AddStockDto {
  @ApiProperty({ description: "Quantity to add", example: 10 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: "Additional notes", example: "Stock replenishment", required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ 
    description: "Supplier",
    enum: Supplier,
    example: Supplier.CARPIGIANI,
    required: false 
  })
  @IsEnum(Supplier)
  @IsOptional()
  supplier: Supplier = Supplier.CARPIGIANI;

  @ApiProperty({ description: "Unit price", example: 0, required: false })
  @Min(0)
  @IsOptional()
  unitPrice: number = 0;
}
