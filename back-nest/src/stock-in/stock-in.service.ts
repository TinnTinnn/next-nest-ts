import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateStockInDto } from "./dto/create-stock-in.dto"
import { ProductsService } from "../products/products.service"

@Injectable()
export class StockInService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createStockInDto: CreateStockInDto) {
    // Check if reference already exists
    const existingStockIn = await this.prisma.stockIn.findUnique({
      where: { reference: createStockInDto.reference },
    })

    if (existingStockIn) {
      throw new ConflictException(`Stock in with reference ${createStockInDto.reference} already exists`)
    }

    // Check if product exists
    const product = await this.productsService.findOne(createStockInDto.productId)

    // Create stock in record and update product quantity in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create stock in record
      const stockIn = await prisma.stockIn.create({
        data: {
          reference: createStockInDto.reference,
          date: new Date(createStockInDto.date),
          supplier: createStockInDto.supplier,
          notes: createStockInDto.notes,
          productId: createStockInDto.productId,
          quantity: createStockInDto.quantity,
          unitPrice: createStockInDto.unitPrice,
        },
      })

      // Update product quantity
      await prisma.product.update({
        where: { id: createStockInDto.productId },
        data: {
          quantity: {
            increment: createStockInDto.quantity,
          },
        },
      })

      return stockIn
    })
  }

  async findAll() {
    return this.prisma.stockIn.findMany({
      include: {
        product: true,
      },
      orderBy: { date: "desc" },
    })
  }

  async findOne(id: string) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })

    if (!stockIn) {
      throw new NotFoundException(`Stock in with ID ${id} not found`)
    }

    return stockIn
  }

  async findByReference(reference: string) {
    const stockIn = await this.prisma.stockIn.findUnique({
      where: { reference },
      include: {
        product: true,
      },
    })

    if (!stockIn) {
      throw new NotFoundException(`Stock in with reference ${reference} not found`)
    }

    return stockIn
  }

  async remove(id: string) {
    // Check if stock in exists
    const stockIn = await this.findOne(id)

    // Delete stock in record and update product quantity in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Delete stock in record
      await prisma.stockIn.delete({
        where: { id },
      })

      // Update product quantity
      await prisma.product.update({
        where: { id: stockIn.productId },
        data: {
          quantity: {
            decrement: stockIn.quantity,
          },
        },
      })
    })
  }
}
