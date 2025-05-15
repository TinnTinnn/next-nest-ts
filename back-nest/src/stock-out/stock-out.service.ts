import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateStockOutDto } from "./dto/create-stock-out.dto"
import { ProductsService } from "../products/products.service"

@Injectable()
export class StockOutService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createStockOutDto: CreateStockOutDto) {
    // Check if reference already exists
    const existingStockOut = await this.prisma.stockOut.findUnique({
      where: { reference: createStockOutDto.reference },
    })

    if (existingStockOut) {
      throw new ConflictException(`Stock out with reference ${createStockOutDto.reference} already exists`)
    }

    // Check if product exists
    const product = await this.productsService.findOne(createStockOutDto.productId)

    // Check if there's enough stock
    if (product.quantity < createStockOutDto.quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${product.quantity}, Requested: ${createStockOutDto.quantity}`,
      )
    }

    // Create stock out record and update product quantity in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create stock out record
      const stockOut = await prisma.stockOut.create({
        data: {
          reference: createStockOutDto.reference,
          date: new Date(createStockOutDto.date),
          department: createStockOutDto.department,
          requester: createStockOutDto.requester,
          notes: createStockOutDto.notes,
          productId: createStockOutDto.productId,
          quantity: createStockOutDto.quantity,
          unitPrice: createStockOutDto.unitPrice,
        },
      })

      // Update product quantity
      await prisma.product.update({
        where: { id: createStockOutDto.productId },
        data: {
          quantity: {
            decrement: createStockOutDto.quantity,
          },
        },
      })

      return stockOut
    })
  }

  async findAll() {
    return this.prisma.stockOut.findMany({
      include: {
        product: true,
      },
      orderBy: { date: "desc" },
    })
  }

  async findOne(id: string) {
    const stockOut = await this.prisma.stockOut.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })

    if (!stockOut) {
      throw new NotFoundException(`Stock out with ID ${id} not found`)
    }

    return stockOut
  }

  async findByReference(reference: string) {
    const stockOut = await this.prisma.stockOut.findUnique({
      where: { reference },
      include: {
        product: true,
      },
    })

    if (!stockOut) {
      throw new NotFoundException(`Stock out with reference ${reference} not found`)
    }

    return stockOut
  }

  async remove(id: string) {
    // Check if stock out exists
    const stockOut = await this.findOne(id)

    // Delete stock out record and update product quantity in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Delete stock out record
      await prisma.stockOut.delete({
        where: { id },
      })

      // Update product quantity
      await prisma.product.update({
        where: { id: stockOut.productId },
        data: {
          quantity: {
            increment: stockOut.quantity,
          },
        },
      })
    })
  }
}
