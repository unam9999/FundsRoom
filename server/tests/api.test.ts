import supertest from 'supertest';
import app from '../src/app';

const request = supertest(app);

/**
 * Helper: login and get token for a user role
 */
async function getToken(email: string, password: string): Promise<string> {
  const res = await request
    .post('/api/auth/login')
    .send({ email, password });
  
  if (res.body?.data?.token) {
    return res.body.data.token;
  }
  throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
}

// ─── Auth Tests ─────────────────────────────────────────────────────────────────

describe('Auth Module', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid admin credentials', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'admin@xyz.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.email).toBe('admin@xyz.com');
      // Password must never be in response
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    it('should login with valid sales credentials', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'sales@xyz.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('SALES');
    });

    it('should reject invalid password', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'admin@xyz.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent email', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'nobody@xyz.com', password: 'whatever' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing email', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ password: 'Admin@123' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing password', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({ email: 'admin@xyz.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile for authenticated user', async () => {
      const token = await getToken('admin@xyz.com', 'Admin@123');

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@xyz.com');
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('should reject request without token', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});

// ─── RBAC Tests ─────────────────────────────────────────────────────────────────

describe('RBAC Authorization', () => {
  it('should deny Warehouse user from creating customer', async () => {
    const token = await getToken('warehouse@xyz.com', 'Admin@123');

    const res = await request
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Customer',
        mobile: '9999999999',
        customer_type: 'RETAIL',
      });

    expect(res.status).toBe(403);
  });

  it('should deny Accounts user from creating product', async () => {
    const token = await getToken('accounts@xyz.com', 'Admin@123');

    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        sku: 'TEST-SKU-999',
        category: 'Test',
        unit_price: 100,
      });

    expect(res.status).toBe(403);
  });

  it('should deny Sales user from creating inventory movement', async () => {
    const token = await getToken('sales@xyz.com', 'Admin@123');

    const res = await request
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: '00000000-0000-0000-0000-000000000000',
        quantity: 10,
        movement_type: 'IN',
      });

    expect(res.status).toBe(403);
  });

  it('should deny Accounts user from creating challan', async () => {
    const token = await getToken('accounts@xyz.com', 'Admin@123');

    const res = await request
      .post('/api/challans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: '00000000-0000-0000-0000-000000000000',
        items: [{ product_id: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
      });

    expect(res.status).toBe(403);
  });

  it('should allow Admin to access all endpoints', async () => {
    const token = await getToken('admin@xyz.com', 'Admin@123');

    const customersRes = await request
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`);
    expect(customersRes.status).toBe(200);

    const productsRes = await request
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    expect(productsRes.status).toBe(200);

    const inventoryRes = await request
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);
    expect(inventoryRes.status).toBe(200);

    const challansRes = await request
      .get('/api/challans')
      .set('Authorization', `Bearer ${token}`);
    expect(challansRes.status).toBe(200);

    const dashboardRes = await request
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(dashboardRes.status).toBe(200);
  });
});

// ─── Customer Tests ─────────────────────────────────────────────────────────────

describe('Customer Module', () => {
  let adminToken: string;
  let createdCustomerId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin@xyz.com', 'Admin@123');
  });

  it('should create a customer', async () => {
    const res = await request
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Customer',
        mobile: '9876543211',
        email: 'test@example.com',
        customer_type: 'WHOLESALE',
        business_name: 'Test Corp',
        address: '123 Test Street',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Customer');
    createdCustomerId = res.body.data.id;
  });

  it('should list customers with pagination', async () => {
    const res = await request
      .get('/api/customers?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('should search customers by name', async () => {
    const res = await request
      .get('/api/customers?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get customer by ID with follow-ups', async () => {
    const res = await request
      .get(`/api/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdCustomerId);
    expect(res.body.data.follow_ups).toBeInstanceOf(Array);
  });

  it('should update customer', async () => {
    const res = await request
      .put(`/api/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Customer Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Customer Name');
  });

  it('should add follow-up to customer', async () => {
    const res = await request
      .post(`/api/customers/${createdCustomerId}/followups`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        note: 'Test follow-up note',
        follow_up_date: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.note).toBe('Test follow-up note');
  });

  it('should reject invalid email format', async () => {
    const res = await request
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bad Email',
        mobile: '9999999999',
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
  });
});

// ─── Product Tests ──────────────────────────────────────────────────────────────

describe('Product Module', () => {
  let adminToken: string;
  let createdProductId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin@xyz.com', 'Admin@123');
  });

  it('should create a product', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Widget',
        sku: 'TEST-WIDGET-001',
        category: 'Test Category',
        unit_price: 99.99,
        current_stock: 100,
        minimum_stock: 10,
        warehouse_location: 'T1-R1-S1',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.sku).toBe('TEST-WIDGET-001');
    createdProductId = res.body.data.id;
  });

  it('should reject duplicate SKU', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Duplicate Widget',
        sku: 'TEST-WIDGET-001',
        category: 'Test',
        unit_price: 50,
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_ENTRY');
  });

  it('should reject negative unit price', async () => {
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Negative Price',
        sku: 'NEG-PRICE-001',
        category: 'Test',
        unit_price: -10,
      });

    expect(res.status).toBe(400);
  });

  it('should update product (SKU immutable)', async () => {
    const res = await request
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Widget Name', unit_price: 149.99 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Widget Name');
  });
});

// ─── Inventory Tests ────────────────────────────────────────────────────────────

describe('Inventory Module', () => {
  let adminToken: string;
  let testProductId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin@xyz.com', 'Admin@123');

    // Create a test product
    const res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Inventory Test Product',
        sku: 'INV-TEST-001',
        category: 'Test',
        unit_price: 50,
        current_stock: 50,
        minimum_stock: 10,
      });
    testProductId = res.body.data.id;
  });

  it('should record IN stock movement', async () => {
    const res = await request
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product_id: testProductId,
        quantity: 20,
        movement_type: 'IN',
        reason: 'Test stock in',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.movement_type).toBe('IN');
    expect(res.body.data.product.current_stock).toBe(70); // 50 + 20
  });

  it('should record OUT stock movement', async () => {
    const res = await request
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product_id: testProductId,
        quantity: 10,
        movement_type: 'OUT',
        reason: 'Test stock out',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.product.current_stock).toBe(60); // 70 - 10
  });

  it('should reject OUT movement exceeding stock', async () => {
    const res = await request
      .post('/api/inventory/movements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product_id: testProductId,
        quantity: 999,
        movement_type: 'OUT',
        reason: 'Should fail',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('should list stock levels', async () => {
    const res = await request
      .get('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should list movement history', async () => {
    const res = await request
      .get('/api/inventory/movements')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

// ─── Challan Tests ──────────────────────────────────────────────────────────────

describe('Challan Module', () => {
  let adminToken: string;
  let salesToken: string;
  let testCustomerId: string;
  let testProduct1Id: string;
  let testProduct2Id: string;
  let draftChallanId: string;

  beforeAll(async () => {
    adminToken = await getToken('admin@xyz.com', 'Admin@123');
    salesToken = await getToken('sales@xyz.com', 'Admin@123');

    // Create test customer
    const custRes = await request
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Challan Test Customer',
        mobile: '9111111111',
        customer_type: 'WHOLESALE',
      });
    testCustomerId = custRes.body.data.id;

    // Create test products with known stock
    const prod1Res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Challan Product A',
        sku: 'CHN-PROD-A',
        category: 'Test',
        unit_price: 100,
        current_stock: 50,
        minimum_stock: 5,
      });
    testProduct1Id = prod1Res.body.data.id;

    const prod2Res = await request
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Challan Product B',
        sku: 'CHN-PROD-B',
        category: 'Test',
        unit_price: 200,
        current_stock: 30,
        minimum_stock: 5,
      });
    testProduct2Id = prod2Res.body.data.id;
  });

  it('should create a draft challan with product snapshots', async () => {
    const res = await request
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customer_id: testCustomerId,
        items: [
          { product_id: testProduct1Id, quantity: 10 },
          { product_id: testProduct2Id, quantity: 5 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.total_quantity).toBe(15);
    expect(res.body.data.items).toHaveLength(2);

    // Verify snapshots
    const item1 = res.body.data.items.find((i: any) => i.product_id === testProduct1Id);
    expect(item1.product_name_snapshot).toBe('Challan Product A');
    expect(item1.sku_snapshot).toBe('CHN-PROD-A');
    expect(parseFloat(item1.unit_price_snapshot)).toBe(100);

    draftChallanId = res.body.data.id;
  });

  it('should confirm challan and deduct stock', async () => {
    // Check stock before
    const beforeRes = await request
      .get(`/api/products/${testProduct1Id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const stockBefore = beforeRes.body.data.current_stock;

    // Confirm
    const res = await request
      .post(`/api/challans/${draftChallanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');

    // Check stock after
    const afterRes = await request
      .get(`/api/products/${testProduct1Id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(afterRes.body.data.current_stock).toBe(stockBefore - 10);
  });

  it('should reject confirming already confirmed challan', async () => {
    const res = await request
      .post(`/api/challans/${draftChallanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });

  it('should reject challan with insufficient stock', async () => {
    // Create challan requesting more than available
    const createRes = await request
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customer_id: testCustomerId,
        items: [
          { product_id: testProduct1Id, quantity: 99999 },
        ],
      });

    const bigChallanId = createRes.body.data.id;

    const res = await request
      .post(`/api/challans/${bigChallanId}/confirm`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('should cancel a draft challan', async () => {
    // Create a new draft
    const createRes = await request
      .post('/api/challans')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customer_id: testCustomerId,
        items: [{ product_id: testProduct1Id, quantity: 1 }],
      });

    const cancelId = createRes.body.data.id;

    const res = await request
      .post(`/api/challans/${cancelId}/cancel`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('should list challans', async () => {
    const res = await request
      .get('/api/challans')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

// ─── Security Tests ─────────────────────────────────────────────────────────────

describe('Security Checks', () => {
  it('should return 404 for unknown endpoints', async () => {
    const res = await request.get('/api/nonexistent');
    expect(res.status).toBe(404);
  });

  it('should return health check', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
  });

  it('should not expose password in login response', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'admin@xyz.com', password: 'Admin@123' });

    const body = JSON.stringify(res.body);
    expect(body).not.toContain('password_hash');
    expect(body).not.toContain('Admin@123');
  });

  it('should not expose stack traces in error responses', async () => {
    const res = await request
      .get('/api/customers/invalid-uuid')
      .set('Authorization', `Bearer invalid`);

    expect(res.body.error).toBeDefined();
    expect(res.body.error.stack).toBeUndefined();
  });
});
