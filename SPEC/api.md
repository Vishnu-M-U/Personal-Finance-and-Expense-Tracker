# Personal Finance & Expense Tracker — API Specification

## 1. API Overview

The backend exposes a REST API consumed by the Next.js frontend.

### Development Backend

```text
http://localhost:5000
```

### Base Path

All endpoints are prefixed with `/api`:

```text
http://localhost:5000/api
```

### Conventions

| Topic | Convention |
|-------|------------|
| Format | JSON request and response bodies (`Content-Type: application/json`) |
| Auth | JWT in an httpOnly cookie named `access_token`, set by login/register. Clients must send requests with credentials (`withCredentials: true` in Axios). |
| Naming | `camelCase` JSON fields |
| IDs | Positive integers |
| Amounts | **Strings** with 2 decimals in responses (`"1250.50"`). Requests accept a number or a numeric string. |
| Dates | `YYYY-MM-DD` strings for transaction dates; ISO 8601 UTC timestamps for `createdAt` / `updatedAt` |
| Enums | `type` is `"INCOME"` or `"EXPENSE"` |
| Unknown fields | Ignored (stripped) in request bodies |

---

## 2. Response Format

### Success — single resource

```json
{
  "data": { "id": 1, "...": "..." }
}
```

### Success — list with pagination

```json
{
  "data": [ { "id": 1 }, { "id": 2 } ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 57,
    "totalPages": 3
  }
}
```

### Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "amount", "message": "Amount must be greater than 0" }
    ]
  }
}
```

`details` is only present for validation errors.

### Error Codes

| HTTP | `code` | When |
|------|--------|------|
| 400 | `VALIDATION_ERROR` | Body, query, or params fail validation; category/type mismatch; unknown category |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired token |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password on login |
| 404 | `NOT_FOUND` | Resource does not exist **or belongs to another user** |
| 409 | `EMAIL_TAKEN` | Register with an email already in use |
| 429 | `RATE_LIMITED` | Too many login or register requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## 3. Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account and log in |
| POST | `/api/auth/login` | No | Log in |
| POST | `/api/auth/logout` | No | Log out (clears cookie) |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/categories` | Yes | List predefined categories |
| GET | `/api/transactions` | Yes | List transactions (filter, sort, paginate) |
| GET | `/api/transactions/:id` | Yes | Get one transaction |
| POST | `/api/transactions` | Yes | Create a transaction |
| PATCH | `/api/transactions/:id` | Yes | Update a transaction (partial) |
| DELETE | `/api/transactions/:id` | Yes | Delete a transaction |
| GET | `/api/dashboard/summary` | Yes | Dashboard data for a date range |

---

## 4. Shared Objects

### User

```json
{
  "id": 1,
  "name": "Alex Doe",
  "email": "alex@example.com",
  "createdAt": "2026-09-26T10:15:00.000Z"
}
```

`passwordHash` is never returned.

### Category

```json
{
  "id": 8,
  "name": "Groceries",
  "type": "EXPENSE"
}
```

### Transaction

```json
{
  "id": 42,
  "type": "EXPENSE",
  "amount": "1250.50",
  "date": "2026-09-20",
  "description": "Weekly groceries",
  "category": {
    "id": 8,
    "name": "Groceries",
    "type": "EXPENSE"
  },
  "createdAt": "2026-09-20T18:30:00.000Z",
  "updatedAt": "2026-09-20T18:30:00.000Z"
}
```

`description` may be `null`.

---

## 5. Health

### `GET /api/health`

**Response `200`**

```json
{ "data": { "status": "ok" } }
```

---

## 6. Auth

`POST /register` and `POST /login` are rate-limited to 20 requests per 15 minutes per IP (together). `/me` and `/logout` are not limited, because `/me` runs on every page load.

### `POST /api/auth/register`

**Request body**

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | Required, trimmed, 1–100 chars |
| `email` | string | Required, valid email, max 255 chars, trimmed + lowercased |
| `password` | string | Required, 8–72 chars |

```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "password": "supersecret123"
}
```

**Response `201`** — sets the `access_token` cookie

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Alex Doe",
      "email": "alex@example.com",
      "createdAt": "2026-09-26T10:15:00.000Z"
    }
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`, `429 RATE_LIMITED`

---

### `POST /api/auth/login`

**Request body**

| Field | Type | Rules |
|-------|------|-------|
| `email` | string | Required |
| `password` | string | Required |

**Response `200`** — sets the `access_token` cookie

```json
{
  "data": {
    "user": { "id": 1, "name": "Alex Doe", "email": "alex@example.com", "createdAt": "2026-09-26T10:15:00.000Z" }
  }
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`

---

### `POST /api/auth/logout`

Clears the `access_token` cookie. Succeeds even if the user is not logged in.

**Response `204`** — no body

---

### `GET /api/auth/me`

**Response `200`**

```json
{
  "data": {
    "user": { "id": 1, "name": "Alex Doe", "email": "alex@example.com", "createdAt": "2026-09-26T10:15:00.000Z" }
  }
}
```

**Errors:** `401 UNAUTHORIZED`

---

## 7. Categories

### `GET /api/categories`

**Query parameters**

| Param | Type | Rules |
|-------|------|-------|
| `type` | `INCOME` \| `EXPENSE` | Optional. Filter by type |

**Response `200`** — sorted by `type`, then `name`. Not paginated.

```json
{
  "data": [
    { "id": 1, "name": "Salary", "type": "INCOME" },
    { "id": 8, "name": "Groceries", "type": "EXPENSE" }
  ]
}
```

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

---

## 8. Transactions

All transaction endpoints only operate on the authenticated user's
transactions. Requesting another user's transaction returns `404 NOT_FOUND`.

### `GET /api/transactions`

**Query parameters** (all optional)

| Param | Type | Default | Rules |
|-------|------|---------|-------|
| `type` | `INCOME` \| `EXPENSE` | — | Filter by type |
| `categoryId` | integer | — | Filter by category |
| `startDate` | `YYYY-MM-DD` | — | Inclusive |
| `endDate` | `YYYY-MM-DD` | — | Inclusive. Must be ≥ `startDate` if both given |
| `search` | string | — | Max 100 chars. Case-insensitive partial match on `description` |
| `sortBy` | `date` \| `amount` \| `createdAt` | `date` | |
| `sortOrder` | `asc` \| `desc` | `desc` | Ties broken by `id desc` |
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–100 | `20` | |

**Example**

```text
GET /api/transactions?type=EXPENSE&startDate=2026-09-01&endDate=2026-09-30&sortBy=amount&page=1
```

**Response `200`**

```json
{
  "data": [
    {
      "id": 42,
      "type": "EXPENSE",
      "amount": "1250.50",
      "date": "2026-09-20",
      "description": "Weekly groceries",
      "category": { "id": 8, "name": "Groceries", "type": "EXPENSE" },
      "createdAt": "2026-09-20T18:30:00.000Z",
      "updatedAt": "2026-09-20T18:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

A page beyond `totalPages` returns an empty `data` array (not an error).

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

---

### `GET /api/transactions/:id`

**Response `200`** — `{ "data": Transaction }`

**Errors:** `400 VALIDATION_ERROR` (non-integer id), `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

### `POST /api/transactions`

**Request body**

| Field | Type | Rules |
|-------|------|-------|
| `type` | `INCOME` \| `EXPENSE` | Required |
| `amount` | number \| string | Required. > 0, ≤ 9999999999.99, max 2 decimal places |
| `date` | string | Required. Valid `YYYY-MM-DD` date |
| `categoryId` | integer | Required. Must exist and have the same `type` |
| `description` | string \| null | Optional. Trimmed, max 255 chars. Empty string stored as `null` |

```json
{
  "type": "EXPENSE",
  "amount": 1250.5,
  "date": "2026-09-20",
  "categoryId": 8,
  "description": "Weekly groceries"
}
```

**Response `201`** — `{ "data": Transaction }`

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

Example category mismatch error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "categoryId", "message": "Category does not match transaction type" }
    ]
  }
}
```

---

### `PATCH /api/transactions/:id`

Partial update. Any subset of the `POST` fields may be sent; at least one
field is required. The `type` / `categoryId` match is checked against the
**resulting** transaction (e.g. changing `type` alone to `INCOME` fails if
the current category is an expense category — send both fields together).

**Request body example**

```json
{
  "amount": "1300.00",
  "description": "Weekly groceries + snacks"
}
```

**Response `200`** — `{ "data": Transaction }`

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

### `DELETE /api/transactions/:id`

Permanently deletes the transaction.

**Response `204`** — no body

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

## 9. Dashboard

### `GET /api/dashboard/summary`

**Query parameters**

| Param | Type | Default | Rules |
|-------|------|---------|-------|
| `startDate` | `YYYY-MM-DD` | First day of the current month | Inclusive |
| `endDate` | `YYYY-MM-DD` | Last day of the current month | Inclusive. Must be ≥ `startDate` |

"Current month" is based on the server's date. The frontend normally
sends both dates explicitly, calculated in the user's local timezone.

**Response `200`**

```json
{
  "data": {
    "period": {
      "startDate": "2026-09-01",
      "endDate": "2026-09-30"
    },
    "totals": {
      "income": "85000.00",
      "expense": "42350.75",
      "balance": "42649.25"
    },
    "expenseByCategory": [
      { "categoryId": 11, "name": "Rent & Housing", "total": "20000.00", "percentage": 47.22 },
      { "categoryId": 8,  "name": "Groceries",      "total": "8350.75",  "percentage": 19.72 }
    ],
    "incomeByCategory": [
      { "categoryId": 1, "name": "Salary", "total": "85000.00", "percentage": 100 }
    ],
    "recentTransactions": [
      {
        "id": 42,
        "type": "EXPENSE",
        "amount": "1250.50",
        "date": "2026-09-20",
        "description": "Weekly groceries",
        "category": { "id": 8, "name": "Groceries", "type": "EXPENSE" },
        "createdAt": "2026-09-20T18:30:00.000Z",
        "updatedAt": "2026-09-20T18:30:00.000Z"
      }
    ]
  }
}
```

**Field rules**

| Field | Rule |
|-------|------|
| `totals.balance` | `income − expense`; may be negative (e.g. `"-1200.00"`) |
| `*ByCategory` | Only categories with at least one transaction in the period; sorted by `total` desc |
| `percentage` | Share of that type's total, rounded to 2 decimals (number, not string) |
| `recentTransactions` | Up to 5 transactions in the period, sorted by `date desc`, then `id desc` |
| Empty period | Totals are `"0.00"`, arrays are empty |

**Errors:** `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`

---

## 10. CORS

| Setting | Value |
|---------|-------|
| Allowed origin | `CORS_ORIGIN` env var (dev: `http://localhost:3000`) |
| Credentials | `true` |
| Methods | `GET, POST, PATCH, DELETE, OPTIONS` |
| Allowed headers | `Content-Type` |
