# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.
Read this file completely before starting any task.

---

## Project Overview

**Finance Pro** — Full-stack personal finance SaaS.
- **Frontend:** Next.js 15 (App Router, Turbopack, Tailwind CSS 4, Radix UI)
- **Backend:** AWS Lambda + Serverless Framework, Clean Architecture, MongoDB/Mongoose
- **Language:** TypeScript throughout

---

## Skills

Before working on specific domains, always read the relevant skill file:

| Task | Skill file |
|---|---|
| Any UI component, page, or layout | `.agents/skills/frontend-design/SKILL.md` |
| Any React component, hook, or context | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Any test — unit, integration, or component | `.agents/skills/javascript-testing-patterns/SKILLS.md` |

> Read the skill file **before writing any code** for that domain. Do not skip this step.

---

## Development Commands

### Running the Application
```bash
# Backend (port 3001)
npm run dev               # from root
cd backend && npm run dev

# Frontend (port 3000)
npm start                 # from root
cd frontend && npm run dev
```

### Backend
```bash
cd backend
npm run build             # Compile TypeScript
npm run dev               # Serverless offline
npm test                  # Run tests
npm run lint              # ESLint
npm run deploy            # Deploy to AWS dev
npm run deploy:prod       # Deploy to AWS production
```

### Frontend
```bash
cd frontend
npm run dev               # Next.js dev with Turbopack
npm run build             # Production build
npm start                 # Production server
npm run lint              # Biome linting
npm run format            # Biome formatting
```

---

## Architecture

### Backend: Clean Architecture

Dependencies flow strictly inward. Never break this rule.

```
Interface (Lambda handlers)
    └── Application (DTOs, validators)
        └── Domain (entities, use cases, repository interfaces)  ← no external deps
Infrastructure (MongoDB, HTTP) implements Domain interfaces
```

**Layer responsibilities:**

- **Domain** (`@domain/*`) — pure business logic, zero frameworks. Entities, use case interfaces, repository contracts.
- **Application** (`@application/*`) — DTOs, Zod validation schemas.
- **Infrastructure** (`@infrastructure/*`) — Mongoose models, repository implementations, HTTP helpers, DB connection.
- **Interface** (`@interface/lambda/*`) — Lambda handlers. Must be thin: validate → call use case → return response.
- **Shared** (`@shared/*`) — constants (categories), config (env), cross-cutting types.

**Path aliases** are defined in `tsconfig.json` and resolved via `bootstrap.ts` using `module-alias`.
`bootstrap.ts` **must be the first import** in every Lambda handler — no exceptions.

### Frontend: Next.js 15 App Router

```
app/
  dashboard/       # Financial overview with charts
  transactions/    # Transaction management, filters, CSV
  recurring/       # Recurring transactions
  analytics/       # Analytics and insights
  budget/          # Budget tracking and goals
components/
  ui/              # Reusable Radix UI components
services/          # API clients: api.ts, recurring.ts, csv.ts
types/             # TypeScript definitions
```

**Key conventions:**
- `"use client"` is required for any component using hooks, event handlers, or browser APIs
- Data fetching via React Query (`@tanstack/react-query`) — no raw `fetch` in components
- Charts via Chart.js + `react-chartjs-2`
- Recurring transactions live in `localStorage` only — never sent to backend
- Dark mode via Tailwind `dark:` classes, managed by `ThemeProvider` context

---

## Behavior Guidelines

### Before starting any task
1. Read this file fully (already doing it — good)
2. Identify all files that will be affected and read them
3. Read the relevant skill file(s) from `.agents/skills/`
4. If the task touches tests, read `.agents/skills/testing-patterns.md` too
5. If anything about the business requirement is ambiguous, **ask before writing code**

### Testing rule
> Before marking any task as complete, run `npm test` in the affected
> package(s). Do not consider a delivery done if any test is failing.

### During implementation
- Keep changes strictly scoped to the task — no opportunistic refactors
- Never install new packages without asking first
- Never modify files outside the task scope without explicit approval
- Prefer small, reviewable commits over large ones
- Run `npm test` after any changes to use cases, repositories, or Lambda handlers

### Code style
- `async/await` over `.then()` chains always
- Descriptive variable names — no abbreviations except established ones (`dto`, `repo`, `ctx`, `tx`)
- Use cases expose a single `execute()` method
- Lambda handlers must stay thin — all logic belongs in use cases
- No `any` types — if you don't know the type, ask or infer from context
- Errors should be typed and handled explicitly, never swallowed

---

## Domain Rules (read carefully)

These are business invariants that the code doesn't always make obvious:

### Categories
- Defined in **two places** that must always stay in sync:
  - Backend: `backend/src/shared/constants/categories.ts` (enum)
  - Frontend: `frontend/src/types/transaction.ts` (const)
- Backend accepts both category keys (`"INCOME"`) and display names (`"Salário"`)
- When adding a category, update **both files** in the same change

### Transactions
- `date`, `createdAt`, `updatedAt` are `Date | null` — always handle the null case
- `card` field is only valid when `origin === 'CREDIT_CARD'` — never set it otherwise
- Date format boundary: backend uses `Date` objects, frontend uses ISO strings (`YYYY-MM-DD`)

### Recurring Transactions
- Stored in `localStorage` only — no backend persistence
- Managed entirely by `frontend/src/services/recurring.ts`
- Templates define frequency (`daily` | `weekly` | `monthly` | `annual`)
- Actual transactions are generated manually from templates, not automatically
- Active/inactive toggling does not delete — it only changes status

### CSV Import/Export
- Export: generated client-side from filtered transactions (`csv.ts`)
- Import: validates format, creates transactions in batch via API
- Required format: `date` as `YYYY-MM-DD`, `amount` as numeric, `origin` as `CREDIT_CARD` or `CASH`

### Filtering
Frontend filter state is passed as query params to `ListTransactions` use case.
Supported filters: `description` (text search), `type`, `category`, `origin`, date range (`startMonth`/`endMonth`).

---

## Data Flow Patterns

### Creating a transaction
```
Frontend api.createTransaction()
  → Lambda handler (bootstrap → validate with Zod)
    → Use case (instantiate Transaction entity)
      → Repository (save via Mongoose)
        → Response DTO back through layers
```

### Environment Variables

Backend:
```
MONGODB_URI=<local or Atlas connection string>
```

Frontend:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/dev
```

### Serverless
- Service: `personal-finance-api`
- Runtime: Node.js 20.x
- Region: `us-east-1`
- Local port: `3001`
- CORS enabled on all endpoints
- Functions: `createTransaction`, `getTransactions`, `getTransactionById`, `updateTransaction`, `deleteTransaction`, `getReports`, `getCategories`

---

## Common Pitfalls

| Pitfall | Rule |
|---|---|
| Forgetting `bootstrap.ts` | First import in every Lambda handler, always |
| Category out of sync | Update backend enum AND frontend const together |
| Raw `fetch` in components | Use React Query via `services/api.ts` |
| `card` set on cash transactions | Only valid when `origin === 'CREDIT_CARD'` |
| Multiple MongoDB connections | Connection is cached globally — never instantiate a new one |
| Dark mode missing | Always add `dark:` variants for custom styles |
| Mutable domain entities | Domain entities are immutable — don't add setters |
| Skipping skill files | Read the relevant skill before writing UI, React, or test code |

---

## Testing

- Backend: Jest, test use cases with mocked repositories
- Frontend: Jest + React Testing Library
- Before writing any test, read `.agents/skills/testing-patterns.md`
- Mock API calls with test utilities — never hit real endpoints in tests
- Test dark mode class toggling where applicable
- Validate Zod schemas thoroughly in backend tests