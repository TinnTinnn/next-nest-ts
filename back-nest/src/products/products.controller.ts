import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, HttpCode } from "@nestjs/common"
import  { ProductsService } from "./products.service"
import  { CreateProductDto } from "./dto/create-product.dto"
import  { UpdateProductDto } from "./dto/update-product.dto"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { ProductResponseDto } from "./dto/product-response.dto"

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
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
  @ApiOperation({ summary: "Update a product" })
  @ApiResponse({ status: 200, description: "The product has been successfully updated.", type: ProductResponseDto })
  @ApiResponse({ status: 404, description: "Product not found." })
  @ApiResponse({ status: 409, description: "Product with this ID already exists." })
  @ApiParam({ name: "id", description: "Product ID" })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
