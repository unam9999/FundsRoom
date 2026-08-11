import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing data ──────────────────────────────────────────────────────
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(12);

  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'admin@xyz.com',
      password_hash: await bcrypt.hash('Admin@123', salt),
      role: Role.ADMIN,
      is_active: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'sales@xyz.com',
      password_hash: await bcrypt.hash('Admin@123', salt),
      role: Role.SALES,
      is_active: true,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'warehouse@xyz.com',
      password_hash: await bcrypt.hash('Admin@123', salt),
      role: Role.WAREHOUSE,
      is_active: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Sunita Verma',
      email: 'accounts@xyz.com',
      password_hash: await bcrypt.hash('Admin@123', salt),
      role: Role.ACCOUNTS,
      is_active: true,
    },
  });

  console.log('✅ Users created');

  // ─── Customers ────────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Vikram Singh',
        mobile: '9876543210',
        email: 'vikram@singhtraders.com',
        business_name: 'Singh Traders',
        gst_number: '27AABCS1234H1Z5',
        customer_type: CustomerType.WHOLESALE,
        address: '45 Industrial Area, Phase 2, Pune',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Meena Devi',
        mobile: '9123456780',
        email: 'meena@devienterprise.com',
        business_name: 'Devi Enterprise',
        gst_number: '29AADFD8234K1ZR',
        customer_type: CustomerType.DISTRIBUTOR,
        address: '12 MG Road, Bangalore',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Arjun Nair',
        mobile: '9988776655',
        email: 'arjun.nair@gmail.com',
        business_name: null,
        gst_number: null,
        customer_type: CustomerType.RETAIL,
        address: '78 Anna Salai, Chennai',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sanjay Gupta',
        mobile: '9876001234',
        email: 'sanjay@guptadist.com',
        business_name: 'Gupta Distributors',
        gst_number: '07AABCG5678D1Z9',
        customer_type: CustomerType.DISTRIBUTOR,
        address: '23 Karol Bagh, New Delhi',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Lakshmi Iyer',
        mobile: '9845612378',
        email: 'lakshmi@iyerstore.in',
        business_name: 'Iyer General Store',
        gst_number: '33AAECI9012F1ZX',
        customer_type: CustomerType.RETAIL,
        address: '5 T Nagar, Chennai',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Farhan Khan',
        mobile: '9900112233',
        email: 'farhan@khanwholesale.com',
        business_name: 'Khan Wholesale Mart',
        gst_number: '24AABCK3456G1Z2',
        customer_type: CustomerType.WHOLESALE,
        address: '67 Ring Road, Ahmedabad',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Deepa Reddy',
        mobile: '9871234567',
        email: 'deepa@reddytrading.com',
        business_name: 'Reddy Trading Co.',
        gst_number: '36AABCR7890H1Z1',
        customer_type: CustomerType.WHOLESALE,
        address: '90 Banjara Hills, Hyderabad',
        status: CustomerStatus.INACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ravi Prakash',
        mobile: '9834567890',
        email: null,
        business_name: null,
        gst_number: null,
        customer_type: CustomerType.RETAIL,
        address: '34 Hazratganj, Lucknow',
        status: CustomerStatus.ACTIVE,
      },
    }),
  ]);

  console.log('✅ Customers created');

  // ─── Customer Follow-ups ──────────────────────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.customerFollowUp.create({
      data: {
        customer_id: customers[0].id,
        note: 'Discussed bulk order for Q3. Customer interested in 500 units of industrial bolts.',
        follow_up_date: tomorrow,
        created_by: salesUser.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customer_id: customers[1].id,
        note: 'Payment pending for last invoice. Reminded about 15-day terms.',
        follow_up_date: nextWeek,
        created_by: salesUser.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customer_id: customers[3].id,
        note: 'New product catalog sent via email. Awaiting feedback.',
        follow_up_date: tomorrow,
        created_by: admin.id,
      },
    }),
    prisma.customerFollowUp.create({
      data: {
        customer_id: customers[0].id,
        note: 'Initial meeting completed. Customer tour of warehouse scheduled.',
        follow_up_date: yesterday,
        created_by: salesUser.id,
      },
    }),
  ]);

  console.log('✅ Follow-ups created');

  // ─── Products ─────────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Industrial Hex Bolt M10',
        sku: 'BOLT-HEX-M10',
        category: 'Fasteners',
        unit_price: 12.50,
        current_stock: 5000,
        minimum_stock: 500,
        warehouse_location: 'A1-R3-S2',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Stainless Steel Washer M8',
        sku: 'WASH-SS-M8',
        category: 'Fasteners',
        unit_price: 5.75,
        current_stock: 8000,
        minimum_stock: 1000,
        warehouse_location: 'A1-R3-S3',
      },
    }),
    prisma.product.create({
      data: {
        name: 'PVC Pipe 2 inch (3m)',
        sku: 'PIPE-PVC-2IN',
        category: 'Plumbing',
        unit_price: 285.00,
        current_stock: 200,
        minimum_stock: 50,
        warehouse_location: 'B2-R1-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Copper Wire 2.5mm (100m)',
        sku: 'WIRE-CU-25',
        category: 'Electrical',
        unit_price: 4500.00,
        current_stock: 75,
        minimum_stock: 20,
        warehouse_location: 'C1-R2-S4',
      },
    }),
    prisma.product.create({
      data: {
        name: 'LED Panel Light 18W',
        sku: 'LED-PNL-18W',
        category: 'Electrical',
        unit_price: 650.00,
        current_stock: 300,
        minimum_stock: 50,
        warehouse_location: 'C2-R1-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'GI Sheet 0.5mm (8x4 ft)',
        sku: 'GI-SHT-05MM',
        category: 'Steel',
        unit_price: 1200.00,
        current_stock: 150,
        minimum_stock: 30,
        warehouse_location: 'D1-R1-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ball Valve 1 inch Brass',
        sku: 'VALVE-BALL-1IN',
        category: 'Plumbing',
        unit_price: 380.00,
        current_stock: 400,
        minimum_stock: 80,
        warehouse_location: 'B2-R2-S3',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Cement OPC 53 Grade (50kg)',
        sku: 'CEM-OPC-53',
        category: 'Building Materials',
        unit_price: 420.00,
        current_stock: 500,
        minimum_stock: 100,
        warehouse_location: 'E1-R1-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Paint Emulsion White (20L)',
        sku: 'PNT-EMU-WHT-20',
        category: 'Paints',
        unit_price: 2800.00,
        current_stock: 60,
        minimum_stock: 15,
        warehouse_location: 'F1-R1-S2',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Safety Helmet Yellow',
        sku: 'SAF-HLM-YLW',
        category: 'Safety Equipment',
        unit_price: 250.00,
        current_stock: 3,
        minimum_stock: 25,
        warehouse_location: 'G1-R1-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Drill Bit Set HSS (13pc)',
        sku: 'TOOL-DRL-HSS13',
        category: 'Tools',
        unit_price: 850.00,
        current_stock: 8,
        minimum_stock: 20,
        warehouse_location: 'G2-R3-S1',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Welding Rod E6013 (5kg)',
        sku: 'WELD-E6013-5K',
        category: 'Welding',
        unit_price: 550.00,
        current_stock: 120,
        minimum_stock: 30,
        warehouse_location: 'D2-R2-S1',
      },
    }),
  ]);

  console.log('✅ Products created');

  // ─── Stock Movements (initial stock-in records) ───────────────────────────────
  for (const product of products) {
    await prisma.stockMovement.create({
      data: {
        product_id: product.id,
        quantity: product.current_stock,
        movement_type: MovementType.IN,
        reason: 'Initial stock load',
        created_by: warehouseUser.id,
      },
    });
  }

  console.log('✅ Initial stock movements created');

  // ─── Challans ─────────────────────────────────────────────────────────────────

  // Confirmed challan
  const confirmedChallan = await prisma.challan.create({
    data: {
      challan_number: 'CHN-2026-0001',
      customer_id: customers[0].id,
      total_quantity: 150,
      status: ChallanStatus.CONFIRMED,
      created_by: salesUser.id,
      items: {
        create: [
          {
            product_id: products[0].id,
            product_name_snapshot: products[0].name,
            sku_snapshot: products[0].sku,
            unit_price_snapshot: products[0].unit_price,
            quantity: 100,
          },
          {
            product_id: products[1].id,
            product_name_snapshot: products[1].name,
            sku_snapshot: products[1].sku,
            unit_price_snapshot: products[1].unit_price,
            quantity: 50,
          },
        ],
      },
    },
  });

  // Stock movements for confirmed challan
  await prisma.stockMovement.create({
    data: {
      product_id: products[0].id,
      quantity: 100,
      movement_type: MovementType.OUT,
      reason: `Challan ${confirmedChallan.challan_number} confirmed`,
      created_by: salesUser.id,
    },
  });
  await prisma.stockMovement.create({
    data: {
      product_id: products[1].id,
      quantity: 50,
      movement_type: MovementType.OUT,
      reason: `Challan ${confirmedChallan.challan_number} confirmed`,
      created_by: salesUser.id,
    },
  });

  // Adjust stock for confirmed challan (seed reflects post-confirmation state)
  await prisma.product.update({
    where: { id: products[0].id },
    data: { current_stock: { decrement: 100 } },
  });
  await prisma.product.update({
    where: { id: products[1].id },
    data: { current_stock: { decrement: 50 } },
  });

  // Draft challan
  await prisma.challan.create({
    data: {
      challan_number: 'CHN-2026-0002',
      customer_id: customers[3].id,
      total_quantity: 30,
      status: ChallanStatus.DRAFT,
      created_by: salesUser.id,
      items: {
        create: [
          {
            product_id: products[4].id,
            product_name_snapshot: products[4].name,
            sku_snapshot: products[4].sku,
            unit_price_snapshot: products[4].unit_price,
            quantity: 20,
          },
          {
            product_id: products[6].id,
            product_name_snapshot: products[6].name,
            sku_snapshot: products[6].sku,
            unit_price_snapshot: products[6].unit_price,
            quantity: 10,
          },
        ],
      },
    },
  });

  // Cancelled challan
  await prisma.challan.create({
    data: {
      challan_number: 'CHN-2026-0003',
      customer_id: customers[5].id,
      total_quantity: 5,
      status: ChallanStatus.CANCELLED,
      created_by: admin.id,
      items: {
        create: [
          {
            product_id: products[8].id,
            product_name_snapshot: products[8].name,
            sku_snapshot: products[8].sku,
            unit_price_snapshot: products[8].unit_price,
            quantity: 5,
          },
        ],
      },
    },
  });

  console.log('✅ Challans created');

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  🎉 Database seeded successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  Demo Credentials:');
  console.log('  ─────────────────');
  console.log('  Admin:     admin@xyz.com     / Admin@123');
  console.log('  Sales:     sales@xyz.com     / Admin@123');
  console.log('  Warehouse: warehouse@xyz.com / Admin@123');
  console.log('  Accounts:  accounts@xyz.com  / Admin@123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
