# Backend integration notes — XYZ Company

This frontend is wired to the supplied Express/TypeScript backend contract. It expects the backend to be running with the `/api` prefix.

## Local URLs

Frontend:
- `http://localhost:5173`

Backend:
- `http://localhost:3000`

Set:

```env
VITE_API_URL=http://localhost:3000/api
```

## API mapping

| UI | API |
|---|---|
| Login | `POST /auth/login` |
| Session restore | `GET /auth/me` |
| Dashboard | `GET /dashboard/stats` |
| Customers | `/customers` + `/:id/followups` |
| Products | `/products` |
| Inventory | `/inventory`, `/inventory/movements` |
| Challans | `/challans`, `/:id/confirm`, `/:id/cancel` |

## Security boundary

The frontend does not attempt to replace backend security. It provides UX-level role visibility and sends the authenticated bearer token. The backend remains authoritative for JWT verification, RBAC, Zod validation, stock transactions, database constraints, CORS, rate limiting and sanitized errors.

The frontend uses `sessionStorage` for the short-lived browser session because the supplied backend currently exposes a bearer-token API. This is not equivalent to an HttpOnly cookie architecture; if the backend later adds secure refresh sessions, the client can be migrated to that model.

Do not put `DATABASE_URL`, `JWT_SECRET` or any backend secret in a `VITE_*` variable. Vite client variables are shipped to the browser.
