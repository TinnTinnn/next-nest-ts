import { PartialType } from "@nestjs/swagger"
import { CreateProductDto } from "./create-product.dto"
import { IsNumber, IsOptional, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ description: "Current stock quantity", example: 120, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number
}
