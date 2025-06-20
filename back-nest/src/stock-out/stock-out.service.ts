import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateStockOutDto } from "./dto/create-stock-out.dto"
import { ProductsService } from "../products/products.service"
import { format } from "date-fns";

interface FindOptions {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  department?: string;
}

@Injectable()
export class StockOutService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  //  method นี้สำหรับ pagination และ filtering
  async findAllWithPagination(options: FindOptions) {
    const { page, limit, startDate, endDate, department } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    // Filter by department
    if (department) {
      where.department = department;
    }

    const [stockOuts, total] = await Promise.all([
      this.prisma.stockOut.findMany({
        where,
        include: {
          product: {
            select: {
              productId: true,
              name: true,
              unit: true,
              category: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.stockOut.count({ where }),
    ]);

    return {
      data: stockOuts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  //  method นี้สำหรับ dashboard statistics

  async getRecentStockOut(limit: number = 5) {
    const stockOuts = await this.prisma.stockOut.findMany({
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
    return stockOuts.map(stockOut => ({
      id: stockOut.id,
      reference: stockOut.reference,
      date: stockOut.date,
      productId: stockOut.productId,
      productName: stockOut.product.name,
      quantity: stockOut.quantity,
      requester: stockOut.requester || 'System',
      department: stockOut.department,
    }));
  }

  async getStockOutSummary() {
    // คำนวณ total items ใน 30 วันที่ผ่านมา
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const currentPeriod = await this.prisma.stockOut.aggregate({
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

    const previousPeriod = await this.prisma.stockOut.aggregate({
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

  async getStockOutChart(startDate: Date, endDate: Date) {
    const stockOuts = await this.prisma.stockOut.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by date (YYYY-MM-DD)
    const grouped: Record<string, number> = {};
    for (const item of stockOuts) {
      const dateStr = format(item.date, "yyyy-MM-dd");
      grouped[dateStr] = (grouped[dateStr] || 0) + item.quantity;
    }

    // Return as array for chart
    return Object.entries(grouped).map(([date, total]) => ({
      date: new Date(date).toISOString(),
      total,
    }));
  }

  async getDashboardStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalThisMonth,
      totalLastMonth,
      recentActivities,
      departmentStats,
      dailyStatsRaw,
    ] = await Promise.all([
      // Total stock out this month
      this.prisma.stockOut.aggregate({
        where: {
          date: {
            gte: startOfMonth,
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      }),

      // Total stock out last month
      this.prisma.stockOut.aggregate({
        where: {
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
      }),

      // Recent activities (last 10)
      this.prisma.stockOut.findMany({
        take: 10,
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
      }),

      // Department statistics
      this.prisma.stockOut.groupBy({
        by: ['department'],
        _sum: {
          quantity: true,
        },
        _count: {
          id: true,
        },
        where: {
          date: {
            gte: startOfMonth,
          },
        },
      }),

      // Get all stock out records for the last 30 days to group by date manually
      this.prisma.stockOut.findMany({
        select: {
          date: true,
          quantity: true,
          unitPrice: true,
        },
        where: {
          date: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
    ]);

    // Group daily stats manually by date (YYYY-MM-DD format)
    const dailyStatsMap = new Map();

    dailyStatsRaw.forEach((record) => {
      const dateKey = record.date.toISOString().split('T')[0]; // Get YYYY-MM-DD

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          date: dateKey,
          transactions: 0,
          total_quantity: 0,
          total_value: 0,
        });
      }

      const dayData = dailyStatsMap.get(dateKey);
      dayData.transactions += 1;
      dayData.total_quantity += record.quantity;
      dayData.total_value += record.quantity * (record.unitPrice || 0);
    });

    const dailyStats = Array.from(dailyStatsMap.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      summary: {
        thisMonth: {
          transactions: totalThisMonth._count.id || 0,
          quantity: totalThisMonth._sum.quantity || 0,
        },
        lastMonth: {
          transactions: totalLastMonth._count.id || 0,
          quantity: totalLastMonth._sum.quantity || 0,
        },
      },
      recentActivities,
      departmentStats,
      dailyStats,
    };
  }

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

    const [stockOuts, total] = await Promise.all([
      this.prisma.stockOut.findMany({
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
      this.prisma.stockOut.count({ where }),
    ]);

    return {
      data: stockOuts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(createStockOutDto: CreateStockOutDto) {
    // Check if reference already exists
    const existingStockOut = await this.prisma.stockOut.findUnique({
      where: { reference: createStockOutDto.reference },
    })

    if (existingStockOut) {
      throw new ConflictException(`Stock out with reference ${createStockOutDto.reference} already exists`)
    }

    // Check if product exists and has sufficient stock
    const product = await this.productsService.findOne(createStockOutDto.productId)

    if (product.quantity < createStockOutDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${createStockOutDto.quantity}`
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

    // Delete stock out record and restore product quantity in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Delete stock out record
      await prisma.stockOut.delete({
        where: { id },
      })

      // Restore product quantity
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