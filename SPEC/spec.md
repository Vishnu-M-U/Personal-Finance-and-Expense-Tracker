# Personal Finance & Expense Tracker — Product Specification

## 1. Overview

Personal Finance & Expense Tracker is a full-stack web application for
managing personal income and expenses.

The project is intentionally being developed as a small MVP first. The
purpose is both to build a useful application and to understand the
complete full-stack development lifecycle.

Related documents:

- [architecture.md](architecture.md) — system design, folder layout, auth flow
- [database.md](database.md) — data model and Prisma schema
- [api.md](api.md) — REST endpoints, request/response contracts

---

## 2. MVP Goals

The MVP should allow an authenticated user to:

- Register and log in
- View a financial dashboard
- Create income and expense transactions
- View transactions
- Edit transactions
- Delete transactions
- Filter transactions
- Use predefined categories

### Out of Scope (MVP)

The following are explicitly **not** part of the MVP and may be considered later:

- Custom (user-created) categories
- Budgets and budget alerts
- Recurring transactions
- Multiple accounts / wallets
- Multiple currencies and currency conversion
- CSV import / export
- Receipt uploads / attachments
- Password reset, email verification, OAuth / social login
- Refresh tokens and "remember me"
- Admin panel or multi-user sharing
- Mobile app

---

## 3. Functional Requirements

### 3.1 Authentication

| ID | Requirement |
|----|-------------|
| AUTH-1 | A visitor can register with **name**, **email**, and **password**. |
| AUTH-2 | Email must be unique (case-insensitive). Registering with an existing email shows an error. |
| AUTH-3 | Password must be 8–72 characters. |
| AUTH-4 | After successful registration the user is logged in automatically and redirected to the dashboard. |
| AUTH-5 | A registered user can log in with email and password. |
| AUTH-6 | Invalid credentials show a generic "Invalid email or password" message (no hint about which field was wrong). |
| AUTH-7 | A logged-in user can log out from any page. |
| AUTH-8 | Unauthenticated users visiting protected pages are redirected to `/login`. |
| AUTH-9 | Logged-in users visiting `/login` or `/register` are redirected to `/dashboard`. |
| AUTH-10 | The session expires after 1 day; the user must log in again. |

### 3.2 Dashboard

| ID | Requirement |
|----|-------------|
| DASH-1 | The dashboard shows data for a selected period. Default period: **current calendar month**. |
| DASH-2 | The user can change the period using presets (This month, Last month, Last 3 months, This year) or a custom date range. |
| DASH-3 | Summary cards show **Total Income**, **Total Expenses**, and **Net Balance** (income − expenses) for the period. |
| DASH-4 | **Expenses by category** is a donut chart for the period, largest first, with the total spent in the middle and a legend giving each category's amount and percentage. The five largest categories get their own colour (a fixed, colour-blind-checked order with no green or red); any others fold into one gray "N more categories" slice. **Income by category** is a summary card instead of a chart (usually only one or two sources): total income, then each category with its amount and share. |
| DASH-5 | A list shows the **5 most recent transactions** in the period, with a link to the full transactions page. |
| DASH-6 | When there is no data for the period, an empty state is shown with a call-to-action to add a transaction. |

### 3.3 Transactions

| ID | Requirement |
|----|-------------|
| TXN-1 | A user can create a transaction with: **type** (Income / Expense), **amount**, **date**, **category**, and optional **description**. |
| TXN-2 | Amount must be greater than 0, with at most 2 decimal places. Amounts are always stored as positive numbers; the type determines whether it is income or expense. |
| TXN-3 | The category list in the form only shows categories matching the selected type. |
| TXN-4 | Date defaults to today. Future dates are allowed. |
| TXN-5 | Description is optional, max 255 characters. |
| TXN-6 | The transactions page lists the user's transactions in a table: date, description, category, type, amount. |
| TXN-7 | Default sort is by date, newest first. The user can sort by date or amount (asc/desc). |
| TXN-8 | The list is paginated (20 per page by default). |
| TXN-9 | A user can edit any of their transactions. |
| TXN-10 | A user can delete a transaction after confirming in a dialog. Deletion is permanent. |
| TXN-11 | A user can only see, edit, and delete **their own** transactions. |
| TXN-12 | Income amounts are displayed in green with a `+`; expense amounts in red with a `−`. |

### 3.4 Filtering

| ID | Requirement |
|----|-------------|
| FLT-1 | Filter by **type** (All / Income / Expense). |
| FLT-2 | Filter by **category** (one category at a time). |
| FLT-3 | Filter by **date range** (start date and/or end date, inclusive). |
| FLT-4 | Filter by **text search** on description (case-insensitive, partial match). |
| FLT-5 | Filters can be combined. |
| FLT-6 | Active filters are reflected in the URL query string so the page can be refreshed or shared without losing them. |
| FLT-7 | A "Clear filters" action resets all filters. |
| FLT-8 | Changing a filter resets pagination to page 1. |

### 3.5 Categories

| ID | Requirement |
|----|-------------|
| CAT-1 | Categories are predefined, global (shared by all users), and seeded into the database. |
| CAT-2 | Each category belongs to exactly one type: Income or Expense. |
| CAT-3 | Users cannot create, edit, or delete categories in the MVP. |

**Predefined categories**

| Income | Expense |
|--------|---------|
| Salary | Food & Dining |
| Freelance | Groceries |
| Business | Transportation |
| Investments | Rent & Housing |
| Gifts | Utilities |
| Other Income | Healthcare |
| | Entertainment |
| | Shopping |
| | Education |
| | Travel |
| | Bills & Subscriptions |
| | Other Expense |

---

## 4. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Security | Passwords hashed with bcrypt (cost factor 12). JWT stored in an httpOnly cookie. All transaction queries scoped to the authenticated user. Input validated on the server for every request. |
| Money accuracy | Amounts stored as `DECIMAL(12,2)` — never floating point. Amounts are sent over the API as strings. |
| Currency | Single currency, display-only, configured via environment variable (default `INR`). |
| Dates | Transaction dates are calendar dates (`YYYY-MM-DD`) with no time or timezone. |
| Responsiveness | Usable on desktop and mobile browser widths (≥ 360px). |
| Usability | Loading, empty, and error states for every data view. Form fields show inline validation errors. |
| Code quality | TypeScript strict mode in both apps. ESLint + Prettier. |
| Testing | Backend integration tests for auth and transaction endpoints. |
| Local setup | A new developer can run the app with Docker + Node.js by following the README. |

---

## 5. Technology Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- TanStack React Query
- Axios
- *Proposed:* React Hook Form + Zod (forms and validation)

### Backend

- Node.js (current LTS)
- Express.js
- TypeScript
- Prisma ORM
- *Proposed:* Zod (request validation)
- *Proposed:* helmet, cors, cookie-parser, express-rate-limit

### Database

- MySQL (8.4 LTS)
- MySQL runs inside Docker
- MySQL does not need to be installed directly on the host machine

### Authentication

- JWT (in an httpOnly cookie)
- bcrypt

### Infrastructure

- Docker
- Docker Compose

### Tooling

- ESLint + Prettier
- Vitest + Supertest (backend tests)

Exact package versions are pinned when the projects are scaffolded.

---

## 6. Project Structure

```text
Personal-Finance-and-Expense-Tracker/
├── SPEC/
│   ├── spec.md
│   ├── architecture.md
│   ├── database.md
│   └── api.md
│
├── frontend/            # Next.js app (see architecture.md §4)
├── backend/             # Express API (see architecture.md §3)
│
├── docker-compose.yml   # MySQL service
├── .env.example         # Docker Compose variables
├── .gitignore
└── README.md
```

`backend/.env.example` and `frontend/.env.example` hold app-specific
variables (see [architecture.md](architecture.md) §7).

---

## 7. Pages

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Redirects to `/dashboard` if logged in, otherwise `/login` |
| `/login` | Guest only | Login form |
| `/register` | Guest only | Registration form |
| `/dashboard` | Authenticated | Period selector, summary cards, expense donut, income summary, recent transactions, add transaction |
| `/transactions` | Authenticated | Filterable, sortable, paginated table; create/edit in a modal; delete with confirmation |

---

## 8. Milestones

| Phase | Deliverable |
|-------|-------------|
| 0 | Repo setup: `docker-compose.yml`, MySQL running, backend and frontend scaffolds, lint/format configs, README skeleton |
| 1 | Prisma schema, first migration, category seed |
| 2 | Backend auth: register, login, logout, me, auth middleware + tests |
| 3 | Backend categories + transactions CRUD with filtering, sorting, pagination + tests |
| 4 | Backend dashboard summary endpoint + tests |
| 5 | Frontend foundation: providers, Axios client, auth pages, route protection, app layout |
| 6 | Frontend transactions page: table, filters, create/edit modal, delete |
| 7 | Frontend dashboard: period selector, summary cards, category bars, recent list |
| 8 | Polish: empty/error states, responsive pass, README completed |

---

## 9. Decisions & Open Questions

Defaults chosen while drafting this spec. Each can be changed before coding starts.

| # | Topic | Default chosen | Alternative |
|---|-------|----------------|-------------|
| D1 | JWT storage | httpOnly cookie | `localStorage` + `Authorization` header (simpler, but exposed to XSS) |
| D2 | Session length | 1 day, no refresh token | Access + refresh token pair |
| D3 | Next.js router | App Router | Pages Router |
| D4 | Categories | Global, seeded, read-only | Per-user custom categories |
| D5 | Delete | Hard delete | Soft delete (`deletedAt`) |
| D6 | Currency | Single, display-only, default `INR` | Other default / per-user setting |
| D7 | Docker scope | Only MySQL in Docker; apps run with `npm run dev` | Dockerize frontend and backend too |
| D8 | IDs | Auto-increment integers | UUID / CUID strings |
| D9 | Dashboard chart | Expenses by category as an SVG donut (plain SVG — no chart library); income by category as a summary list | Also monthly income vs expense trend |
| D10 | Frontend tests | Optional for MVP | Required (Vitest + Testing Library) |
