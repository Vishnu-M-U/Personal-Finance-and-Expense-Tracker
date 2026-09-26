# Personal Finance & Expense Tracker

A full-stack web app for tracking personal income and expenses: register, log in,
record transactions, filter and sort them, and see a dashboard of totals and
spending by category.

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, TanStack React Query, Axios, React Hook Form + Zod
- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, Zod
- **Database:** MySQL 8.4 in Docker
- **Auth:** JWT in an httpOnly cookie, bcrypt password hashing

Specs live in [SPEC/](SPEC/): [product](SPEC/spec.md), [architecture](SPEC/architecture.md),
[database](SPEC/database.md), [API](SPEC/api.md).

## Features

- Register, log in, log out; sessions last 1 day
- Dashboard for this month, last month, last 3 months, this year, or a custom range:
  income, expenses, net balance, spending and income by category, recent transactions
- Transactions: add, edit, delete (with confirmation)
- Filter by type, category, date range and description search; sort by date or amount;
  pagination; filters are kept in the URL
- Investments: track holdings (mutual funds, stocks, gold, FDs and more) with the amount
  invested and a current value you update; see total returns, allocation by type and each
  holding's gain or loss
- 18 predefined income and expense categories
- Works on desktop and mobile

## Prerequisites

- Node.js 22 or newer
- Docker with Docker Compose — your user must be able to run `docker ps` without `sudo`
  (see [Troubleshooting](#troubleshooting))

## Getting started

```bash
# 1. Start MySQL (published on localhost:3307)
cp .env.example .env
docker compose up -d
docker compose ps              # wait until mysql shows "healthy"

# 2. Backend  → http://localhost:5000
cd backend
cp .env.example .env           # then set JWT_SECRET to a long random string
npm install
npm run db:migrate             # create tables
npm run db:seed                # insert predefined categories
npm run db:seed:demo           # optional: demo user with sample data
npm run dev

# 3. Frontend → http://localhost:3000  (in a second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and register, or log in with the demo account:

| Email | Password |
|-------|----------|
| `demo@example.com` | `password123` |

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Configuration

| File | Variable | Default | Purpose |
|------|----------|---------|---------|
| `.env` | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | see `.env.example` | MySQL container |
| `.env` | `MYSQL_PORT` | `3307` | Host port for MySQL (3307 avoids clashing with a MySQL installed on the host) |
| `backend/.env` | `DATABASE_URL` | `mysql://root:rootpassword@localhost:3307/finance_tracker` | Prisma connection |
| `backend/.env` | `JWT_SECRET` | — | Token signing secret, at least 32 characters |
| `backend/.env` | `JWT_EXPIRES_IN` | `1d` | Session length |
| `backend/.env` | `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin allowed to call the API |
| `backend/.env` | `PORT` | `5000` | API port |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | API base URL |
| `frontend/.env.local` | `NEXT_PUBLIC_CURRENCY` | `INR` | Currency code used for display |

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| backend | `npm run dev` | API with hot reload |
| backend | `npm run build` / `npm start` | Compile to `dist/` and run |
| backend | `npm test` | Integration tests (uses the `finance_tracker_test` database; MySQL must be running) |
| backend | `npm run db:migrate` | Create/apply migrations in development |
| backend | `npm run db:seed` | Insert predefined categories (safe to re-run) |
| backend | `npm run db:seed:demo` | Create/reset the demo user with sample transactions and investments |
| backend | `npm run db:reset` | Drop and recreate the dev database, then seed categories |
| backend | `npm run db:studio` | Browse data in Prisma Studio |
| frontend | `npm run dev` / `npm run build` / `npm start` | Next.js |
| both | `npm run lint` / `npm run typecheck` / `npm run format` | ESLint / TypeScript / Prettier |

## Project structure

```text
├── SPEC/            product, architecture, database and API specs
├── backend/         Express API — src/modules/{auth,categories,transactions,dashboard,investments}
│   ├── prisma/      schema, migrations, seeds
│   └── tests/       Vitest + Supertest integration tests
├── frontend/        Next.js app — src/app/(auth), src/app/(app), components, hooks
└── docker-compose.yml
```

See [SPEC/architecture.md](SPEC/architecture.md) for the full layout and design.

## Stopping MySQL

```bash
docker compose down       # stop, keep data
docker compose down -v    # stop and delete all data
```

## Troubleshooting

**`permission denied ... /var/run/docker.sock`** — your user can't reach Docker.

```bash
sudo groupadd docker 2>/dev/null; sudo usermod -aG docker $USER
# Docker installed as a snap: restart it fully so the socket gets the docker group
sudo snap disable docker && sudo snap enable docker
```

Then log out and back in. `ls -l /var/run/docker.sock` should show `root docker`.

**`address already in use` on port 3307** — change `MYSQL_PORT` in `.env` and the port in
`backend/.env`'s `DATABASE_URL` to match.

**Backend exits with "Invalid environment variables"** — `backend/.env` is missing or
`JWT_SECRET` is shorter than 32 characters.

## Project status

MVP complete. Built in phases (see [SPEC/spec.md §8](SPEC/spec.md)).

- [x] Phase 0 — Repo setup
- [x] Phase 1 — Database schema and seed
- [x] Phase 2 — Backend auth
- [x] Phase 3 — Categories and transactions API
- [x] Phase 4 — Dashboard API
- [x] Phase 5 — Frontend foundation and auth pages
- [x] Phase 6 — Transactions page
- [x] Phase 7 — Dashboard page
- [x] Phase 8 — Polish
