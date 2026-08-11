# XYZ Company — Operations Workspace

A light-first React + TypeScript frontend for the XYZ Company Mini ERP + CRM case study. The visual system is intentionally original: warm paper surfaces, olive/lime operational accents, editorial typography, dense-but-calm tables, status-driven inventory cards, and motion used for feedback rather than decoration.

## Design direction

The interface takes reference from modern inventory/SaaS products such as Shelfy: simple information hierarchy, clear stock states, friendly cards and a dashboard that answers "what needs attention?" quickly. It does not copy Shelfy's assets, layout or branding.

Reference inspiration: https://shelfy.ai/

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to the backend API base URL, for example:

```env
VITE_API_URL=http://localhost:3000/api
```

## Security boundary

- JWT is sent only as an Authorization bearer token.
- Session credentials are stored in `sessionStorage`, not persistent localStorage.
- A 401 clears the session and returns the user to login.
- The frontend never stores database credentials or server secrets.
- Role-aware UI is a usability layer; authorization remains enforced by the backend.
- All business-critical validation and stock rules remain server-side.

## Backend contract

The frontend is wired to the uploaded XYZ Company Express API: `/auth`, `/dashboard`, `/customers`, `/products`, `/inventory`, and `/challans`.
