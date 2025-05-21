import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from "./products.service";
import { StockInService } from "../stock-in/stock-in.service"; // Added
import { CreateProductDto } from "./dto/create-product.dto";
import { AddStockDto } from "./dto/add-stock.dto"; // Added
import { CreateStockInDto } from "../stock-in/dto/create-stock-in.dto"; // Added
import  { UpdateProductDto } from "./dto/update-product.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { ProductResponseDto } from "./dto/product-response.dto";
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly stockInService: StockInService, // Added
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Product with this ID already exists.' })
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Return all products.", type: [ProductResponseDto] })
  @ApiQuery({ name: "category", required: false, description: "Filter by category" })
  @ApiQuery({ name: "search", required: false, description: "Search term" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["all", "in-stock", "low-stock", "out-of-stock"],
    description: "Filter by stock status",
  })
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock',
  ) {
    if (search) {
      return this.productsService.search(search)
    }

    if (category) {
      return this.productsService.findByCategory(category)
    }

    if (status) {
      switch (status) {
        case "low-stock":
          return this.productsService.findLowStock()
        case "out-of-stock":
          return this.productsService.findOutOfStock()
        default:
          return this.productsService.findAll()
      }
    }

    return this.productsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('by-product-id/:productId')
  @ApiOperation({ summary: 'Get a product by product ID' })
  @ApiResponse({ status: 200, description: 'Return the product.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID (e.g., P001)' })
  async findByProductId(@Param('productId') productId: string) {
    return this.productsService.findByProductId(productId);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({ status: 200, description: "The product has been successfully updated.", type: ProductResponseDto })
  @ApiResponse({ status: 404, description: "Product not found." })
  @ApiResponse({ status: 409, description: "Product with this ID already exists." })
  @ApiParam({ name: "id", description: "Product ID" })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }

  @Post(':id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add stock to a product' })
  @ApiResponse({ status: 201, description: 'The stock has been successfully added.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async addStockToProduct(
    @Param('id') id: string,
    @Body() addStockDto: AddStockDto,
  ) {
    const createStockInDto: CreateStockInDto = {
      productId: id,
      quantity: addStockDto.quantity,
      notes: addStockDto.notes,
      reference: `IN-${id.substring(0, 5)}-${Date.now()}`,
      date: new Date().toISOString(),
      supplier: addStockDto.supplier,
      unitPrice: addStockDto.unitPrice,
    };
    return this.stockInService.create(createStockInDto);
  }
}
