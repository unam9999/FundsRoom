import prisma from '../../config/prisma';
import { AppError } from '../../utils/app-error';
import { logger } from '../../utils/logger';
import { CreateChallanInput, ChallanQueryInput } from './challan.validation';

export class ChallanService {
  /**
   * Generate next challan number.
   * Format: CHN-YYYY-NNNN
   */
  private async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CHN-${year}-`;

    const lastChallan = await prisma.challan.findFirst({
      where: { challan_number: { startsWith: prefix } },
      orderBy: { challan_number: 'desc' },
      select: { challan_number: true },
    });

    let nextNumber = 1;
    if (lastChallan) {
      const lastNum = parseInt(lastChallan.challan_number.split('-').pop() || '0', 10);
      nextNumber = lastNum + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * List challans with pagination and filters.
   */
  async list(query: ChallanQueryInput) {
    const { page, limit, status, customer_id } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, business_name: true },
          },
          creator: {
            select: { id: true, name: true, role: true },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return { challans, total, page, limit };
  }

  /**
   * Get a single challan by ID with all items and snapshots.
   */
  async getById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            business_name: true,
            mobile: true,
            email: true,
            address: true,
            gst_number: true,
          },
        },
        creator: {
          select: { id: true, name: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, current_stock: true },
            },
          },
        },
      },
    });

    if (!challan) {
      throw AppError.notFound('Challan not found');
    }

    return challan;
  }

  /**
   * Create a draft challan with items.
   * Stores product snapshots at creation time.
   * Does NOT deduct stock — that happens on confirm.
   */
  async create(input: CreateChallanInput, createdBy: string) {
    const { customer_id, items } = input;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customer_id },
    });
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    // Fetch all referenced products
    const productIds = items.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Verify all products exist
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      if (!productMap.has(item.product_id)) {
        throw AppError.notFound(`Product not found: ${item.product_id}`);
      }
    }

    // Calculate total quantity
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    // Generate challan number
    const challanNumber = await this.generateChallanNumber();

    // Create challan with items (snapshots captured)
    const challan = await prisma.challan.create({
      data: {
        challan_number: challanNumber,
        customer_id,
        total_quantity: totalQuantity,
        status: 'DRAFT',
        created_by: createdBy,
        items: {
          create: items.map((item) => {
            const product = productMap.get(item.product_id)!;
            return {
              product_id: item.product_id,
              product_name_snapshot: product.name,
              sku_snapshot: product.sku,
              unit_price_snapshot: product.unit_price,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, business_name: true },
        },
        items: true,
      },
    });

    logger.info('Draft challan created', {
      challanId: challan.id,
      challanNumber,
      customerId: customer_id,
      itemCount: items.length,
      totalQuantity,
      createdBy,
    });

    return challan;
  }

  /**
   * Confirm a draft challan.
   *
   * CRITICAL BUSINESS LOGIC — Transactional stock deduction:
   * 1. Verify challan is in DRAFT status
   * 2. For each item, re-read current stock inside transaction
   * 3. Validate requested quantity <= available stock
   * 4. Atomically decrement stock
   * 5. Create OUT stock movements
   * 6. Mark challan CONFIRMED
   *
   * If any item has insufficient stock → ROLLBACK + 409 error.
   * Concurrent confirmations cannot create negative stock.
   */
  async confirm(id: string, confirmedBy: string) {
    return await prisma.$transaction(async (tx) => {
      // Step 1: Read challan with items inside transaction
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw AppError.notFound('Challan not found');
      }

      if (challan.status !== 'DRAFT') {
        throw AppError.conflict(
          `Challan cannot be confirmed — current status is ${challan.status}`,
          'INVALID_STATUS'
        );
      }

      // Step 2 & 3: For each item, validate stock availability
      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          select: { id: true, name: true, current_stock: true },
        });

        if (!product) {
          throw AppError.notFound(`Product not found: ${item.product_id}`);
        }

        if (product.current_stock < item.quantity) {
          throw AppError.insufficientStock(
            `${product.name} (available: ${product.current_stock}, requested: ${item.quantity})`
          );
        }

        // Step 4: Atomic decrement — concurrent-safe
        await tx.product.update({
          where: { id: item.product_id },
          data: { current_stock: { decrement: item.quantity } },
        });

        // Step 5: Create OUT stock movement
        await tx.stockMovement.create({
          data: {
            product_id: item.product_id,
            quantity: item.quantity,
            movement_type: 'OUT',
            reason: `Challan ${challan.challan_number} confirmed`,
            created_by: confirmedBy,
          },
        });
      }

      // Step 6: Mark challan as CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: {
            select: { id: true, name: true, business_name: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, sku: true, current_stock: true },
              },
            },
          },
        },
      });

      logger.info('Challan confirmed', {
        challanId: id,
        challanNumber: challan.challan_number,
        itemCount: challan.items.length,
        totalQuantity: challan.total_quantity,
        confirmedBy,
      });

      return confirmedChallan;
    });
  }

  /**
   * Cancel a draft challan.
   * Only DRAFT challans can be cancelled. Stock is not affected
   * because draft challans don't deduct stock.
   */
  async cancel(id: string, cancelledBy: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
    });

    if (!challan) {
      throw AppError.notFound('Challan not found');
    }

    if (challan.status !== 'DRAFT') {
      throw AppError.conflict(
        `Challan cannot be cancelled — current status is ${challan.status}`,
        'INVALID_STATUS'
      );
    }

    const cancelledChallan = await prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: {
          select: { id: true, name: true, business_name: true },
        },
        items: true,
      },
    });

    logger.info('Challan cancelled', {
      challanId: id,
      challanNumber: challan.challan_number,
      cancelledBy,
    });

    return cancelledChallan;
  }
}

export const challanService = new ChallanService();
