# XYZ Company — ERP + CRM Frontend

A premium React + TypeScript operations portal built against the supplied XYZ Company Express/TypeScript API.

## Stack
- React + TypeScript + Vite
- Framer Motion for interaction/micro-motion
- Lucide React for icons
- Recharts for dashboard visualization
- Native `fetch` with a centralized authenticated API client

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Default API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

## Production
Set `VITE_API_URL` to the deployed backend API URL before building.

## Backend contract used
- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard/stats`
- Customers CRUD + follow-ups
- Products CRUD + categories
- Inventory + movements
- Challans list/detail/create/confirm/cancel

## Security notes
- Bearer JWT is kept in `sessionStorage` rather than persistent local storage.
- No token, password, or authorization header is logged by the frontend.
- API access is centralized through `src/lib/api.ts`.
- A 401 response clears the client session and returns the user to login.
- Role checks are used for UX visibility, but authorization remains enforced by the backend.
- No secrets belong in `VITE_*` variables. Vite variables are public to the browser.
- The backend must retain its own validation, RBAC, CORS, rate limiting and transaction controls.

## Design direction
The UI is intentionally original: dark graphite canvas, electric-violet accent, soft glass surfaces, bento-style metrics, editorial typography, animated state transitions and dense business tables. It is inspired by modern high-end product interfaces without copying any specific site or component library.
