import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

// Mock data - adjust fields as per your Product model if different
const mockProducts: Product[] = [
  {
    id: '1',
    productId: 'P001',
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    category: 'Electronics',
    supplier: 'Supplier A',
    quantity: 15, // in-stock (assuming lowStockThreshold = 10)
    minStock: 5,
    price: new Prisma.Decimal(1200.0),
    unit: 'pcs',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: null,
    barcode: null,
    notes: null,
  },
  {
    id: '2',
    productId: 'P002',
    name: 'Office Chair',
    description: 'Ergonomic office chair',
    category: 'Furniture',
    supplier: 'Supplier B',
    quantity: 8, // low-stock
    minStock: 10, // minStock is higher than quantity
    price: new Prisma.Decimal(150.0),
    unit: 'pcs',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: null,
    barcode: null,
    notes: null,
  },
  {
    id: '3',
    productId: 'P003',
    name: 'Wireless Mouse',
    description: 'Optical wireless mouse',
    category: 'Electronics',
    supplier: 'Supplier A',
    quantity: 0, // out-of-stock
    minStock: 15,
    price: new Prisma.Decimal(25.0),
    unit: 'pcs',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: null,
    barcode: null,
    notes: null,
  },
  {
    id: '4',
    productId: 'P004',
    name: 'Keyboard',
    description: 'Mechanical gaming keyboard',
    category: 'Electronics',
    supplier: 'Supplier C',
    quantity: 20, // in-stock
    minStock: 5,
    price: new Prisma.Decimal(75.0),
    unit: 'pcs',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: null,
    barcode: null,
    notes: null,
  },
  {
    id: '5',
    productId: 'P005',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    category: 'Furniture',
    supplier: 'Supplier B',
    quantity: 5, // low-stock (exactly at threshold if threshold is 5, or if threshold is 10)
    minStock: 5,
    price: new Prisma.Decimal(30.0),
    unit: 'pcs',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: null,
    barcode: null,
    notes: null,
  },
];

// The lowStockThreshold used in ProductsService
const lowStockThreshold = 10;

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            // Mock other Prisma methods if your service uses them
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    // Helper function to simulate Prisma filtering
    const simulatePrismaLogic = (
      allProducts: Product[],
      where: Prisma.ProductWhereInput = {},
      skip: number = 0,
      take: number = 10,
    ): { products: Product[]; total: number } => {
      let filtered = [...allProducts];

      if (where.OR) {
        const orConditions = where.OR as Prisma.ProductWhereInput[];
        filtered = filtered.filter(p => 
          orConditions.some(cond => 
            (cond.name && typeof cond.name === 'object' && 'contains' in cond.name && p.name.toLowerCase().includes(String(cond.name.contains).toLowerCase())) ||
            (cond.productId && typeof cond.productId === 'object' && 'contains' in cond.productId && p.productId.toLowerCase().includes(String(cond.productId.contains).toLowerCase())) ||
            (cond.description && typeof cond.description === 'object' && 'contains' in cond.description && p.description?.toLowerCase().includes(String(cond.description.contains).toLowerCase()))
          )
        );
      }
      if (where.category) {
         filtered = filtered.filter(p => p.category === where.category);
      }
      if (where.quantity !== undefined) {
        if (typeof where.quantity === 'number') {
            filtered = filtered.filter(p => p.quantity === where.quantity); // For out-of-stock
        } else if (typeof where.quantity === 'object') {
            if ('gt' in where.quantity) { // in-stock
                 filtered = filtered.filter(p => p.quantity > (where.quantity as Prisma.IntFilter).gt!);
            }
        }
      }
      if (where.AND) { // For low-stock (quantity > 0 and <= lowStockThreshold)
        const andConditions = where.AND as Prisma.ProductWhereInput[];
        andConditions.forEach(condition => {
            if(condition.quantity && typeof condition.quantity === 'object') {
                const qFilter = condition.quantity as Prisma.IntFilter;
                if(qFilter.gt !== undefined) filtered = filtered.filter(p => p.quantity > qFilter.gt!);
                if(qFilter.lte !== undefined) filtered = filtered.filter(p => p.quantity <= qFilter.lte!);
            }
        });
      }


      const total = filtered.length;
      const products = filtered.slice(skip, skip + take);
      return { products, total };
    };
    
    beforeEach(() => {
        (prisma.product.findMany as jest.Mock).mockImplementation(async ({ where, skip, take, orderBy }) => {
          return simulatePrismaLogic(mockProducts, where, skip, take).products;
        });
        (prisma.product.count as jest.Mock).mockImplementation(async ({ where }) => {
          return simulatePrismaLogic(mockProducts, where).total;
        });
      });

    it('should return all products with default pagination if no filters applied', async () => {
      const result = await service.findAll();
      expect(result.products.length).toBe(Math.min(mockProducts.length, 10));
      expect(result.total).toBe(mockProducts.length);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { productId: 'asc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.product.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by search keyword (name)', async () => {
      const searchTerm = 'Laptop Pro';
      const result = await service.findAll(searchTerm);
      const expected = mockProducts.filter(p => p.name.includes(searchTerm));
      expect(result.products.length).toBe(expected.length);
      expect(result.total).toBe(expected.length);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { productId: { contains: searchTerm, mode: 'insensitive' } },
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        }),
      );
    });
    
    it('should filter by search keyword (productId)', async () => {
        const searchTerm = 'P001';
        const result = await service.findAll(searchTerm);
        const expected = mockProducts.filter(p => p.productId.includes(searchTerm));
        expect(result.products.length).toBe(expected.length);
        expect(result.total).toBe(expected.length);
    });

    it('should filter by search keyword (description)', async () => {
        const searchTerm = 'ergonomic'; // in "Ergonomic office chair"
        const result = await service.findAll(searchTerm);
        const expected = mockProducts.filter(p => p.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        expect(result.products.length).toBe(expected.length);
        expect(result.total).toBe(expected.length);
    });

    it('should return empty if search keyword yields no results', async () => {
        const searchTerm = 'NonExistentProduct';
        const result = await service.findAll(searchTerm);
        expect(result.products.length).toBe(0);
        expect(result.total).toBe(0);
    });


    it('should filter by category', async () => {
      const category = 'Furniture';
      const result = await service.findAll(undefined, category);
      const expected = mockProducts.filter(p => p.category === category);
      expect(result.products.length).toBe(expected.length);
      expect(result.total).toBe(expected.length);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category },
        }),
      );
    });

    it('should filter by status: out-of-stock', async () => {
      const result = await service.findAll(undefined, undefined, 'out-of-stock');
      const expected = mockProducts.filter(p => p.quantity === 0);
      expect(result.products.length).toBe(expected.length);
      expect(result.total).toBe(expected.length);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { quantity: 0 },
        }),
      );
    });

    it('should filter by status: low-stock', async () => {
        // Uses lowStockThreshold = 10 from service
        const result = await service.findAll(undefined, undefined, 'low-stock');
        const expected = mockProducts.filter(p => p.quantity > 0 && p.quantity <= lowStockThreshold);
        expect(result.products.length).toBe(expected.length);
        expect(result.total).toBe(expected.length);
        expect(prisma.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                AND: [
                    { quantity: { gt: 0, lte: lowStockThreshold } },
                ]
              },
            }),
          );
    });

    it('should filter by status: in-stock', async () => {
        // Uses lowStockThreshold = 10 from service
        const result = await service.findAll(undefined, undefined, 'in-stock');
        const expected = mockProducts.filter(p => p.quantity > lowStockThreshold);
        expect(result.products.length).toBe(expected.length);
        expect(result.total).toBe(expected.length);
        expect(prisma.product.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { quantity: { gt: lowStockThreshold } },
          }),
        );
    });
    
    it('should combine search and category filters', async () => {
        const searchTerm = 'Chair';
        const category = 'Furniture';
        const result = await service.findAll(searchTerm, category);
        const expected = mockProducts.filter(p => 
            (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.productId.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            p.category === category
        );
        expect(result.products.length).toBe(expected.length);
        expect(result.total).toBe(expected.length);
        expect(prisma.product.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: {
                OR: [
                  { productId: { contains: searchTerm, mode: 'insensitive' } },
                  { name: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } },
                ],
                category: category,
              },
            }),
        );
    });

    it('should handle pagination correctly (page 1, limit 2)', async () => {
      const page = 1;
      const limit = 2;
      const result = await service.findAll(undefined, undefined, undefined, page, limit);
      expect(result.products.length).toBe(limit);
      expect(result.products[0].productId).toBe(mockProducts[0].productId);
      expect(result.products[1].productId).toBe(mockProducts[1].productId);
      expect(result.total).toBe(mockProducts.length);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: limit,
        }),
      );
    });

    it('should handle pagination correctly (page 2, limit 2)', async () => {
      const page = 2;
      const limit = 2;
      const result = await service.findAll(undefined, undefined, undefined, page, limit);
      expect(result.products.length).toBe(limit);
      expect(result.products[0].productId).toBe(mockProducts[2].productId); // P003
      expect(result.products[1].productId).toBe(mockProducts[3].productId); // P004
      expect(result.total).toBe(mockProducts.length);
       expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: (page - 1) * limit,
          take: limit,
        }),
      );
    });
    
    it('should handle pagination when page is out of bounds (empty products, correct total)', async () => {
        const page = 100; // Way out of bounds
        const limit = 10;
        const result = await service.findAll(undefined, undefined, undefined, page, limit);
        expect(result.products.length).toBe(0);
        expect(result.total).toBe(mockProducts.length); 
        expect(prisma.product.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: (page - 1) * limit,
            take: limit,
          }),
        );
      });

      it('should use default page and limit if not provided', async () => {
        await service.findAll();
        expect(prisma.product.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 0,
            take: 10,
          }),
        );
      });
  });
});
