import { IsInt, IsPositive, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddStockDto {
  @ApiProperty({ description: "Quantity to add", example: 10 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: "Additional notes", example: "Stock replenishment", required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: "Supplier name", example: "Default Supplier", required: false })
  @IsString()
  @IsOptional()
  supplier: string = "Default Supplier";

  @ApiProperty({ description: "Unit price", example: 0, required: false })
  @Min(0)
  @IsOptional()
  unitPrice: number = 0;
}
