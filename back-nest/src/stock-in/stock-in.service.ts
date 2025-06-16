import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateStockInDto } from "./dto/create-stock-in.dto"
import { ProductsService } from "../products/products.service"

interface FindOptions {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  supplier?: string;
}

@Injectable()
export class StockInService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async findByProduct(productId: string, options: FindOptions) {
    const { page, limit, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      productId: productId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [stockIns, total] = await Promise.all([
      this.prisma.stockIn.findMany({
        where,
        include: {
          product: {
            select: {
              productId: true,
              name: true,
              unit: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.stockIn.count({ where }),
    ]);

    return {
      data: stockIns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //  methods เหล่านี้ใน StockInService

  async getRecentStockIn(limit: number = 5) {
    const stockIns = await this.prisma.stockIn.findMany({
      include: {
        product: {
          select: {
            productId: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });

    // Format data สำหรับ Dashboard
    return stockIns.map(stockIn => ({
      id: stockIn.id,
      reference: stockIn.reference,
      date: stockIn.date,
      productId: stockIn.productId,
      productName: stockIn.product.name,
      quantity: stockIn.quantity,
      createdBy: 'System', // หรือ field ที่เก็บ user ที่สร้าง
      supplier: stockIn.supplier,
    }));
  }

  async getStockInSummary() {
    // คำนวณ total items ใน 30 วันที่ผ่านมา
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const currentPeriod = await this.prisma.stockIn.aggregate({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    // คำนวณ previous period สำหรับ % change
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriod = await this.prisma.stockIn.aggregate({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const currentTotal = currentPeriod._sum.quantity || 0;
    const previousTotal = previousPeriod._sum.quantity || 0;

    const percentChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;

    return {
      totalItems: currentTotal,
      percentChange: Math.round(percentChange * 100) / 100, // Round to 2 decimal places
    };
  }

  async getStockInChart(startDate: Date, endDate: Date) {
    const stockIns = await this.prisma.stockIn.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Format data สำหรับ Chart
    return stockIns.map(item => ({
      date: item.date.toISOString(),
      total: item._sum.quantity || 0,
    }));
  }

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
