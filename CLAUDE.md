# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finance Pro is a full-stack personal finance management application with a Next.js 15 frontend and AWS Lambda serverless backend using Clean Architecture principles.

## Development Commands

### Running the Application
```bash
# Start backend (from root)
npm run dev                    # Runs serverless offline on http://localhost:3001

# Start frontend (from root)
npm start                      # Runs Next.js dev server on http://localhost:3000

# Or from individual directories
cd backend && npm run dev
cd frontend && npm run dev
```

### Backend Commands (from backend/ directory)
```bash
npm run build                  # Compile TypeScript
npm run dev                    # Serverless offline (port 3001)
npm test                       # Run tests
npm run lint                   # ESLint
npm run deploy                 # Deploy to AWS dev stage
npm run deploy:prod            # Deploy to AWS production
```

### Frontend Commands (from frontend/ directory)
```bash
npm run dev                    # Next.js dev with Turbopack
npm run build                  # Production build with Turbopack
npm start                      # Production server
npm run lint                   # Biome linting
npm run format                 # Biome formatting
```

## Architecture

### Backend: Clean Architecture with Serverless

The backend follows Clean Architecture with strict layer separation:

**Domain Layer** (`@domain/*`)
- Pure business logic, framework-agnostic
- `entities/`: Core business entities (Transaction)
- `repositories/`: Repository interfaces (ITransactionRepository)
- `use-cases/`: Business logic (CreateTransaction, ListTransactions, etc.)

**Application Layer** (`@application/*`)
- Application-specific logic
- `dtos/`: Data transfer objects (CreateTransactionDTO, TransactionResponseDTO)
- `validators/`: Zod validation schemas

**Infrastructure Layer** (`@infrastructure/*`)
- External dependencies and implementations
- `database/mongodb/`: MongoDB/Mongoose implementation
  - `models/`: Mongoose schemas (TransactionModel, CategoryModel)
  - `repositories/`: Repository implementations (TransactionRepository)
  - `connection.ts`: Database connection logic
- `http/`: HTTP utilities (httpResponse helpers)

**Interface Layer** (`@interface/*`)
- Entry points for the application
- `lambda/`: AWS Lambda handlers (createTransaction.ts, getTransactions.ts, etc.)

**Shared** (`@shared/*`)
- Cross-cutting concerns
- `constants/`: Shared constants (categories.ts)
- `config/`: Configuration (env.ts)
- `types/`: Shared types

**Key Architectural Points:**
- Path aliases are configured in `tsconfig.json` and resolved via `bootstrap.ts` using `module-alias`
- The `bootstrap.ts` file MUST be imported at the top of every Lambda handler to set up aliases and load environment variables
- Dependencies flow inward: Domain has no dependencies, Application depends on Domain, Infrastructure depends on Application/Domain, Interface depends on all layers
- All Lambda handlers follow the pattern: validate input → call use case → return HTTP response
- Mongoose models are in Infrastructure, but domain entities remain database-agnostic

### Frontend: Next.js 15 with App Router

**Structure:**
- `app/`: Next.js App Router pages
  - `dashboard/`: Financial overview with charts
  - `transactions/`: Transaction management with filters/CSV
  - `recurring/`: Recurring transactions management
  - `analytics/`: Detailed analytics and insights
  - `budget/`: Budget tracking and financial goals
- `components/`: React components (Navbar, modals, tables)
  - `ui/`: Reusable UI components (built with Radix UI)
- `services/`: API clients (api.ts, recurring.ts, csv.ts)
- `types/`: TypeScript type definitions

**Key Frontend Points:**
- Uses `"use client"` directive for interactive components
- React Query (@tanstack/react-query) for data fetching and caching
- localStorage for local state (budgets, goals, recurring transactions)
- Chart.js with react-chartjs-2 for data visualization
- Radix UI components for accessibility
- Tailwind CSS 4 with dark mode support (`dark:` classes)
- API base URL configured via `NEXT_PUBLIC_API_BASE_URL` env var

## Critical Implementation Details

### Categories System
Categories are defined in TWO places and must be kept in sync:
- Backend: `backend/src/shared/constants/categories.ts` (Categories enum)
- Frontend: `frontend/src/types/transaction.ts` (CATEGORIES const)

The backend uses a lookup system that accepts both category keys (e.g., "INCOME") and display names (e.g., "Salário").

### Transaction Entity
The Transaction entity has nullable date fields (Date | null):
- `date`: Transaction date
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

The `card` field is optional and only used when `origin` is `'CREDIT_CARD'`.

### Environment Variables
Backend requires:
- `MONGODB_URI`: MongoDB connection string (local or Atlas)

Frontend requires:
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (e.g., `http://localhost:3001/dev`)

### Serverless Configuration
- Service name: `personal-finance-api`
- Runtime: Node.js 20.x
- Region: us-east-1
- Local dev port: 3001
- All endpoints have CORS enabled
- Functions: createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction, getReports, getCategories

## Data Flow Patterns

### Creating a Transaction
1. Frontend calls `api.createTransaction()` with CreateTransactionPayload
2. Lambda handler imports bootstrap, validates with Zod schema
3. Use case instantiates Transaction entity (validates business rules)
4. Repository saves to MongoDB via Mongoose
5. Response DTO returned through layers to frontend

### Filtering Transactions
Frontend supports filtering by:
- Description (text search)
- Type (income/expense)
- Category
- Origin (CREDIT_CARD/CASH)
- Date range (separate start/end month inputs)

Filters are passed as query parameters to the backend's ListTransactions use case.

### CSV Import/Export
- Export: Frontend generates CSV from filtered transactions using `csv.ts` service
- Import: Validates CSV format, creates transactions in batch via API
- Model CSV template available for download in UI

### Recurring Transactions
Stored in localStorage (not in backend database). Frontend service (`recurring.ts`) manages:
- Template definitions with frequency (daily/weekly/monthly/annual)
- Manual generation of actual transactions from templates
- Active/inactive status without deletion

## Testing Approach

Backend uses Jest for testing. When writing tests:
- Test use cases in isolation with mocked repositories
- Test repository implementations against test database
- Validate Zod schemas thoroughly

Frontend uses Jest + React Testing Library. When writing tests:
- Test components with user interactions
- Mock API calls with custom test utilities
- Test dark mode class toggling

## Common Pitfalls

1. **Path Aliases**: Always import `bootstrap.ts` FIRST in Lambda handlers before any aliased imports
2. **Category Sync**: When adding categories, update BOTH backend and frontend constants
3. **Date Handling**: Backend uses Date objects, frontend uses ISO strings (YYYY-MM-DD)
4. **Client Components**: Remember `"use client"` for hooks, event handlers, browser APIs
5. **MongoDB Connection**: Connection is cached globally; don't create multiple connections
6. **CSV Format**: Date must be YYYY-MM-DD, Amount must be numeric, Origin must be CREDIT_CARD or CASH
7. **Dark Mode**: Use Tailwind `dark:` classes, theme state managed by ThemeProvider context
