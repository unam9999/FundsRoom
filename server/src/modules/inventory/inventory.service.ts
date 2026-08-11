import prisma from '../../config/prisma';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import {
  CreateMovementInput,
  MovementQueryInput,
  InventoryQueryInput,
} from './inventory.validation';

export class InventoryService {
  /**
   * Get current stock levels for all products.
   */
  async getStockLevels(query: InventoryQueryInput) {
    const { page, limit, search, low_stock } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    let products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        current_stock: true,
        minimum_stock: true,
        warehouse_location: true,
        unit_price: true,
      },
    });

    // Apply low-stock filter in application
    if (low_stock) {
      products = products.filter((p) => p.current_stock <= p.minimum_stock);
    }

    const total = products.length;
    const paginated = products.slice(skip, skip + limit);

    return { products: paginated, total, page, limit };
  }

  /**
   * Get stock movement history.
   */
  async getMovements(query: MovementQueryInput) {
    const { page, limit, product_id, movement_type } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (product_id) {
      where.product_id = product_id;
    }

    if (movement_type) {
      where.movement_type = movement_type;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          creator: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { movements, total, page, limit };
  }

  /**
   * Record a stock movement (IN or OUT).
   * Validates stock availability for OUT movements.
   * All operations are transactional.
   */
  async createMovement(input: CreateMovementInput, createdBy: string) {
    const { product_id, quantity, movement_type, reason } = input;

    return await prisma.$transaction(async (tx) => {
      // Read current product state within transaction
      const product = await tx.product.findUnique({
        where: { id: product_id },
      });

      if (!product) {
        throw AppError.notFound('Product not found');
      }

      if (movement_type === 'OUT') {
        if (product.current_stock < quantity) {
          throw AppError.insufficientStock(product.name);
        }

        // Atomic decrement — protects against concurrent updates
        await tx.product.update({
          where: { id: product_id },
          data: { current_stock: { decrement: quantity } },
        });
      } else {
        // IN movement — increment stock
        await tx.product.update({
          where: { id: product_id },
          data: { current_stock: { increment: quantity } },
        });
      }

      // Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          product_id,
          quantity,
          movement_type,
          reason: reason || null,
          created_by: createdBy,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true, current_stock: true },
          },
          creator: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      logger.info('Stock movement recorded', {
        movementId: movement.id,
        productId: product_id,
        type: movement_type,
        quantity,
        newStock: movement_type === 'IN'
          ? product.current_stock + quantity
          : product.current_stock - quantity,
        createdBy,
      });

      return movement;
    });
  }
}

export const inventoryService = new InventoryService();
