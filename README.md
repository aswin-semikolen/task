# Users Management Module

A full-stack Users Management application with JWT authentication, complete CRUD, and a user report.

**Stack:** React 19 + Vite + TypeScript · NestJS 11 + TypeScript · SQLite + TypeORM

---

## Quick start

Two terminals, no database server, no migrations.

```bash
# Terminal 1 — backend (http://localhost:3000/api)
cd backend
npm install
npm run seed        # creates data.sqlite with an admin + 15 sample users
npm run start:dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and sign in:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@123` |

The 15 sample users share the password `Password@123`.

> The seed is idempotent — it skips if the table already has rows. To reset, delete `backend/data.sqlite` and run `npm run seed` again.

---

## Features

**Authentication**
- `POST /auth/login` with bcrypt password verification and a signed JWT
- Global `JwtAuthGuard` — every route is protected unless marked `@Public()`
- Protected frontend routes, session restore on refresh, logout
- Inactive accounts are refused at login

**Users CRUD** — all required fields: first name, last name, email, password, phone number, date of birth, gender, address, city, country, status, created date, updated date
- Paginated list with debounced search (name / email) and status filter
- Create, edit and delete through a single modal form
- Unique email enforced at both the DB and API level

**User Report**
- Headline cards: total, active, inactive, new in the last 30 days
- Gender distribution bars
- Filterable detail table (status / gender) with a match count

---

## API

Base URL `http://localhost:3000/api`. All routes except `POST /auth/login` require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` → `{ access_token, user }` |
| `GET` | `/auth/me` | Current user — used to restore the session after a refresh |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/users` | Create a user. `409` if the email is taken |
| `GET` | `/users` | List. Query: `search`, `status`, `gender`, `page`, `limit` |
| `GET` | `/users/:id` | Single user. `404` if not found |
| `PATCH` | `/users/:id` | Partial update. Password re-hashed only when supplied |
| `DELETE` | `/users/:id` | Delete. `204` on success |

`GET /users` returns `{ data, total, page, limit, totalPages }`.

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/users/summary` | `{ total, active, inactive, newLast30Days, byGender }` |
| `GET` | `/reports/users` | Filtered detail rows. Query: `search`, `status`, `gender` |

---

## Database schema

Single `users` table, created automatically from the entity via `synchronize: true`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `first_name` | varchar(50) | |
| `last_name` | varchar(50) | |
| `email` | varchar(255) | Unique, indexed |
| `password` | varchar(255) | bcrypt hash, `select: false` |
| `phone_number` | varchar(20) | |
| `date_of_birth` | date | |
| `gender` | enum | `male` / `female` / `other` |
| `address` | varchar(255) | |
| `city` | varchar(100) | |
| `country` | varchar(100) | |
| `status` | enum | `active` / `inactive`, indexed, default `active` |
| `created_at` | timestamp | Set on insert |
| `updated_at` | timestamp | Updated on every save |

---

## Project structure

```
backend/
  src/
    main.ts                  bootstrap: helmet, CORS, ValidationPipe, /api prefix
    app.module.ts            TypeORM + feature modules + global guard
    common/                  enums, decorators, custom validator, exception filter
    auth/                    login, JWT signing, JwtAuthGuard
    users/                   entity, DTOs, service, controller
    reports/                 summary + filtered list
    seed.ts                  admin + 15 sample users

frontend/
  src/
    api/client.ts            axios instance, bearer interceptor, 401 handling
    auth/                    AuthContext, ProtectedRoute
    pages/                   LoginPage, UsersPage, ReportPage
    components/              Layout, UserTable, UserFormModal, ConfirmDialog, StatCard
    index.css                single stylesheet
```

---

## Validation & security

**Validation** — `class-validator` DTOs behind a global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`:

- Valid email format, plus a unique constraint enforced at the database
- Password: minimum 8 characters, must contain uppercase, lowercase and a digit
- Date of birth must be a real date and cannot be in the future
- Gender and status restricted to their enum values
- Length caps on every text field, `ParseUUIDPipe` on route params

**Security**

- Passwords hashed with bcrypt (cost 10); plaintext is never stored or returned
- The password column is `select: false`, so it cannot leak through a response
- Every route protected by default — a route is only reachable without a token if explicitly marked `@Public()`, so an omitted decorator fails closed
- `forbidNonWhitelisted` rejects mass-assignment attempts (e.g. posting an extra `isAdmin` field)
- Login returns the same message for an unknown email and a wrong password, so accounts cannot be enumerated
- `helmet` security headers, CORS restricted to the frontend origin
- Parameterized TypeORM queries throughout

---

## Configuration

`backend/.env` ships with working defaults:

```
PORT=3000
JWT_SECRET=assessment_dev_secret_change_in_production
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

---

## Notes and trade-offs

Decisions made deliberately for the scope of this assessment:

- **SQLite with `synchronize: true`** keeps setup to zero — no database server, no migrations. Moving to PostgreSQL is a change to the `TypeOrmModule.forRoot` block in `app.module.ts`; `synchronize` should be turned off and replaced with migrations for production.
- **The JWT is stored in `localStorage`**, which is readable by any XSS on the page. An httpOnly cookie is the production choice; `localStorage` was the pragmatic call given no refresh-token flow is in scope.
- **No roles or permissions.** Any authenticated user can manage any user. Role-based access was explicitly out of scope.
- **`JWT_SECRET` is committed** so the project runs on clone. It must be replaced with a real secret outside of an assessment.
- Registration, refresh tokens, forgot-password and CSV export were out of scope and are not implemented.

---

## Verified flow

Both apps build clean (`tsc --noEmit` on the backend, `tsc -b && vite build` on the frontend). The following was exercised end-to-end against the running stack:

login → session restore → users list → search + status filter → create → edit → report (cards, gender split, filters) → delete → logout

Error paths confirmed: unauthenticated requests `401`, invalid token `401`, inactive account login `401`, duplicate email `409`, weak password `400`, future date of birth `400`, unknown field `400`, malformed UUID `400`, missing user `404`.
