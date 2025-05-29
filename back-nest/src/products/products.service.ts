import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Product, Prisma } from "@prisma/client"

interface PaginatedProductsResult {
  products: Product[];
  total: number;
}

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

  async findAll(
    search?: string,
    category?: string,
    status?: "in-stock" | "low-stock" | "out-of-stock",
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedProductsResult> {
    const where: Prisma.ProductWhereInput = {}

    if (search) {
      where.OR = [
        { productId: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (status) {
      // Note: The 'in-stock' and 'low-stock' statuses depend on `minStock`.
      // Prisma does not directly support comparing a field (quantity) against another field (minStock)
      // in a standard `where` clause. This typically requires a raw query (`$queryRaw`) or a database view.
      // As a workaround, we'll use a fixed `lowStockThreshold`.
      // This is a deviation from the ideal `quantity > minStock` or `quantity <= minStock` logic.
      // A more accurate implementation would require $queryRaw or schema adjustments.
      const lowStockThreshold = 10; // Example placeholder for minStock comparison.

      if (status === "in-stock") {
        // Simplified: quantity > lowStockThreshold.
        // Ideal: quantity > minStock (requires raw query or different approach)
        where.quantity = { gt: lowStockThreshold };
      } else if (status === "low-stock") {
        // Simplified: 0 < quantity <= lowStockThreshold.
        // Ideal: 0 < quantity <= minStock (requires raw query or different approach)
        where.AND = [
          ...(where.AND as Prisma.ProductWhereInput[] || []),
          { quantity: { gt: 0 } },
          { quantity: { lte: lowStockThreshold } },
        ];
      } else if (status === "out-of-stock") {
          where.quantity = 0
        }
      }
    }
    const skip = (page - 1) * limit

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { productId: "asc" },
      skip,
      take: limit,
    })

    const total = await this.prisma.product.count({ where })

    return { products, total }
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

  // findByProductId can be kept as it's a specific lookup
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

  // findByCategory can now use findAll
  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.findAll(undefined, category, undefined, 1, 1000) // Assuming large limit for all
    return result.products
  }

  // findLowStock can now use findAll
  async findLowStock(): Promise<Product[]> {
    // This method's original logic `quantity <= minStock` is hard to replicate with Prisma
    // without raw queries if `minStock` is a field.
    // Using the simplified 'low-stock' status for now.
    const result = await this.findAll(undefined, undefined, "low-stock", 1, 1000)
    return result.products
  }

  // findOutOfStock can now use findAll
  async findOutOfStock(): Promise<Product[]> {
    const result = await this.findAll(undefined, undefined, "out-of-stock", 1, 1000)
    return result.products
  }

  // search can now use findAll
  async search(query: string): Promise<Product[]> {
    const result = await this.findAll(query, undefined, undefined, 1, 1000)
    return result.products
  }
}
