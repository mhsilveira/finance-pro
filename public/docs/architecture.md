# Arquitetura do Finance Pro

## Visao Geral

O Finance Pro e um sistema de controle financeiro pessoal composto por:

- **Frontend:** Next.js 15 (App Router, Turbopack) com Tailwind CSS e Radix UI
- **Backend:** AWS Lambda + Serverless Framework com Clean Architecture
- **Banco de Dados:** MongoDB (via Mongoose)
- **Infraestrutura:** Docker Compose para desenvolvimento local

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js 15 (App Router) - Porta 3000           │
│  React Query + Chart.js + Radix UI + Tailwind   │
├─────────────────────────────────────────────────┤
│                HTTP (REST API)                   │
├─────────────────────────────────────────────────┤
│                   BACKEND                        │
│  AWS Lambda + Serverless Offline - Porta 3001    │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │  Interface (Lambda Handlers)             │    │
│  │  Validacao Zod -> Use Case -> Response   │    │
│  ├─────────────────────────────────────────┤    │
│  │  Application (DTOs, Validators)          │    │
│  │  Schemas Zod para request/response       │    │
│  ├─────────────────────────────────────────┤    │
│  │  Domain (Entities, Use Cases)            │    │
│  │  Logica de negocio pura, sem frameworks  │    │
│  ├─────────────────────────────────────────┤    │
│  │  Infrastructure (MongoDB, HTTP helpers)  │    │
│  │  Implementacao concreta dos repositorios │    │
│  └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│                   MONGODB                        │
│  Porta 27017 (Docker ou Atlas)                   │
└─────────────────────────────────────────────────┘
```

---

## Clean Architecture (Backend)

As dependencias fluem estritamente para dentro. Camadas externas dependem das internas, nunca o contrario.

### Domain (`backend/src/domain/`)

Camada mais interna. Contem logica de negocio pura, sem dependencias externas.

| Diretorio | Conteudo |
|---|---|
| `entities/` | Entidade `Transaction` com validacao interna |
| `use-cases/` | `CreateTransaction`, `ListTransactions`, `GetTransaction`, `UpdateTransaction`, `DeleteTransaction`, `ReprocessCategories` |
| `repositories/` | Interface `ITransactionRepository` (contrato) |

### Application (`backend/src/application/`)

Camada de aplicacao com DTOs e validadores.

| Diretorio | Conteudo |
|---|---|
| `validators/` | Schemas Zod (`createTransactionSchema`, `updateTransactionSchema`) |

### Infrastructure (`backend/src/infrastructure/`)

Implementacoes concretas das interfaces do dominio.

| Diretorio | Conteudo |
|---|---|
| `database/mongodb/` | Conexao MongoDB, modelos Mongoose, repositorios (`TransactionRepository`, `CategoryRepository`, `CategoryCorrectionRepository`) |
| `http/` | Helpers HTTP (`json()`, `badRequest()`, `notFound()`, `serverError()`) |

### Interface (`backend/src/interface/lambda/`)

Lambda handlers. Sao finos: validam a requisicao, chamam o use case e retornam a resposta.

Cada handler segue o padrao:
1. Importa `../../bootstrap` (obrigatorio, sempre primeiro import)
2. Conecta ao MongoDB via `connectMongo()`
3. Valida entrada com Zod (quando aplicavel)
4. Instancia repositorio e use case
5. Executa e retorna resposta HTTP

### Shared (`backend/src/shared/`)

Constantes e configuracoes compartilhadas entre camadas.

| Diretorio | Conteudo |
|---|---|
| `constants/` | Enum `Categories` com mapeamento chave-nome |
| `utils/` | `generateIdempotencyKey()` para prevenir duplicatas no batch |

### Path Aliases

Definidos em `tsconfig.json` e resolvidos em runtime via `bootstrap.ts` usando `module-alias`:

```
@domain/*       -> src/domain/*
@application/*  -> src/application/*
@infrastructure/* -> src/infrastructure/*
@interface/*    -> src/interface/*
@shared/*       -> src/shared/*
```

---

## Frontend (Next.js 15 App Router)

### Estrutura de Rotas

```
app/
  page.tsx           # Landing page
  layout.tsx         # Layout raiz (QueryProvider + ThemeProvider + AppShell)
  dashboard/         # Visao geral com graficos
  transactions/      # CRUD de transacoes, filtros, CSV import/export
  recurring/         # Transacoes recorrentes (localStorage)
  analytics/         # Analises e insights com graficos
  budget/            # Orcamento por categoria e metas
```

### Camada de Componentes

```
components/
  AppShell.tsx        # Layout com Sidebar (exceto landing page)
  Sidebar.tsx         # Navegacao lateral responsiva
  SidebarContext.tsx   # Estado da sidebar (collapsed/mobile)
  ThemeProvider.tsx    # Forca dark mode
  QueryProvider.tsx    # React Query client
  AddTransactionModal.tsx  # Modal para criar transacao
  EditTransactionModal.tsx # Modal para editar transacao
  ImportCSVModal.tsx       # Modal para importar CSV
  ManageCategoriesModal.tsx # Modal para gerenciar categorias
  TransactionTable.tsx     # Tabela com ordenacao
  TransactionCard.tsx      # Card simples de transacao
  DevTools.tsx             # Ferramentas de desenvolvimento (seed/clear)
  Navbar.tsx               # Barra de navegacao (legado)
  ui/                      # Componentes Radix UI (Button, Input, Select, etc.)
```

### Camada de Servicos

```
services/
  api.ts        # Todas as chamadas HTTP ao backend
  csv.ts        # Import/export de CSV (4 parsers de banco)
  recurring.ts  # CRUD de transacoes recorrentes (localStorage)
```

### Comunicacao Frontend -> Backend

O frontend comunica com o backend via REST API usando `fetch()` nativo encapsulado em `services/api.ts`. O React Query (`@tanstack/react-query`) gerencia cache, refetch e estados de loading/error.

```
Componente (React Query hook)
  -> services/api.ts (fetch HTTP)
    -> Backend Lambda (porta 3001)
      -> Use Case
        -> MongoDB
```

Configuracao da URL base: variavel de ambiente `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:3001/dev`).

---

## Docker Compose

O arquivo `docker-compose.yml` define 3 servicos para desenvolvimento local:

### Servicos

| Servico | Container | Porta | Descricao |
|---|---|---|---|
| `mongo` | `financepro-mongo` | 27017 | MongoDB 7 com volume persistente |
| `backend` | `financepro-backend` | 3001 | Serverless Offline com hot-reload |
| `frontend` | `financepro-frontend` | 3000 | Next.js dev server |

### Dependencias

```
frontend -> backend -> mongo (com healthcheck)
```

### Volumes

- `mongo-data`: Persistencia dos dados do MongoDB
- `./backend/src:/app/src`: Hot-reload do codigo backend
- `./frontend/src:/app/src`: Hot-reload do codigo frontend
- `.env` montado como read-only no backend

### Comandos

```bash
# Subir tudo
docker compose up -d

# Subir com rebuild
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar tudo
docker compose down

# Parar e limpar volumes
docker compose down -v
```

---

## Variaveis de Ambiente

| Variavel | Onde | Descricao |
|---|---|---|
| `MONGODB_URI` | Backend / `.env` | String de conexao MongoDB |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend / `.env` | URL base da API (ex: `http://localhost:3001/dev`) |
| `IS_OFFLINE` | Backend (Docker) | Indica execucao local via Serverless Offline |

---

## Tecnologias Principais

### Backend
- **Runtime:** Node.js 20.x
- **Framework:** Serverless Framework 3
- **Banco:** MongoDB via Mongoose
- **Validacao:** Zod
- **Linguagem:** TypeScript (ES2020)

### Frontend
- **Framework:** Next.js 15 (App Router + Turbopack)
- **UI:** Tailwind CSS 4 + Radix UI
- **Graficos:** Chart.js + react-chartjs-2
- **Estado servidor:** React Query (@tanstack/react-query)
- **Icones:** Lucide React + Radix Icons
- **Fonte:** Poppins (Google Fonts)
- **Linguagem:** TypeScript
