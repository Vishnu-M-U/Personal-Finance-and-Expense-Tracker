# Personal Finance & Expense Tracker — Architecture

## 1. Architecture Overview

The project is a monorepo containing two independent applications:

- `frontend` — Next.js application (runs on `http://localhost:3000`)
- `backend` — Express.js REST API (runs on `http://localhost:5000`)

MySQL runs inside a Docker container (exposed on `localhost:3307` — port 3307 avoids clashing with a MySQL server already installed on the host).

The frontend and backend have separate `package.json` files and are
installed, run, and tested independently. They share no code; the API
contract in [api.md](api.md) is the boundary between them.

```text
                         Browser
                            |
                            | HTTP / JSON (cookie: access_token)
                            v
                 +----------------------+
                 |       Next.js        |   :3000
                 |       Frontend       |
                 +----------+-----------+
                            |
                     Axios / React Query
                            |
                            v
                 +----------------------+
                 |      Express API     |   :5000
                 |       Backend        |
                 +----------+-----------+
                            |
             Routes → Middleware → Controllers → Services
                            |
                         Prisma
                            |
                            v
                 +----------------------+
                 |        MySQL         |   :3307
                 |   Docker Container   |
                 +----------------------+
```

---

## 2. Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| API style | REST + JSON | Simple, well understood, fits CRUD |
| Auth transport | JWT in httpOnly cookie | Token not readable by JavaScript, so XSS cannot steal it |
| Validation | Zod on the backend (source of truth), Zod on the frontend for forms | One library, same rules on both sides |
| Money | `DECIMAL(12,2)` in DB, string in JSON | Avoids floating-point rounding errors |
| Server state | TanStack React Query | Caching, loading/error states, invalidation after mutations |
| Backend layout | Feature modules (auth, transactions, …) | Keeps each feature's routes, controller, service, and schemas together |
| Docker | MySQL only | Fast local iteration with hot reload for both apps |

---

## 3. Backend Architecture

### 3.1 Folder Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── categories.ts            # category list + seedCategories()
│   ├── seed.ts                  # runs seedCategories() (npm run db:seed)
│   └── migrations/
├── src/
│   ├── generated/prisma/        # generated Prisma client (git-ignored)
│   ├── server.ts                # starts HTTP server
│   ├── app.ts                   # builds Express app (used by server and tests)
│   ├── config/
│   │   └── env.ts               # loads + validates env vars with Zod
│   ├── lib/
│   │   └── prisma.ts            # single PrismaClient instance (MariaDB adapter)
│   ├── middleware/
│   │   ├── requireAuth.ts       # verifies JWT cookie, sets req.userId
│   │   ├── rateLimit.ts         # rate limiter for /api/auth
│   │   ├── errorHandler.ts      # converts AppError / ZodError / others to the API error format
│   │   └── notFound.ts          # 404 for unknown routes
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schemas.ts
│   │   ├── categories/
│   │   ├── transactions/
│   │   └── dashboard/
│   ├── utils/
│   │   ├── AppError.ts          # typed error with status + code
│   │   ├── jwt.ts               # sign / verify helpers
│   │   ├── authCookie.ts        # set / clear the access_token cookie
│   │   └── serializers.ts       # Decimal → string, Date → YYYY-MM-DD
│   └── types/
│       └── express.d.ts         # adds userId to Request
├── tests/
│   ├── testEnv.ts               # env for the test run (test database URL)
│   ├── globalSetup.ts           # applies migrations to the test database
│   ├── helpers.ts               # resetDatabase()
│   ├── auth.test.ts
│   ├── transactions.test.ts
│   └── dashboard.test.ts
├── .env.example
├── prisma.config.ts             # Prisma 7 config: schema, migrations, seed, DB URL
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Must NOT |
|-------|----------------|----------|
| **Routes** | Map HTTP method + path to middleware and controller | Contain logic |
| **Middleware** | Cross-cutting concerns: auth, validation, errors, security headers | Access feature data directly |
| **Controllers** | Validate input with `schema.parse(req.body / req.query / req.params)`, call a service, send the response | Call Prisma directly |
| **Services** | Business logic and all database access via Prisma | Know about `req` / `res` |
| **Schemas** | Zod schemas for request body, query, params | — |

### 3.3 Request Lifecycle

```text
Request
  → helmet, cors, express.json, cookie-parser    (global middleware)
  → rate limiter                                  (auth routes only)
  → router
  → requireAuth                                   (protected routes)
  → controller: schema.parse(...)                 (ZodError → 400)
  → service → Prisma → MySQL
  → response JSON
  ↳ any thrown error → errorHandler → { error: { code, message, details? } }
```

### 3.4 Error Handling

- Services throw `AppError(status, code, message)` for expected failures
  (e.g. `404 NOT_FOUND`, `409 EMAIL_TAKEN`).
- Zod validation failures (`ZodError` thrown by `schema.parse` in controllers)
  become `400 VALIDATION_ERROR` with a `details` array. Parsing in the
  controller (instead of a `validate` middleware) keeps the parsed, typed
  values in a local variable — Express 5 makes `req.query` read-only.
- Unknown errors become `500 INTERNAL_ERROR`; the stack trace is logged but
  never sent to the client.
- Express 5 forwards rejected promises from async handlers to the error
  handler automatically (no wrapper needed). If Express 4 is used, an
  `asyncHandler` wrapper is required.

---

## 4. Frontend Architecture

### 4.1 Folder Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # root layout, <Providers>
│   │   ├── page.tsx                   # redirect to /dashboard or /login
│   │   ├── (auth)/                    # guest-only pages
│   │   │   ├── layout.tsx             # redirects logged-in users away
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/                     # authenticated pages
│   │       ├── layout.tsx             # auth guard + navbar
│   │       ├── dashboard/page.tsx
│   │       └── transactions/page.tsx
│   ├── components/
│   │   ├── ui/                        # Button, Input, Select, Modal, Card, Spinner…
│   │   ├── layout/                    # Navbar, UserMenu
│   │   ├── dashboard/                 # PeriodSelector, SummaryCards,
│   │   │                              # CategoryChart, RecentTransactions
│   │   └── transactions/              # TransactionTable, TransactionFilters,
│   │                                  # TransactionFormModal, DeleteDialog, Pagination
│   ├── hooks/
│   │   ├── useAuth.ts                 # useMe, useLogin, useRegister, useLogout
│   │   ├── useCategories.ts
│   │   ├── useTransactions.ts         # list, create, update, delete
│   │   └── useDashboard.ts
│   ├── lib/
│   │   ├── api.ts                     # Axios instance
│   │   ├── queryClient.ts
│   │   ├── queryKeys.ts
│   │   └── format.ts                  # currency + date formatting
│   ├── schemas/                       # Zod schemas for forms
│   ├── types/                         # API response types
│   └── providers.tsx                  # QueryClientProvider
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 4.2 Data Fetching

- All API calls go through one Axios instance in `lib/api.ts`:
  - `baseURL = process.env.NEXT_PUBLIC_API_URL`
  - `withCredentials: true` so the auth cookie is sent
  - A response interceptor: on `401`, clear the React Query cache and
    redirect to `/login`
- Pages that need data are **client components** using React Query hooks.
  (Server-side fetching is not used in the MVP because the auth cookie
  belongs to the API origin.)

### 4.3 React Query Keys and Invalidation

| Query key | Data |
|-----------|------|
| `['me']` | Current user |
| `['categories', type?]` | Category list |
| `['transactions', filters]` | Paginated transaction list |
| `['dashboard', { startDate, endDate }]` | Dashboard summary |

After creating, updating, or deleting a transaction, invalidate
`['transactions']` and `['dashboard']`.
After login/register, set `['me']`. After logout, clear the entire cache.

### 4.4 Route Protection

- `(app)/layout.tsx` calls `useMe()`.
  - Loading → full-page spinner
  - `401` → redirect to `/login`
  - Success → render navbar + page
- `(auth)/layout.tsx` does the opposite: if `useMe()` succeeds, redirect to
  `/dashboard`.
- The backend is the real security boundary. Frontend guards only control
  the user experience.

### 4.5 UI State

- Transaction filters, sort, and page live in the **URL query string**
  (`useSearchParams`), so they survive refresh.
- Modal open/close and form state are local component state
  (React Hook Form).
- No global state library is needed.

---

## 5. Authentication Flow

```text
Register / Login
  Browser ── POST /api/auth/login {email, password} ──▶ API
  API: validate → find user → bcrypt.compare → sign JWT { sub: userId }
  API ◀── 200 { data: { user } } + Set-Cookie: access_token=<jwt>; HttpOnly ──

Authenticated request
  Browser ── GET /api/transactions (cookie sent automatically) ──▶ API
  requireAuth: read cookie → verify JWT → req.userId = sub
  Service queries always include WHERE userId = req.userId

Logout
  Browser ── POST /api/auth/logout ──▶ API
  API ◀── 204 + Set-Cookie: access_token=; Max-Age=0 ──
```

**Cookie settings**

| Attribute | Value |
|-----------|-------|
| Name | `access_token` |
| HttpOnly | `true` |
| Secure | `true` in production, `false` in development |
| SameSite | `Lax` |
| Path | `/` |
| Max-Age | Same as JWT expiry (1 day) |

`localhost:3000` and `localhost:5000` count as the same *site* (the port is
ignored), so a `SameSite=Lax` cookie works in development. In production,
the frontend and API should be served from the same site (e.g.
`app.example.com` and `api.example.com`).

**Known MVP limitation:** JWTs are stateless, so logging out removes the
cookie but does not invalidate the token itself before it expires.

---

## 6. Security

| Concern | Mitigation |
|---------|------------|
| Password storage | bcrypt, cost 12; passwords never logged or returned |
| XSS token theft | httpOnly cookie; React escapes output by default |
| CSRF | `SameSite=Lax` cookie + CORS limited to `CORS_ORIGIN` + API only accepts `application/json` bodies |
| Brute-force login | `express-rate-limit` on `/api/auth/*` (20 requests / 15 min / IP) |
| Data leakage between users | Every transaction query filters by `userId`; other users' records return `404` |
| Injection | Prisma parameterized queries; Zod validates all input |
| HTTP headers | `helmet` |
| Secrets | `.env` files are git-ignored; `JWT_SECRET` ≥ 32 random characters |
| User enumeration | Generic login error message |

---

## 7. Configuration

### Root `.env.example` (Docker Compose)

```text
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=finance_tracker
MYSQL_USER=finance_user
MYSQL_PASSWORD=finance_password
MYSQL_PORT=3307
```

### `backend/.env.example`

```text
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:rootpassword@localhost:3307/finance_tracker
JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000
```

In development `DATABASE_URL` uses the MySQL `root` user because
`prisma migrate dev` needs permission to create a temporary *shadow database*.
The limited `finance_user` account is intended for production-like setups.

### `frontend/.env.example`

```text
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CURRENCY=INR
```

The backend validates its env vars at startup (`config/env.ts`) and exits
with a clear message if any are missing.

---

## 8. Docker

`docker-compose.yml` defines a single `mysql` service:

```text
services:
  mysql:
    image: mysql:8.4
    container_name: finance-tracker-mysql
    restart: unless-stopped
    env_file: .env
    ports:
      - "${MYSQL_PORT:-3307}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

Data persists in the `mysql_data` volume across restarts.
`docker compose down -v` deletes it.

---

## 9. Local Development Workflow

```text
# 1. Start MySQL
cp .env.example .env
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev        # create tables
npx prisma db seed            # insert categories
npm run dev                   # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

### npm scripts

| App | Script | Purpose |
|-----|--------|---------|
| backend | `dev` | Run with hot reload (`tsx watch`) |
| backend | `build` / `start` | Compile to `dist/` and run |
| backend | `test` | Run Vitest + Supertest |
| backend | `lint` / `format` | ESLint / Prettier |
| backend | `db:migrate` / `db:deploy` / `db:seed` / `db:reset` / `db:studio` | Prisma helpers |
| frontend | `dev` / `build` / `start` | Next.js |
| frontend | `lint` / `format` | ESLint / Prettier |

---

## 10. Testing Strategy

| Level | Tooling | Scope |
|-------|---------|-------|
| Backend integration | Vitest + Supertest against `app.ts` | Every endpoint: success path, validation errors, auth required, ownership (user A cannot access user B's data) |
| Backend unit | Vitest | Pure helpers (serializers, date range logic) |
| Frontend | Optional for MVP | Manual testing against the running API |

Backend tests use a separate database, `finance_tracker_test`, in the same
MySQL container (override with `TEST_DATABASE_URL`). Before the run,
`tests/globalSetup.ts` creates it if needed and applies migrations. Each test
file calls `resetDatabase()` to clear tables and re-seed categories, and test
files run one at a time because they share the database.
