import { Controller, Get, Post, Body, Param, Delete, HttpStatus, HttpCode, UseGuards, Query } from "@nestjs/common";
import { StockOutService } from "./stock-out.service"
import { CreateStockOutDto } from "./dto/create-stock-out.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("stock-out")
@Controller("stock-out")
export class StockOutController {
  constructor(private readonly stockOutService: StockOutService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new stock out record' })
  @ApiResponse({ status: 201, description: 'The stock out record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Stock out with this reference already exists.' })
  create(@Body() createStockOutDto: CreateStockOutDto) {
    return this.stockOutService.create(createStockOutDto);
  }

  // เปลี่ยนจาก findAll() เป็น findAllWithPagination() เพื่อรองรับ pagination
  @Get()
  @ApiOperation({ summary: "Get stock out records with pagination and filtering" })
  @ApiResponse({ status: 200, description: "Return paginated stock out records." })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'department', required: false, description: 'Department filter' })
  async findAllWithPagination(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
  ) {
    try {
      const result = await this.stockOutService.findAllWithPagination({
        page: parseInt(page),
        limit: parseInt(limit),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        department,
      });

      return {
        success: true,
        message: 'Stock out records retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stock out records',
        data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      };
    }
  }

  //  endpoint สำหรับ dashboard statistics

  @Get('recent')
  @ApiOperation({ summary: 'Get recent stock out records for dashboard'})
  @ApiResponse({ status: 200, description: 'Return recent stock out records.'})
  async getRecentStockOut(@Query('limit') limit: string = '5') {
    return this.stockOutService.getRecentStockOut(parseInt(limit));
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get stock out summary for dashboard'})
  @ApiResponse({ status: 200, description: 'Return stock out summary data.'})
  async getStockOutSummary() {
    return this.stockOutService.getStockOutSummary();
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get stock out chart data for dashboard' })
  @ApiResponse({ status: 200, description: 'Return stock out chart data.' })
  async getStockOutChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.stockOutService.getStockOutChart(
      new Date(startDate),
      new Date(endDate)
    );
  }
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get stock out dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Return stock out dashboard statistics.' })
  async getDashboardStats() {
    try {
      const stats = await this.stockOutService.getDashboardStats();

      return {
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics',
        data: null,
      };
    }
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock out records by product ID' })
  @ApiResponse({ status: 200, description: 'Return stock out records for the product.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStockOutByProduct(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const result = await this.stockOutService.findByProduct(productId, {
        page: parseInt(page),
        limit: parseInt(limit),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      return {
        success: true,
        message: 'Stock out records retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stock out records',
        data: { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
      };
    }
  }

  @Get('by-reference/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a stock out record by reference' })
  @ApiResponse({ status: 200, description: 'Return the stock out record.' })
  @ApiResponse({ status: 404, description: 'Stock out record not found.' })
  @ApiParam({ name: 'reference', description: 'Stock out reference (e.g., OUT-20240515-001)' })
  findByReference(@Param('reference') reference: string) {
    return this.stockOutService.findByReference(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock out record by ID' })
  @ApiResponse({ status: 200, description: 'Return the stock out record.' })
  @ApiResponse({ status: 404, description: 'Stock out record not found.' })
  @ApiParam({ name: 'id', description: 'Stock out ID' })
  findOne(@Param('id') id: string) {
    return this.stockOutService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stock out record' })
  @ApiResponse({ status: 204, description: 'The stock out record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Stock out record not found.' })
  @ApiParam({ name: 'id', description: 'Stock out ID' })
  remove(@Param('id') id: string) {
    return this.stockOutService.remove(id);
  }
}