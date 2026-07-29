# Nexus ERP — Mini ERP + CRM Operations Portal

A small ERP/CRM system for a wholesale/distribution company: customers, products/inventory, and sales challans, with role-based access for Admin, Sales, Warehouse, and Accounts teams.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, TypeScript, NestJS, Drizzle ORM, PostgreSQL (Neon), JWT auth (Passport) |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, lucide-react |
| Database | PostgreSQL (developed against [Neon](https://neon.tech) serverless Postgres) |

## Project structure

```
backend/    NestJS REST API (all routes under /api)
frontend/   React SPA (Vite)
```

The two apps are independent — separate `package.json`, separate deploys, talking over HTTP via `VITE_API_URL`.

## Architecture

- **Auth**: JWT access token (15m) + refresh token (7d), issued on `POST /auth/login`. The frontend axios client auto-refreshes on a 401 and retries the original request once; if the refresh token is also invalid it clears session storage and redirects to `/login`.
- **Roles**: `admin`, `sales`, `warehouse`, `accounts`. Enforced server-side with a `RolesGuard` + `@Roles(...)` decorator on every controller method — the frontend also hides actions the current role can't perform, but the backend is the source of truth.
- **Validation**: every request body is validated with `class-validator` DTOs via a global `ValidationPipe` (`whitelist: true, transform: true`). Errors are normalized by a global `HttpExceptionFilter` into `{ statusCode, message, error, path, timestamp }`.
- **Customers**: soft-deletable, searchable (name/mobile/business name), filterable by status/type, paginated. Follow-up notes are a separate table so history is preserved; adding a follow-up with a date also updates the customer's "next follow-up" field.
- **Products & inventory**: every stock change (opening stock aside) is written through `stock_movements` (product, quantity, IN/OUT, reason, actor, timestamp) — the product's `current_stock` is a running total, never edited directly by users. Stock adjustments run inside a transaction with a row lock (`SELECT ... FOR UPDATE`) so concurrent adjustments can't push stock negative.
- **Sales challans**: challan numbers are generated from a Postgres sequence (`CH-YYYYMMDD-#####`). A challan starts as `draft` (no stock touched) and stores a **snapshot** of each line's product name/SKU/price at add-time, so historical challans stay accurate even if a product is later renamed or repriced. Confirming a draft locks each product row, deducts stock inside one transaction, and refuses (with a clear error) if a line would take stock negative — the whole confirmation is all-or-nothing. Cancelling a previously-confirmed challan reverses the deduction (restocks) the same way.
- **Frontend**: a single `AppLayout` wraps all authenticated routes with a collapsible sidebar (a fixed drawer with an overlay on mobile, a static column on `lg+` screens) and role-filtered navigation. Shared `DataTable`/`Modal`/`Pagination`/`ConfirmDialog` components keep list pages consistent.

## Getting started (local)

### Prerequisites
- Node.js 20+
- A PostgreSQL database (Neon, Supabase, Render Postgres, or local Postgres all work)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in DATABASE_URL and generate JWT secrets (see below)
npm run db:migrate     # applies backend/src/database/migrations against your DATABASE_URL
npm run db:seed        # creates one test user per role
npm run start:dev      # http://localhost:4000/api
```

Generate strong JWT secrets instead of leaving placeholders:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL should point at the backend above
npm run dev             # http://localhost:5173
```

### Test login credentials

Seeded by `npm run db:seed` (password is the same for all four):

| Role | Email | Password |
|---|---|---|
| Admin | admin@erp.test | Password123! |
| Sales | sales@erp.test | Password123! |
| Warehouse | warehouse@erp.test | Password123! |
| Accounts | accounts@erp.test | Password123! |

## Environment variables

**backend/.env**
| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_ACCESS_SECRET` | Signs 15-minute access tokens |
| `JWT_REFRESH_SECRET` | Signs 7-day refresh tokens |
| `PORT` | API port (default 4000) |

**frontend/.env**
| Var | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including the `/api` prefix |

`.env` files are gitignored; `.env.example` in each app documents the shape without real secrets.

## API

All routes are prefixed with `/api` (e.g. `POST /api/auth/login`, `GET /api/customers`). A Postman collection covering every endpoint is at [`docs/postman_collection.json`](docs/postman_collection.json) — import it, set the collection's `baseUrl` variable, run "Login" once, and the `accessToken` variable auto-populates for the rest of the requests.

List endpoints (`GET /customers`, `/products`, `/challans`) support `page`/`limit` pagination, `search`/status/type filters, and return `{ data, meta: { page, limit, total, totalPages } }`.

## Deployment

Not deployed for this submission — see "Known limitations" below. To deploy on free tiers:
- **Database**: Neon / Supabase / Render Postgres — create a database, copy its connection string into `DATABASE_URL`.
- **Backend**: Render / Railway / Fly.io — build command `npm install && npm run build`, start command `npm run start`, set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT` as environment variables, then run `npm run db:migrate` (and optionally `db:seed`) once against the deployed database.
- **Frontend**: Vercel / Netlify / Render Static Site — build command `npm run build`, publish directory `dist`, set `VITE_API_URL` to the deployed backend's `/api` URL.

AWS deployment was treated as the optional bonus it's described as in the brief and was not pursued for this submission.

## Assumptions

- "Add follow-up notes" is modelled as an append-only history (`customer_followups`) rather than overwriting the customer's `notes` field, so past follow-ups are never lost.
- Sales challans require a customer and at least one line item; quantities are capped client-side at the product's currently-known stock, and re-validated server-side at confirm time regardless of what the client sent.
- Stock movement reasons are free text (e.g. "New purchase", "Damage", "Correction") rather than a fixed enum, since real warehouse reasons vary.
- Only Admin and Warehouse roles can create/edit products or adjust stock; Sales and Accounts have read access. Only Admin and Sales can create/edit customers or challans; Warehouse can confirm/cancel challans (since that's what drives stock) but not create them.
- Categories and warehouses are simple lookup tables created ad hoc from the product form rather than a separate managed module, since the brief didn't call for full CRUD on them.

## Known limitations

- Not deployed live for this submission (see Deployment above for the intended path); tested locally end-to-end, including a live browser pass (Playwright) through login, customer/product create+edit, stock adjustment, and the full challan draft → confirm (stock deduction) flow.
- No automated test suite (unit/e2e) — validation was done via manual + scripted browser testing.
- No invoice generation (mentioned in the business context, not in the required core modules) and no PDF export.
- User accounts are seed-only; there's no in-app user management screen (out of scope per the required modules — only login + roles were required).
- Tables scroll horizontally on narrow phone screens rather than reflowing into cards; this is an intentional, common trade-off for dense admin data tables rather than an oversight.
