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
| backend | `npm test` | Run tests |
| backend / frontend | `npm run lint` | ESLint |
| backend / frontend | `npm run typecheck` | TypeScript check |
| backend / frontend | `npm run format` | Prettier |
| frontend | `npm run dev` / `npm run build` | Next.js |

## Stopping MySQL

```bash
docker compose down       # stop, keep data
docker compose down -v    # stop and delete all data
```

## Project status

Built in phases (see [SPEC/spec.md §8](SPEC/spec.md)).

- [x] Phase 0 — Repo setup
- [ ] Phase 1 — Database schema and seed
- [ ] Phase 2 — Backend auth
- [ ] Phase 3 — Categories and transactions API
- [ ] Phase 4 — Dashboard API
- [ ] Phase 5 — Frontend foundation and auth pages
- [ ] Phase 6 — Transactions page
- [ ] Phase 7 — Dashboard page
- [ ] Phase 8 — Polish
