# Personal Finance & Expense Tracker

A full-stack web app for tracking personal income and expenses.

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, TanStack React Query, Axios
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** MySQL 8.4 in Docker

Specs live in [SPEC/](SPEC/): [product](SPEC/spec.md), [architecture](SPEC/architecture.md),
[database](SPEC/database.md), [API](SPEC/api.md).

## Prerequisites

- Node.js 22 or newer
- Docker with Docker Compose (your user must be able to run `docker ps` without `sudo`)

## Getting started

```bash
# 1. Start MySQL
cp .env.example .env
docker compose up -d
docker compose ps            # wait until mysql shows "healthy"

# 2. Backend  → http://localhost:5000
cd backend
cp .env.example .env
npm install
npm run db:migrate           # create tables
npm run db:seed              # insert predefined categories
npm run dev

# 3. Frontend → http://localhost:3000  (in a second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Check the API is up: `curl http://localhost:5000/api/health`

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| backend | `npm run dev` | API with hot reload |
| backend | `npm run build` / `npm start` | Compile to `dist/` and run |
| backend | `npm test` | Run tests (uses the `finance_tracker_test` database; MySQL must be running) |
| backend | `npm run db:migrate` | Create/apply migrations in development |
| backend | `npm run db:seed` | Insert predefined categories (safe to re-run) |
| backend | `npm run db:reset` | Drop and recreate the dev database, then seed |
| backend | `npm run db:studio` | Browse data in Prisma Studio |
| backend / frontend | `npm run lint` | ESLint |
| backend / frontend | `npm run typecheck` | TypeScript check |
| backend / frontend | `npm run format` | Prettier |
| frontend | `npm run dev` / `npm run build` | Next.js |

MySQL is published on **localhost:3307** (not 3306) so it doesn't clash with a MySQL
server installed directly on your machine.

## Stopping MySQL

```bash
docker compose down       # stop, keep data
docker compose down -v    # stop and delete all data
```

## Project status

Built in phases (see [SPEC/spec.md §8](SPEC/spec.md)).

- [x] Phase 0 — Repo setup
- [x] Phase 1 — Database schema and seed
- [x] Phase 2 — Backend auth
- [x] Phase 3 — Categories and transactions API
- [ ] Phase 4 — Dashboard API
- [ ] Phase 5 — Frontend foundation and auth pages
- [ ] Phase 6 — Transactions page
- [ ] Phase 7 — Dashboard page
- [ ] Phase 8 — Polish
