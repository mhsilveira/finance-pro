# API do Backend - Endpoints

Servico: `personal-finance-api`
Base URL local: `http://localhost:3001/dev`
Runtime: Node.js 20.x | Regiao: us-east-1 | CORS habilitado em todos os endpoints.

---

## Transacoes

### POST /transactions

Cria uma nova transacao.

**Handler:** `src/interface/lambda/createTransaction.handler`
**Use Case:** `CreateTransaction`

**Request Body:**

```json
{
  "userId": "string (obrigatorio)",
  "description": "string (obrigatorio)",
  "amount": "number | string (obrigatorio, max 2 casas decimais)",
  "type": "income | expense (obrigatorio)",
  "category": "string (obrigatorio, chave ou nome da categoria)",
  "date": "string ISO date (obrigatorio)",
  "origin": "CREDIT_CARD | CASH | null",
  "card": "string (obrigatorio quando origin = CREDIT_CARD)"
}
```

**Validacao:** Schema Zod `createTransactionSchema`. Valida que `card` e obrigatorio quando `origin = CREDIT_CARD`. O `amount` aceita string com virgula (ex: `"85,50"`) e converte para numero.

**Response (201):**

```json
{
  "id": "string",
  "userId": "string",
  "description": "string",
  "amount": "number",
  "type": "income | expense",
  "category": "string (nome da categoria)",
  "date": "string ISO",
  "createdAt": "string ISO",
  "updatedAt": "string ISO"
}
```

**Comportamento:** Faz seed das categorias default se necessario. Resolve a categoria buscando por chave (`FOOD`) ou nome (`Alimentacao`). Gera ID aleatorio via `crypto.randomBytes`.

---

### GET /transactions

Lista transacoes paginadas de um usuario.

**Handler:** `src/interface/lambda/getTransactions.handler`
**Use Case:** `ListTransactions`

**Query Params:**

| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `userId` | string | Sim | ID do usuario |
| `page` | number | Nao | Pagina (default: 1) |
| `limit` | number | Nao | Itens por pagina (default: 50) |

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "description": "string",
      "amount": "number",
      "type": "income | expense",
      "origin": "CREDIT_CARD | CASH",
      "card": "string | null",
      "category": "string",
      "date": "YYYY-MM-DD",
      "monthYear": "YYYY-MM"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasMore": "boolean"
  }
}
```

**Nota:** As datas sao retornadas no formato `YYYY-MM-DD` (somente data, sem hora). O campo `monthYear` e calculado a partir da data.

---

### GET /transactions/{id}

Busca uma transacao por ID.

**Handler:** `src/interface/lambda/getTransactionById.handler`
**Use Case:** `GetTransaction`

**Response (200):** Transacao completa com datas ISO.
**Response (404):** `{ "message": "Transaction not found" }`

---

### PUT /transactions/{id}

Atualiza uma transacao existente.

**Handler:** `src/interface/lambda/updateTransaction.handler`
**Use Case:** `UpdateTransaction`

**Request Body (todos opcionais):**

```json
{
  "description": "string",
  "amount": "number | string",
  "type": "income | expense",
  "category": "string",
  "date": "string ISO"
}
```

**Validacao:** Schema Zod `updateTransactionSchema`. Exige pelo menos um campo.

**Response (200):** Transacao atualizada.
**Response (404):** `{ "message": "Transaction not found" }`

---

### DELETE /transactions/{id}

Exclui uma transacao por ID.

**Handler:** `src/interface/lambda/deleteTransaction.handler`
**Use Case:** `DeleteTransaction`

**Response (204):** `{}`
**Response (404):** `{ "message": "Transaction not found" }`

---

### DELETE /transactions

Exclui TODAS as transacoes de um usuario.

**Handler:** `src/interface/lambda/deleteAllTransactions.handler`
**Timeout:** 30 segundos

**Query Params:**

| Param | Tipo | Obrigatorio |
|---|---|---|
| `userId` | string | Sim |

**Response (200):**

```json
{
  "message": "Deleted 150 transactions",
  "deletedCount": 150
}
```

**Nota:** Usa `TransactionMongooseModel.deleteMany()` diretamente, sem use case.

---

### POST /transactions/batch

Cria transacoes em lote (usado na importacao CSV).

**Handler:** `src/interface/lambda/batchCreateTransactions.handler`
**Timeout:** 60 segundos

**Request Body:**

```json
{
  "transactions": [
    {
      "userId": "string",
      "description": "string",
      "amount": "number | string",
      "type": "income | expense",
      "category": "string",
      "date": "string ISO",
      "origin": "CREDIT_CARD | CASH | null",
      "card": "string"
    }
  ]
}
```

**Restricoes:**
- Maximo de 500 transacoes por batch
- Cada transacao e validada individualmente com `createTransactionSchema`
- Usa `insertMany` com `ordered: false` (continua apos erros)
- Prevencao de duplicatas via `idempotencyKey` (hash de data + descricao + valor)

**Response (201):**

```json
{
  "message": "Batch complete: 45 created, 3 duplicates skipped, 2 failed",
  "success": 45,
  "duplicates": 3,
  "failed": 2,
  "errors": [
    { "index": 5, "error": "Categoria invalida: XYZ" }
  ]
}
```

---

### GET /transactions/stats

Retorna estatisticas agregadas das transacoes.

**Handler:** `src/interface/lambda/getTransactionStats.handler`

**Query Params:**

| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `userId` | string | Sim | ID do usuario |
| `monthFrom` | string | Nao | Mes inicial (YYYY-MM) |
| `monthTo` | string | Nao | Mes final (YYYY-MM) |

**Response (200):**

```json
{
  "totalCount": 150,
  "income": 7500.00,
  "expense": 5200.00,
  "byCategory": [
    { "category": "Alimentacao", "total": 1200.00, "count": 25 }
  ]
}
```

---

## Relatorios

### GET /reports

Retorna relatorios de tendencias mensais, breakdown por categoria e media diaria de gastos.

**Handler:** `src/interface/lambda/getReports.handler`

**Query Params:**

| Param | Tipo | Obrigatorio |
|---|---|---|
| `userId` | string | Sim |

**Response (200):**

```json
{
  "monthlyTrends": [
    {
      "monthYear": "2024-12",
      "income": 7500.00,
      "expense": 5200.00,
      "balance": 2300.00
    }
  ],
  "categoryBreakdown": [
    {
      "type": "expense",
      "category": "Alimentacao",
      "amount": 1200.00
    }
  ],
  "averageDailySpending": 173.33
}
```

**Nota:** Usa aggregations do MongoDB diretamente (sem use case). Calcula dias no mes considerando anos bissextos.

---

## Categorias

### GET /categories

Lista todas as categorias ou filtra por tipo.

**Handler:** `src/interface/lambda/getCategories.handler`

**Query Params:**

| Param | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `type` | string | Nao | `income`, `expense` ou omitir para todas |

**Response (200):**

```json
[
  {
    "_id": "string",
    "key": "FOOD",
    "name": "Alimentacao",
    "type": "expense",
    "icon": "🍔",
    "color": "#f59e0b",
    "keywords": ["IFOOD", "RAPPI", "MERCADO"],
    "sortOrder": 10
  }
]
```

**Comportamento:** Faz seed das categorias default se o banco estiver vazio.

---

### POST /categories

Cria uma nova categoria.

**Handler:** `src/interface/lambda/manageCategories.createHandler`

**Request Body:**

```json
{
  "key": "string (obrigatorio, convertido para uppercase)",
  "name": "string (obrigatorio)",
  "type": "income | expense | both (obrigatorio)",
  "icon": "string (opcional, ex: 🏠)",
  "color": "string (opcional, ex: #6366f1)",
  "keywords": ["string"] ,
  "sortOrder": "number (default: 100)"
}
```

**Response (201):** Categoria criada.
**Response (409):** `{ "error": "Category with key 'FOOD' already exists" }`

---

### PUT /categories/{key}

Atualiza uma categoria existente.

**Handler:** `src/interface/lambda/manageCategories.updateHandler`

**Path Params:** `key` - Chave da categoria (ex: `FOOD`)

**Request Body (todos opcionais):**

```json
{
  "name": "string",
  "type": "income | expense | both",
  "icon": "string",
  "color": "string",
  "keywords": ["string"],
  "sortOrder": "number"
}
```

**Response (200):** Categoria atualizada.
**Response (404):** `{ "error": "Category 'XYZ' not found" }`

---

### DELETE /categories/{key}

Exclui uma categoria.

**Handler:** `src/interface/lambda/manageCategories.deleteHandler`

**Response (200):** `{ "message": "Category 'FOOD' deleted" }`
**Response (404):** `{ "error": "Category 'XYZ' not found" }`

---

## Correcoes de Categoria

### GET /category-corrections

Lista correcoes de categoria de um usuario.

**Handler:** `src/interface/lambda/categoryCorrections.getHandler`

**Query Params:**

| Param | Tipo | Obrigatorio |
|---|---|---|
| `userId` | string | Sim |

**Response (200):**

```json
[
  {
    "_id": "string",
    "userId": "string",
    "descriptionPattern": "IFOOD",
    "category": "Alimentacao",
    "createdAt": "string ISO"
  }
]
```

---

### POST /category-corrections

Salva ou atualiza uma correcao de categoria.

**Handler:** `src/interface/lambda/categoryCorrections.postHandler`

**Request Body:**

```json
{
  "userId": "string (obrigatorio)",
  "descriptionPattern": "string (obrigatorio)",
  "category": "string (obrigatorio)"
}
```

**Response (201):** Correcao criada/atualizada (upsert por userId + descriptionPattern).

---

## Reprocessamento de Categorias

### POST /transactions/reprocess-categories

Reprocessa as categorias de TODAS as transacoes de um usuario usando as regras de categorizacao atuais.

**Handler:** `src/interface/lambda/reprocessCategories.handler`
**Use Case:** `ReprocessCategories`
**Timeout:** 60 segundos

**Query Params:**

| Param | Tipo | Obrigatorio |
|---|---|---|
| `userId` | string | Sim |

**Response (200):**

```json
{
  "message": "Categories reprocessed successfully",
  "total": 150,
  "updated": 45,
  "unchanged": 105
}
```

**Comportamento:**
1. Busca todas as transacoes do usuario
2. Busca correcoes do usuario e regras de categoria do banco
3. Para cada transacao, prediz a categoria com a funcao `predictCategory()`
4. Atualiza em lote (bulk update) apenas as que mudaram

---

## Resumo dos Endpoints

| Metodo | Path | Descricao |
|---|---|---|
| `POST` | `/transactions` | Criar transacao |
| `GET` | `/transactions` | Listar transacoes (paginado) |
| `GET` | `/transactions/{id}` | Buscar transacao por ID |
| `PUT` | `/transactions/{id}` | Atualizar transacao |
| `DELETE` | `/transactions/{id}` | Excluir transacao |
| `DELETE` | `/transactions` | Excluir todas do usuario |
| `POST` | `/transactions/batch` | Criar em lote (CSV import) |
| `GET` | `/transactions/stats` | Estatisticas agregadas |
| `POST` | `/transactions/reprocess-categories` | Reprocessar categorias |
| `GET` | `/reports` | Relatorios e tendencias |
| `GET` | `/categories` | Listar categorias |
| `POST` | `/categories` | Criar categoria |
| `PUT` | `/categories/{key}` | Atualizar categoria |
| `DELETE` | `/categories/{key}` | Excluir categoria |
| `GET` | `/category-corrections` | Listar correcoes |
| `POST` | `/category-corrections` | Salvar correcao |
