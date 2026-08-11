import prisma from '../../config/prisma';
import { AppError } from '../../utils/app-error';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
} from './product.validation';

export class ProductService {
  /**
   * List products with pagination, search, category filter, and low-stock filter.
   */
  async list(query: ProductQueryInput) {
    const { page, limit, search, category, low_stock } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (low_stock) {
      // Products where current_stock <= minimum_stock
      where.current_stock = { lte: prisma.product.fields.minimum_stock };
      // Prisma doesn't support field-to-field comparison directly in where,
      // so we use raw filter approach
      delete where.current_stock;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    // If low_stock filter, filter in application
    let filteredProducts = products;
    let filteredTotal = total;

    if (low_stock) {
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      const lowStockProducts = allProducts.filter(
        (p) => p.current_stock <= p.minimum_stock
      );
      filteredTotal = lowStockProducts.length;
      filteredProducts = lowStockProducts.slice(skip, skip + limit);
    }

    return { products: filteredProducts, total: filteredTotal, page, limit };
  }

  /**
   * Get a single product by ID.
   */
  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stock_movements: {
          orderBy: { created_at: 'desc' },
          take: 20,
          include: {
            creator: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        _count: { select: { stock_movements: true, challan_items: true } },
      },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return product;
  }

  /**
   * Create a new product.
   */
  async create(input: CreateProductInput) {
    const product = await prisma.product.create({
      data: input,
    });

    return product;
  }

  /**
   * Update an existing product.
   * SKU cannot be changed after creation.
   */
  async update(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Product not found');
    }

    const product = await prisma.product.update({
      where: { id },
      data: input,
    });

    return product;
  }

  /**
   * Delete a product.
   * Only allowed if no challan items reference it.
   */
  async delete(id: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        challan_items: { select: { id: true }, take: 1 },
      },
    });

    if (!existing) {
      throw AppError.notFound('Product not found');
    }

    if (existing.challan_items.length > 0) {
      throw AppError.conflict(
        'Cannot delete product that appears in challans'
      );
    }

    await prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }

  /**
   * Get distinct categories for filter dropdown.
   */
  async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return products.map((p) => p.category);
  }
}

export const productService = new ProductService();
