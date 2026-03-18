# Camada de Servicos do Frontend

Localizada em `frontend/src/services/`. Encapsula toda a comunicacao com o backend e logica de dados local.

---

## api.ts

**Arquivo:** `frontend/src/services/api.ts`

Modulo central de comunicacao HTTP com o backend. Todas as chamadas usam `fetch()` nativo.

### Configuracao

A URL base e obtida de `process.env.NEXT_PUBLIC_API_BASE_URL`. Funciona tanto no servidor quanto no cliente.

### Tipos Exportados

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface ReprocessCategoriesResult {
  message: string;
  total: number;
  updated: number;
  unchanged: number;
}

interface CategoryCorrection {
  _id?: string;
  userId: string;
  descriptionPattern: string;
  category: string;
  createdAt?: string;
}

interface BatchCreateResult {
  message: string;
  success: number;
  duplicates: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

interface TransactionStats {
  totalCount: number;
  income: number;
  expense: number;
  byCategory: Array<{ category: string; total: number; count: number }>;
}
```

### Funcoes de Transacao

| Funcao | Metodo | Endpoint | Descricao |
|---|---|---|---|
| `getTransactions(userId, options?)` | GET | `/transactions` | Lista paginada (default 50/pagina) |
| `getAllTransactions(userId)` | GET | `/transactions?limit=9999` | Busca todas (para filtros client-side) |
| `createTransaction(payload)` | POST | `/transactions` | Cria uma transacao |
| `updateTransaction(id, payload)` | PUT | `/transactions/{id}` | Atualiza parcialmente |
| `deleteTransaction(id)` | DELETE | `/transactions/{id}` | Exclui uma transacao |
| `deleteAllTransactions(userId)` | DELETE | `/transactions?userId=` | Exclui todas do usuario |
| `batchCreateTransactions(transactions)` | POST | `/transactions/batch` | Cria em lote (max 500) |
| `getTransactionStats(userId, filters?)` | GET | `/transactions/stats` | Estatisticas agregadas |

### Funcoes de Categoria

| Funcao | Metodo | Endpoint | Descricao |
|---|---|---|---|
| `getCategories(type?)` | GET | `/categories` | Lista categorias (filtro opcional por tipo) |
| `createCategory(data)` | POST | `/categories` | Cria nova categoria |
| `updateCategory(key, data)` | PUT | `/categories/{key}` | Atualiza categoria |
| `deleteCategory(key)` | DELETE | `/categories/{key}` | Exclui categoria |

### Funcoes de Correcao de Categoria

| Funcao | Metodo | Endpoint | Descricao |
|---|---|---|---|
| `getCategoryCorrections(userId)` | GET | `/category-corrections` | Lista correcoes do usuario |
| `saveCategoryCorrection(userId, pattern, category)` | POST | `/category-corrections` | Salva/atualiza correcao |

### Funcoes de Reprocessamento

| Funcao | Metodo | Endpoint | Descricao |
|---|---|---|---|
| `reprocessCategories(userId)` | POST | `/transactions/reprocess-categories` | Reprocessa todas as categorias |

### Tratamento de Erros

Todas as funcoes lancam `Error` com mensagem formatada (`Erro {status}: {mensagem}`) quando o status HTTP nao e OK.

---

## csv.ts

**Arquivo:** `frontend/src/services/csv.ts`

Modulo de import/export de transacoes em formato CSV.

### Exportacao

#### `exportTransactionsToCSV(transactions: Transaction[]): void`

Exporta a lista de transacoes como arquivo CSV para download.

**Colunas:** ID, Data, Descricao, Valor, Tipo, Categoria, Origem, Cartao, Criado em

**Comportamento:**
- Gera CSV com headers em portugues
- Escapa campos que contem virgula, aspas ou quebra de linha
- Cria Blob e dispara download automatico
- Nome do arquivo: `transacoes_YYYY-MM-DD.csv`

### Importacao

#### `parseCSV(csvText, source, corrections?, categories?): CreateTransactionPayload[]`

Funcao principal de importacao. Roteia para o parser correto baseado na fonte.

**Parametros:**
- `csvText` - Conteudo do arquivo CSV
- `source` - Tipo da fonte (`NUBANK_CHECKING`, `NUBANK_CREDIT`, `ITAU_CHECKING`, `ITAU_CREDIT`)
- `corrections` - Correcoes de categoria do usuario (opcional)
- `categories` - Categorias com keywords do banco (opcional)

**Retorna:** Array de `CreateTransactionPayload` prontos para envio a API.

Veja [csv-import.md](./csv-import.md) para detalhes completos dos parsers.

### Template

#### `downloadCSVTemplate(): void`

Gera e baixa um arquivo de modelo com exemplos de todos os 4 formatos suportados. Nome: `modelo_importacao.csv`.

### Funcoes Utilitarias (internas)

- `parseBrazilianDate(dateStr)` - Converte `DD/MM/YYYY` para `YYYY-MM-DD`
- `parseCSVLine(line, delimiter)` - Parseia linha CSV respeitando campos entre aspas

---

## recurring.ts

**Arquivo:** `frontend/src/services/recurring.ts`

Gerenciamento de transacoes recorrentes via `localStorage`.

**Chave de armazenamento:** `recurring_transactions`

### Funcoes

| Funcao | Descricao |
|---|---|
| `getRecurringTransactions()` | Retorna todas as transacoes recorrentes do localStorage |
| `saveRecurringTransactions(recurring)` | Salva a lista completa no localStorage |
| `createRecurringTransaction(payload)` | Cria nova recorrente (gera ID com `Date.now()`, seta `isActive: true`) |
| `updateRecurringTransaction(id, updates)` | Atualiza parcialmente por ID |
| `deleteRecurringTransaction(id)` | Remove por ID |
| `toggleRecurringActive(id)` | Alterna `isActive` de uma recorrente |

### Tipo RecurringTransaction

```typescript
interface RecurringTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  origin: "CREDIT_CARD" | "CASH";
  category: string;
  card?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastGenerated?: string;
  createdAt: string;
}
```

### Notas Importantes

- **Nenhum dado e enviado ao backend.** Tudo fica no `localStorage` do navegador.
- Excluir e restaurar: `toggleRecurringActive` alterna o status sem excluir
- A geracao de transacoes reais e feita pela pagina `/recurring` chamando `createTransaction()` da API
- Verifica `typeof window !== "undefined"` para compatibilidade com SSR
