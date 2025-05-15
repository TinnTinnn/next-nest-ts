import { Controller, Get, Post, Body, Param, Delete, HttpStatus, HttpCode } from "@nestjs/common"
import  { StockInService } from "./stock-in.service"
import  { CreateStockInDto } from "./dto/create-stock-in.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"

@ApiTags("stock-in")
@Controller("stock-in")
export class StockInController {
  constructor(private readonly stockInService: StockInService) {}

  @Post()
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock in record by ID' })
  @ApiResponse({ status: 200, description: 'Return the stock in record.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'id', description: 'Stock in ID' })
  findOne(@Param('id') id: string) {
    return this.stockInService.findOne(id);
  }

  @Get('by-reference/:reference')
  @ApiOperation({ summary: 'Get a stock in record by reference' })
  @ApiResponse({ status: 200, description: 'Return the stock in record.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'reference', description: 'Stock in reference (e.g., IN-20240515-001)' })
  findByReference(@Param('reference') reference: string) {
    return this.stockInService.findByReference(reference);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a stock in record' })
  @ApiResponse({ status: 204, description: 'The stock in record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Stock in record not found.' })
  @ApiParam({ name: 'id', description: 'Stock in ID' })
  remove(@Param('id') id: string) {
    return this.stockInService.remove(id);
  }
}
