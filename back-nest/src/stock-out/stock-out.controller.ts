import { Controller, Get, Post, Body, Param, Delete, HttpStatus, HttpCode } from "@nestjs/common"
import  { StockOutService } from "./stock-out.service"
import  { CreateStockOutDto } from "./dto/create-stock-out.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"

@ApiTags("stock-out")
@Controller("stock-out")
export class StockOutController {
  constructor(private readonly stockOutService: StockOutService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stock out record' })
  @ApiResponse({ status: 201, description: 'The stock out record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request or Not enough stock.' })
  @ApiResponse({ status: 409, description: 'Stock out with this reference already exists.' })
  @Post()
  create(@Body() createStockOutDto: CreateStockOutDto) {
    return this.stockOutService.create(createStockOutDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all stock out records" })
  @ApiResponse({ status: 200, description: "Return all stock out records." })
  findAll() {
    return this.stockOutService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stock out record by ID' })
  @ApiResponse({ status: 200, description: 'Return the stock out record.' })
  @ApiResponse({ status: 404, description: 'Stock out record not found.' })
  @ApiParam({ name: 'id', description: 'Stock out ID' })
  findOne(@Param('id') id: string) {
    return this.stockOutService.findOne(id);
  }

  @Get('by-reference/:reference')
  @ApiOperation({ summary: 'Get a stock out record by reference' })
  @ApiResponse({ status: 200, description: 'Return the stock out record.' })
  @ApiResponse({ status: 404, description: 'Stock out record not found.' })
  @ApiParam({ name: 'reference', description: 'Stock out reference (e.g., OUT-20240515-001)' })
  findByReference(@Param('reference') reference: string) {
    return this.stockOutService.findByReference(reference);
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
