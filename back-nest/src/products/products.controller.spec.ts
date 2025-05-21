import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { StockInService } from '../stock-in/stock-in.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddStockDto } from './dto/add-stock.dto';
import { CreateStockInDto } from '../stock-in/dto/create-stock-in.dto';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let stockInService: StockInService;

  const mockProductsService = {
    // Add mock methods for ProductsService if needed for other tests
  };

  const mockStockInService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
        { provide: StockInService, useValue: mockStockInService },
        PrismaService, // Add PrismaService if it's a direct or indirect dependency for other controller methods
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    stockInService = module.get<StockInService>(StockInService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addStockToProduct', () => {
    const productId = 'test-product-id';
    const addStockDto: AddStockDto = {
      quantity: 10,
      notes: 'Test stock addition',
      supplier: 'Test Supplier',
      unitPrice: 5,
    };

    const expectedStockInResponse = {
      id: 'stock-in-id',
      reference: 'IN-test-p-1234567890',
      date: new Date(),
      supplier: 'Test Supplier',
      notes: 'Test stock addition',
      productId: productId,
      quantity: 10,
      unitPrice: 5,
      product: {} as any, // Mock product object if needed
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully add stock to a product', async () => {
      mockStockInService.create.mockResolvedValue(expectedStockInResponse);

      const result = await controller.addStockToProduct(productId, addStockDto);

      expect(stockInService.create).toHaveBeenCalledTimes(1);
      const createStockInDtoArg = mockStockInService.create.mock.calls[0][0] as CreateStockInDto;

      expect(createStockInDtoArg.productId).toBe(productId);
      expect(createStockInDtoArg.quantity).toBe(addStockDto.quantity);
      expect(createStockInDtoArg.notes).toBe(addStockDto.notes);
      expect(createStockInDtoArg.supplier).toBe(addStockDto.supplier);
      expect(createStockInDtoArg.unitPrice).toBe(addStockDto.unitPrice);
      expect(createStockInDtoArg.reference).toEqual(expect.any(String));
      // Check if the reference starts with the expected prefix, if the format is strict
      expect(createStockInDtoArg.reference.startsWith(`IN-${productId.substring(0,5)}`)).toBe(true);
      // Check date is a valid ISO string, as it's converted in the controller
      expect(createStockInDtoArg.date).toEqual(expect.any(String));
      const parsedDate = new Date(createStockInDtoArg.date);
      expect(parsedDate).toEqual(expect.any(Date));
      expect(isNaN(parsedDate.getTime())).toBe(false);


      expect(result).toEqual(expectedStockInResponse);
    });

    it('should use default supplier and unitPrice if not provided in DTO', async () => {
      const addStockDtoDefaults: AddStockDto = {
        quantity: 5,
      };
      const expectedResponseDefaults = {
        ...expectedStockInResponse,
        quantity: 5,
        supplier: "Default Supplier", // Default from AddStockDto
        unitPrice: 0, // Default from AddStockDto
        notes: undefined,
      };
      mockStockInService.create.mockResolvedValue(expectedResponseDefaults);

      await controller.addStockToProduct(productId, addStockDtoDefaults);

      expect(stockInService.create).toHaveBeenCalledTimes(1);
      const createStockInDtoArg = mockStockInService.create.mock.calls[0][0] as CreateStockInDto;

      expect(createStockInDtoArg.supplier).toBe("Default Supplier");
      expect(createStockInDtoArg.unitPrice).toBe(0);
      expect(createStockInDtoArg.notes).toBeUndefined();
    });


    it('should throw an error if StockInService.create fails', async () => {
      const serviceError = new Error('Service error');
      mockStockInService.create.mockRejectedValue(serviceError);

      await expect(controller.addStockToProduct(productId, addStockDto)).rejects.toThrow('Service error');
      expect(stockInService.create).toHaveBeenCalledTimes(1);
    });
  });
});
