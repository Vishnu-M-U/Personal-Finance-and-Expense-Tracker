# Personal Finance & Expense Tracker — Database Specification

## 1. Database Overview

The application will use **MySQL** as its relational database.

MySQL will run inside a Docker container and will NOT need to be
installed directly on the developer's machine.

### Database

```text
Database Engine: MySQL 8.4
Database Name:   finance_tracker
Test Database:   finance_tracker_test
ORM:             Prisma 7 (MariaDB driver adapter)
Host port:       3307 (container port 3306)
Charset:         utf8mb4
Collation:       utf8mb4_unicode_ci (case-insensitive; set by Prisma migrations)
```

---

## 2. Entity Relationship Diagram

```text
+------------------+          +----------------------+          +------------------+
|      users       |          |     transactions     |          |    categories    |
+------------------+          +----------------------+          +------------------+
| id          PK   |1       * | id            PK     | *      1 | id          PK   |
| name             |----------| user_id       FK     |----------| name             |
| email    UNIQUE  |          | category_id   FK     |          | type             |
| password_hash    |          | type                 |          | created_at       |
| created_at       |          | amount               |          +------------------+
| updated_at       |          | date                 |
+------------------+          | description          |
                              | created_at           |
                              | updated_at           |
                              +----------------------+
```

- A **user** has many **transactions**.
- A **category** has many **transactions**.
- Each **transaction** belongs to exactly one user and one category.
- Categories are global (not owned by a user).

---

## 3. Tables

### 3.1 `users`

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT, auto-increment | No | — | Primary key |
| `name` | VARCHAR(100) | No | — | Display name |
| `email` | VARCHAR(255) | No | — | Unique. Stored trimmed and lowercased |
| `password_hash` | VARCHAR(255) | No | — | bcrypt hash. Never returned by the API |
| `created_at` | DATETIME(3) | No | `now()` | |
| `updated_at` | DATETIME(3) | No | auto | Updated by Prisma |

### 3.2 `categories`

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT, auto-increment | No | — | Primary key |
| `name` | VARCHAR(50) | No | — | e.g. "Groceries" |
| `type` | ENUM('INCOME','EXPENSE') | No | — | |
| `created_at` | DATETIME(3) | No | `now()` | |

Unique constraint on (`name`, `type`).

### 3.3 `transactions`

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT, auto-increment | No | — | Primary key |
| `user_id` | INT | No | — | FK → `users.id`, `ON DELETE CASCADE` |
| `category_id` | INT | No | — | FK → `categories.id`, `ON DELETE RESTRICT` |
| `type` | ENUM('INCOME','EXPENSE') | No | — | Must match the category's type |
| `amount` | DECIMAL(12,2) | No | — | Always > 0. Max 9,999,999,999.99 |
| `date` | DATE | No | — | Calendar date of the transaction |
| `description` | VARCHAR(255) | Yes | NULL | Optional |
| `created_at` | DATETIME(3) | No | `now()` | |
| `updated_at` | DATETIME(3) | No | auto | |

**Indexes**

| Index | Columns | Supports |
|-------|---------|----------|
| `idx_txn_user_date` | (`user_id`, `date`) | Default list order, date-range filters, dashboard totals |
| `idx_txn_user_category` | (`user_id`, `category_id`) | Category filter, category breakdown |
| `idx_txn_user_type` | (`user_id`, `type`) | Type filter |

---

## 4. Prisma Schema

`backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
}

enum TransactionType {
  INCOME
  EXPENSE
}

model User {
  id           Int           @id @default(autoincrement())
  name         String        @db.VarChar(100)
  email        String        @unique @db.VarChar(255)
  passwordHash String        @map("password_hash") @db.VarChar(255)
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  transactions Transaction[]

  @@map("users")
}

model Category {
  id           Int             @id @default(autoincrement())
  name         String          @db.VarChar(50)
  type         TransactionType
  createdAt    DateTime        @default(now()) @map("created_at")
  transactions Transaction[]

  @@unique([name, type])
  @@map("categories")
}

model Transaction {
  id          Int             @id @default(autoincrement())
  userId      Int             @map("user_id")
  categoryId  Int             @map("category_id")
  type        TransactionType
  amount      Decimal         @db.Decimal(12, 2)
  date        DateTime        @db.Date
  description String?         @db.VarChar(255)
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@index([userId, date], map: "idx_txn_user_date")
  @@index([userId, categoryId], map: "idx_txn_user_category")
  @@index([userId, type], map: "idx_txn_user_type")
  @@map("transactions")
}
```

### Prisma 7 setup notes

- The connection URL lives in `backend/prisma.config.ts` (read from
  `DATABASE_URL`), not in the schema. The config also sets the migrations
  folder and the seed command.
- The client is generated as TypeScript into `backend/src/generated/prisma/`
  (git-ignored, regenerated on `npm install`) and imported from
  `src/generated/prisma/client.js`.
- Prisma 7 connects through a driver adapter. MySQL uses
  `@prisma/adapter-mariadb`; the single client instance is created in
  `src/lib/prisma.ts`. The adapter accepts the `mysql://` URL as-is.
- `backend/package.json` overrides the adapter's `mariadb` driver to 3.5.4,
  because the pinned 3.4.5 has published security advisories. Remove the
  override once a Prisma release ships a patched driver.

**Naming convention:** Prisma models and fields use `camelCase` in code;
tables and columns use `snake_case` in MySQL via `@map` / `@@map`.

---

## 5. Seed Data

The category list and a `seedCategories()` function live in
`backend/prisma/categories.ts`; `backend/prisma/seed.ts` runs it (also reused
by the tests). It uses `upsert` on (`name`, `type`), so running the seed
multiple times is safe.

| type | name |
|------|------|
| INCOME | Salary |
| INCOME | Freelance |
| INCOME | Business |
| INCOME | Investments |
| INCOME | Gifts |
| INCOME | Other Income |
| EXPENSE | Food & Dining |
| EXPENSE | Groceries |
| EXPENSE | Transportation |
| EXPENSE | Rent & Housing |
| EXPENSE | Utilities |
| EXPENSE | Healthcare |
| EXPENSE | Entertainment |
| EXPENSE | Shopping |
| EXPENSE | Education |
| EXPENSE | Travel |
| EXPENSE | Bills & Subscriptions |
| EXPENSE | Other Expense |

No users or transactions are seeded by default. An optional
`seed:demo` script may create a demo user with sample transactions for
local development.

---

## 6. Data Rules

These rules are enforced in the service layer (and validated with Zod
before reaching it):

| Rule | Where enforced |
|------|----------------|
| `email` is trimmed and lowercased before insert/lookup | Auth service |
| `amount` > 0, ≤ 9,999,999,999.99, max 2 decimals | Zod schema |
| `transaction.type` must equal `category.type` | Transaction service (checked on create and update) |
| `category_id` must reference an existing category | Transaction service → `400 VALIDATION_ERROR` |
| A user can only read/modify rows where `user_id` = their id | Every transaction query includes `userId` in `WHERE` |
| Transaction `date` is stored as a DATE (no time, no timezone) | Prisma `@db.Date`; API uses `YYYY-MM-DD` |

### Money handling

- Prisma returns `DECIMAL` columns as `Prisma.Decimal` objects.
- Sums (dashboard totals) are computed in the database with `aggregate` /
  `groupBy` and returned as `Decimal`.
- The API serializes all amounts as strings with 2 decimals, e.g. `"1250.50"`.
- The frontend never does arithmetic on amounts for storage; it only formats
  them for display.

### Date handling

- The API accepts and returns dates as `YYYY-MM-DD` strings.
- When converting to a JavaScript `Date` for Prisma, use UTC midnight
  (`new Date("2026-09-26T00:00:00.000Z")`) to avoid timezone shifts.
- Date-range filters are inclusive on both ends.

---

## 7. Migrations

| Command | When |
|---------|------|
| `npx prisma migrate dev --name <name>` | During development, after changing `schema.prisma` |
| `npx prisma migrate deploy` | In test/production environments |
| `npx prisma migrate reset` | Wipe and recreate the dev database (runs seed) |
| `npx prisma db seed` | Insert/refresh categories |
| `npx prisma studio` | Browse data in a GUI |

Migration files in `prisma/migrations/` are committed to git.
