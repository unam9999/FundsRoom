# XYZ Company — Mini ERP + CRM Operations Portal

A production-minded internal ERP/CRM system for a wholesale/distribution company built with **Node.js**, **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Authentication & RBAC](#authentication--rbac)
- [Business Logic](#business-logic)
- [Security Controls](#security-controls)
- [Testing](#testing)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [Postman Collection](#postman-collection)
- [Assumptions & Limitations](#assumptions--limitations)

---

## Architecture

```
Browser / Postman
       ▼
  React + TypeScript (Frontend — separate build)
       ▼  HTTPS / REST
  Express + TypeScript API
       │
       ├── Security Middleware (Helmet, CORS, Rate Limiting)
       ├── Authentication (JWT Bearer Token)
       ├── Role Authorization (RBAC)
       ├── Input Validation (Zod)
       ├── Controllers → Services → Business Logic
       ├── Error Handling (Global, Sanitized)
       │
       ▼
  Prisma ORM (Parameterized Queries)
       ▼
  PostgreSQL
```

**Request Flow:**
```
Request → Security Middleware → Authentication → Role Authorization
  → Input Validation → Controller → Service / Business Logic
  → Prisma / Transaction → PostgreSQL → Sanitized Response
```

> **Rule:** The frontend is untrusted. The server derives authenticated-user information from the verified JWT token and independently validates permissions, stock, quantities, ownership, and all business-critical values.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Testing | Vitest + Supertest |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** database (local or cloud — see [Database Setup](#database-setup))

### Installation

```bash
# Clone the repository
git clone https://github.com/unam9999/FundsRoom.git
cd FundsRoom

# Install server dependencies
cd server
npm install

# Set up environment
cp ../.env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`.
Health check: `GET http://localhost:3000/api/health`

---

## Environment Variables

Create a `.env` file in the `server/` directory (or copy from `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | Random string |
| `JWT_EXPIRES_IN` | Token expiration duration | `24h` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |

> ⚠️ **Never commit `.env` to Git.** The `.gitignore` excludes it. Only `.env.example` with placeholders is committed.

---

## Database Setup

### Option A: Neon (Recommended — Free Tier)

1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create a new project
3. Copy the connection string from the dashboard
4. Paste into `.env` as `DATABASE_URL`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to Settings → Database → Connection string (URI)
3. Paste into `.env` as `DATABASE_URL`

### Option C: Local PostgreSQL

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/xyz_erp"
```

### Running Migrations

```bash
cd server

# Create and apply migration
npx prisma migrate dev --name init

# Seed demo data
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```

---

## API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production:  https://your-deployed-url/api
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for product: Safety Helmet Yellow"
  }
}
```

### Endpoints

#### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| GET | `/api/auth/me` | Yes | Get authenticated user profile |

#### Customers
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/customers` | Yes | All | List (paginated, searchable) |
| GET | `/api/customers/:id` | Yes | All | Detail with follow-ups |
| POST | `/api/customers` | Yes | Admin, Sales | Create |
| PUT | `/api/customers/:id` | Yes | Admin, Sales | Update |
| DELETE | `/api/customers/:id` | Yes | Admin | Delete |
| POST | `/api/customers/:id/followups` | Yes | Admin, Sales | Add follow-up note |

#### Products
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/products` | Yes | All | List (search, category, low_stock) |
| GET | `/api/products/categories` | Yes | All | Distinct categories |
| GET | `/api/products/:id` | Yes | All | Detail with movements |
| POST | `/api/products` | Yes | Admin, Warehouse | Create |
| PUT | `/api/products/:id` | Yes | Admin, Warehouse | Update (SKU immutable) |
| DELETE | `/api/products/:id` | Yes | Admin | Delete |

#### Inventory
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/inventory` | Yes | All | Current stock levels |
| GET | `/api/inventory/movements` | Yes | All | Movement history |
| POST | `/api/inventory/movements` | Yes | Admin, Warehouse | Record stock IN/OUT |

#### Challans
| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/challans` | Yes | All | List (filter by status/customer) |
| GET | `/api/challans/:id` | Yes | All | Detail with items |
| POST | `/api/challans` | Yes | Admin, Sales | Create draft |
| POST | `/api/challans/:id/confirm` | Yes | Admin, Sales | Confirm (transactional) |
| POST | `/api/challans/:id/cancel` | Yes | Admin, Sales | Cancel draft |

#### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/stats` | Yes | Aggregate statistics |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (role) |
| 404 | Not found |
| 409 | Business conflict (stock, duplicate, status) |
| 429 | Rate limited |
| 500 | Internal server error |

---

## Authentication & RBAC

### Authentication
- Login returns a JWT token with minimal payload (`userId`, `role`)
- All protected routes require `Authorization: Bearer <token>` header
- Token is verified server-side on every request; user active status is re-checked
- Passwords are hashed with bcryptjs (12 salt rounds); never stored or logged as plaintext

### Role-Based Access Control

| Capability | Admin | Sales | Warehouse | Accounts |
|-----------|-------|-------|-----------|----------|
| Dashboard | Full | View | View | View |
| Customers | Full | Create/Edit/Follow-up | View | View |
| Products | Full | View | Create/Edit | View |
| Inventory | Full | View | Full | View |
| Challans | Full | Create/Confirm/Cancel | View | View |
| User Management | Full | — | — | — |

> RBAC is enforced at the API level via middleware. Hiding UI buttons is not security.

---

## Business Logic

### Sales Challan Workflow

```
Create Draft → Add Items (with product snapshots) → Save
       ↓
   Confirm (Transactional)
       ↓
  BEGIN TRANSACTION
       ↓
  For each item:
    → Re-read current_stock from DB
    → Validate quantity ≤ current_stock
    → If insufficient → ROLLBACK + HTTP 409
    → Atomic decrement (concurrent-safe)
    → Create OUT stock_movement
       ↓
  Mark challan CONFIRMED
       ↓
  COMMIT
```

### Key Business Rules

1. **Product Snapshots**: Challan items store `product_name_snapshot`, `sku_snapshot`, and `unit_price_snapshot` at creation time. Historical documents don't change when master product data changes.

2. **Transactional Stock Deduction**: Stock is only deducted when a challan is confirmed, not when it's drafted. The entire confirmation runs in a database transaction.

3. **Concurrency Protection**: Stock checks and decrements use Prisma's atomic `decrement` within a transaction. Concurrent confirmations cannot create negative stock.

4. **Status Transitions**: DRAFT → CONFIRMED or CANCELLED. Once confirmed or cancelled, status cannot change.

5. **Deletion Guards**: Customers with confirmed challans and products referenced in challans cannot be deleted.

---

## Security Controls

| Control | Implementation |
|---------|---------------|
| Password hashing | bcryptjs with 12 salt rounds |
| JWT payload | Minimal — userId and role only; no secrets or passwords |
| Authentication | Server-side JWT verification on all protected routes |
| Authorization | Role-based middleware checks on every privileged API |
| Input validation | Zod schemas on all write endpoints + database constraints |
| SQL injection | Prisma parameterized operations; no string concatenation |
| Secrets | Environment variables only; `.env` gitignored |
| CORS | Restricted to configured frontend origins |
| Security headers | Helmet middleware |
| Rate limiting | General (100/15min) + login (5/15min) per IP |
| Error responses | Sanitized in production — no stack traces, SQL errors, or paths |
| Logging | Structured JSON; no passwords, tokens, or sensitive bodies |

### Limitations (Honest Assessment)

- No HTTPS enforcement at application level (depends on hosting/proxy)
- No CSRF protection (acceptable for Bearer-token APIs)
- No request body size validation beyond Express default
- No IP-based blocking beyond rate limiting
- No audit log table (security events are console-logged)
- Rate limiting is in-memory and resets on server restart
- No application is uncrackable; these controls follow defense-in-depth

---

## Testing

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

| Area | Tests |
|------|-------|
| Auth | Valid login, invalid password, missing token, invalid token |
| RBAC | Unauthorized role → 403, permitted role → success |
| Validation | Missing fields, invalid email, negative quantity, invalid price |
| Customers | Create, edit, search, detail, follow-up |
| Products | Create, edit, duplicate SKU rejection |
| Inventory | IN, OUT, insufficient stock rejection |
| Challans | Draft, snapshots, confirm, cancel, duplicate confirm rejection, insufficient stock |
| Security | No secrets in responses, sanitized errors, health check |

---

## Deployment

### Backend (Render — Recommended)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/server.js`
4. Add Environment Variables:
   - `DATABASE_URL` — your Neon/Supabase connection string
   - `JWT_SECRET` — random 32+ character string
   - `NODE_ENV` — `production`
   - `CORS_ORIGIN` — your frontend URL
   - `PORT` — `3000`

### Database (Neon — Recommended)

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add as `DATABASE_URL` in Render environment variables

### Frontend (Your Build)

Deploy your React frontend to Vercel or equivalent:
- Set API base URL to your deployed backend URL
- Add the frontend URL to backend's `CORS_ORIGIN`

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@xyz.com | Admin@123 |
| Sales | sales@xyz.com | Admin@123 |
| Warehouse | warehouse@xyz.com | Admin@123 |
| Accounts | accounts@xyz.com | Admin@123 |

> ⚠️ These are demo credentials. Never reuse personal passwords.

---

## Postman Collection

Import `postman/XYZ_Company_ERP.postman_collection.json` into Postman:

1. **Open Postman** → Import → Upload File
2. The collection uses variables `{{base_url}}` and `{{token}}`
3. **Set `base_url`** to `http://localhost:3000` (or your deployed URL)
4. **Run "Login — Admin"** first — it auto-saves the token
5. All authenticated requests use `{{token}}` automatically
6. IDs are auto-saved from create responses (e.g., `{{customer_id}}`, `{{product_id}}`)

### Suggested Test Flow

1. Login as Admin
2. Create a customer → note the ID
3. Create a product → note the ID
4. Create a draft challan with those IDs
5. Confirm the challan → observe stock decrease
6. Try confirming again → observe 409 error
7. Try creating a challan with quantity > stock → confirm → observe 409

---

## Assumptions & Limitations

### Assumptions
- Four roles (Admin, Sales, Warehouse, Accounts) with the permission matrix documented above
- Challan items capture product snapshots at draft creation time
- Stock is only deducted on challan confirmation, not on draft creation
- UUIDs are used for all primary keys
- Challan numbers follow format `CHN-YYYY-NNNN`

### Limitations
- No user registration endpoint (users are created via seed or admin-only endpoint)
- No password reset flow
- No file upload / attachment support
- No real-time notifications (polling required)
- No invoice generation / PDF export
- Rate limiting is in-memory (resets on restart)
- No pagination cursor — uses offset-based pagination

---

## Project Structure

```
xyz-company-erp/
├── .gitignore
├── .env.example
├── package.json
├── README.md
├── postman/
│   └── XYZ_Company_ERP.postman_collection.json
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    ├── src/
    │   ├── app.ts
    │   ├── server.ts
    │   ├── config/
    │   │   ├── index.ts
    │   │   └── prisma.ts
    │   ├── middleware/
    │   │   ├── authenticate.ts
    │   │   ├── authorize.ts
    │   │   ├── validate.ts
    │   │   ├── error-handler.ts
    │   │   └── rate-limiter.ts
    │   ├── modules/
    │   │   ├── auth/
    │   │   │   ├── auth.routes.ts
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.service.ts
    │   │   │   └── auth.validation.ts
    │   │   ├── customers/
    │   │   │   ├── customer.routes.ts
    │   │   │   ├── customer.controller.ts
    │   │   │   ├── customer.service.ts
    │   │   │   └── customer.validation.ts
    │   │   ├── products/
    │   │   │   ├── product.routes.ts
    │   │   │   ├── product.controller.ts
    │   │   │   ├── product.service.ts
    │   │   │   └── product.validation.ts
    │   │   ├── inventory/
    │   │   │   ├── inventory.routes.ts
    │   │   │   ├── inventory.controller.ts
    │   │   │   ├── inventory.service.ts
    │   │   │   └── inventory.validation.ts
    │   │   ├── challans/
    │   │   │   ├── challan.routes.ts
    │   │   │   ├── challan.controller.ts
    │   │   │   ├── challan.service.ts
    │   │   │   └── challan.validation.ts
    │   │   └── dashboard/
    │   │       ├── dashboard.routes.ts
    │   │       ├── dashboard.controller.ts
    │   │       └── dashboard.service.ts
    │   ├── types/
    │   │   └── index.ts
    │   └── utils/
    │       ├── app-error.ts
    │       ├── logger.ts
    │       └── response.ts
    └── tests/
        └── api.test.ts
```

---

## Git Commit Discipline

Follow this commit sequence for a clean history:

```
chore: initialize full stack project
feat: add PostgreSQL schema and Prisma models
feat: implement JWT authentication
feat: add role based authorization
feat: implement customer CRM APIs
feat: implement product management APIs
feat: implement inventory movement tracking
feat: implement sales challan workflow
feat: add dashboard statistics
test: add API integration tests
docs: add API and deployment documentation
```
