import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Product } from "@prisma/client"

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if product with the same productId already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { productId: createProductDto.productId },
    })

    if (existingProduct) {
      throw new ConflictException(`Product with ID ${createProductDto.productId} already exists`)
    }

    // Extract initialStock from DTO and remove it before creating the product
    const { initialStock, ...productData } = createProductDto

    // Create the product with initial quantity
    return this.prisma.product.create({
      data: {
        ...productData,
        quantity: initialStock || 0,
      },
    })
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      orderBy: { productId: "asc" },
    })
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  async findByProductId(productId: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { productId },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Check if product exists
    await this.findOne(id)

    // If updating productId, check if the new productId is already in use
    if (updateProductDto.productId) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { productId: updateProductDto.productId },
      })

      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(`Product with ID ${updateProductDto.productId} already exists`)
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    })
  }

  async remove(id: string): Promise<Product> {
    // Check if product exists
    await this.findOne(id)

    return this.prisma.product.delete({
      where: { id },
    })
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { category },
      orderBy: { name: "asc" },
    })
  }

  async findLowStock(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        quantity: {
          lte: this.prisma.product.fields.minStock,
        },
      },
      orderBy: { quantity: "asc" },
    })
  }

  async findOutOfStock(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { quantity: 0 },
      orderBy: { name: "asc" },
    })
  }

  async search(query: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { productId: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
    })
  }
}
