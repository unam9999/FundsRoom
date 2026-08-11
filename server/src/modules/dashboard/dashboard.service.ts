import prisma from '../../config/prisma';

export class DashboardService {
  /**
   * Get aggregate dashboard statistics.
   */
  async getStats() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      totalChallans,
      draftChallans,
      confirmedChallans,
      recentChallans,
      upcomingFollowUps,
      recentMovements,
    ] = await Promise.all([
      // Customer stats
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),

      // Product stats
      prisma.product.count(),
      prisma.product.findMany({
        where: {},
        select: { id: true, name: true, sku: true, current_stock: true, minimum_stock: true },
      }).then((products) => products.filter((p) => p.current_stock <= p.minimum_stock)),

      // Challan stats
      prisma.challan.count(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),

      // Recent challans (last 10)
      prisma.challan.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, business_name: true },
          },
          creator: {
            select: { id: true, name: true },
          },
          _count: { select: { items: true } },
        },
      }),

      // Upcoming follow-ups (next 7 days)
      prisma.customerFollowUp.findMany({
        where: {
          follow_up_date: {
            gte: now,
            lte: nextWeek,
          },
        },
        orderBy: { follow_up_date: 'asc' },
        take: 20,
        include: {
          customer: {
            select: { id: true, name: true, business_name: true },
          },
          creator: {
            select: { id: true, name: true },
          },
        },
      }),

      // Recent stock movements (last 10)
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          creator: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        lowStockCount: lowStockProducts.length,
      },
      challans: {
        total: totalChallans,
        draft: draftChallans,
        confirmed: confirmedChallans,
        recent: recentChallans,
      },
      followUps: {
        upcoming: upcomingFollowUps,
        upcomingCount: upcomingFollowUps.length,
      },
      recentMovements,
    };
  }
}

export const dashboardService = new DashboardService();
