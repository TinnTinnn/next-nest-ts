import { Controller, Get, Post, Body, Param, Delete, HttpStatus, HttpCode, UseGuards, Query } from '@nestjs/common';
import  { StockInService } from "./stock-in.service"
import  { CreateStockInDto } from "./dto/create-stock-in.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("stock-in")
@Controller("api/stock-in")
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new stock in record' })
  @ApiResponse({ status: 201, description: 'The stock in record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Stock in with this reference already exists.' })
  create(@Body() createStockInDto: CreateStockInDto) {
    return this.stockInService.create(createStockInDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all stock in records" })
  @ApiResponse({ status: 200, description: "Return all stock in records." })
  findAll() {
    return this.stockInService.findAll()
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock in records by product ID' })
  @ApiResponse({ status: 200, description: 'Return stock in records for the product.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async getStockInByProduct(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const result = await this.stockInService.findByProduct(productId, {
        page: parseInt(page),
        limit: parseInt(limit),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      // ✅ Return consistent format
      return {
        success: true,
        message: 'Stock in records retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch stock in records',
        data: [],
      };
    }
  }

  @Get('by-reference/:reference')
  @ApiOperation({ summary: 'Get a stock in record by reference' })
  @ApiResponse({ status: 200, description: 'Return the stock in record.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'reference', description: 'Stock in reference (e.g., IN-20240515-001)' })
  findByReference(@Param('reference') reference: string) {
    return this.stockInService.findByReference(reference);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a stock in record by ID' })
  @ApiResponse({ status: 200, description: 'Return the stock in record.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'id', description: 'Stock in ID' })
  findOne(@Param('id') id: string) {
    return this.stockInService.findOne(id);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stock in record' })
  @ApiResponse({ status: 204, description: 'The stock in record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'id', description: 'Stock in ID' })
  remove(@Param('id') id: string) {
    return this.stockInService.remove(id);
  }

}
