import { ApiProperty } from "@nestjs/swagger"

export class ProductResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  productId: string

  @ApiProperty()
  name: string

  @ApiProperty()
  category: string

  @ApiProperty()
  unit: string

  @ApiProperty()
  price: number

  @ApiProperty()
  minStock: number

  @ApiProperty()
  quantity: number

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
