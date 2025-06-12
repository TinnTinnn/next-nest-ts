import { Controller, Get, Post, Body, Param, Delete, HttpStatus, HttpCode, UseGuards, Query } from "@nestjs/common";
import { StockOutService } from "./stock-out.service"
import { CreateStockOutDto } from "./dto/create-stock-out.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("stock-out")
@Controller("api/stock-out")
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

  @Get()
  @ApiOperation({ summary: "Get all stock out records" })
  @ApiResponse({ status: 200, description: "Return all stock out records." })
  findAll() {
    return this.stockOutService.findAll()
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock out records by product ID' })
  @ApiResponse({ status: 200, description: 'Return stock out records for the product.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
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

      // ✅ Return consistent format
      return {
        success: true,
        message: 'Stock out records retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stock out records',
        data: [],
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