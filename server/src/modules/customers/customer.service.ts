import prisma from '../../config/prisma';
import { AppError } from '../../utils/app-error';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateFollowUpInput,
  CustomerQueryInput,
} from './customer.validation';

export class CustomerService {
  /**
   * List customers with pagination, search, and filters.
   */
  async list(query: CustomerQueryInput) {
    const { page, limit, search, status, customer_type } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { business_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customer_type) {
      where.customer_type = customer_type;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          _count: { select: { follow_ups: true, challans: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total, page, limit };
  }

  /**
   * Get a single customer by ID with follow-up history.
   */
  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        follow_ups: {
          orderBy: { follow_up_date: 'desc' },
          include: {
            creator: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { created_at: 'desc' },
          take: 10,
          select: {
            id: true,
            challan_number: true,
            total_quantity: true,
            status: true,
            created_at: true,
          },
        },
        _count: { select: { follow_ups: true, challans: true } },
      },
    });

    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    return customer;
  }

  /**
   * Create a new customer.
   */
  async create(input: CreateCustomerInput) {
    const customer = await prisma.customer.create({
      data: input,
    });

    return customer;
  }

  /**
   * Update an existing customer.
   */
  async update(id: string, input: UpdateCustomerInput) {
    // Verify customer exists
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Customer not found');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: input,
    });

    return customer;
  }

  /**
   * Delete a customer.
   * Only allowed if no confirmed challans exist.
   */
  async delete(id: string) {
    const existing = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          where: { status: 'CONFIRMED' },
          select: { id: true },
        },
      },
    });

    if (!existing) {
      throw AppError.notFound('Customer not found');
    }

    if (existing.challans.length > 0) {
      throw AppError.conflict(
        'Cannot delete customer with confirmed challans. Consider marking as inactive instead.'
      );
    }

    await prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }

  /**
   * Add a follow-up note to a customer.
   */
  async addFollowUp(customerId: string, input: CreateFollowUpInput, createdBy: string) {
    // Verify customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw AppError.notFound('Customer not found');
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customer_id: customerId,
        note: input.note,
        follow_up_date: input.follow_up_date,
        created_by: createdBy,
      },
      include: {
        creator: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return followUp;
  }
}

export const customerService = new CustomerService();
