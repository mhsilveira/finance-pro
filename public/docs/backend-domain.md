# Camada de Dominio do Backend

Localizada em `backend/src/domain/`. Contem a logica de negocio pura, sem dependencias de frameworks ou infraestrutura.

---

## Entidade Transaction

**Arquivo:** `backend/src/domain/entities/Transaction.ts`

A entidade principal do sistema. Representa uma transacao financeira.

### Propriedades

| Campo | Tipo | Descricao |
|---|---|---|
| `id` | `string` | Identificador unico (hex de 12 bytes aleatorios) |
| `userId` | `string` | ID do usuario dono da transacao |
| `description` | `string` | Descricao da transacao |
| `amount` | `number` | Valor (sempre positivo) |
| `type` | `'income' \| 'expense'` | Tipo: receita ou despesa |
| `origin` | `'CREDIT_CARD' \| 'CASH' \| undefined` | Origem do pagamento |
| `category` | `string \| undefined` | Nome da categoria (ex: "Alimentacao") |
| `date` | `Date \| null` | Data da transacao |
| `createdAt` | `Date \| null` | Data de criacao |
| `updatedAt` | `Date \| null` | Data da ultima atualizacao |
| `card` | `string \| undefined` | Nome do cartao (ex: "Nubank"), somente quando `origin === 'CREDIT_CARD'` |

### Validacao Interna

A entidade valida no construtor:

- `description` nao pode ser vazia
- `amount` nao pode ser zero
- `type` deve ser `'income'` ou `'expense'`

### Metodos

- `isIncome(): boolean` - Retorna `true` se a transacao e receita
- `isExpense(): boolean` - Retorna `true` se a transacao e despesa

### Regras de Negocio

- Datas podem ser `null` - sempre tratar o caso nulo
- O campo `card` so deve ser preenchido quando `origin === 'CREDIT_CARD'`
- O `amount` e sempre positivo; o sinal e determinado pelo `type`
- A entidade e imutavel apos criacao (sem setters)

---

## Interface de Repositorio

**Arquivo:** `backend/src/domain/repositories/ITransactionRepository.ts`

Define o contrato que a infraestrutura deve implementar.

```typescript
interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string, options?: {
    limit?: number;
    skip?: number;
  }): Promise<Transaction[]>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null>;
  bulkUpdateCategories(updates: Array<{
    id: string;
    category: string;
  }>): Promise<number>;
  delete(id: string): Promise<boolean>;
}
```

**Metodos:**

| Metodo | Descricao |
|---|---|
| `create` | Persiste uma nova transacao |
| `findById` | Busca por ID, retorna `null` se nao encontrar |
| `findByUserId` | Lista transacoes de um usuario com paginacao opcional |
| `update` | Atualiza parcialmente, retorna `null` se nao encontrar |
| `bulkUpdateCategories` | Atualiza categorias em lote (retorna quantidade atualizada) |
| `delete` | Remove por ID, retorna `false` se nao encontrar |

**Nota:** A implementacao concreta esta em `backend/src/infrastructure/database/mongodb/repositories/TransactionRepository.ts` e estende esta interface com metodos adicionais como `countByUserId()` e `getStats()`.

---

## Use Cases

Cada use case expoe um unico metodo `execute()`.

### CreateTransaction

**Arquivo:** `backend/src/domain/use-cases/CreateTransaction.ts`

Cria uma nova transacao.

**Dependencias:** `ITransactionRepository`, `CategoryRepository`

**Fluxo:**
1. Valida se a categoria existe (busca por chave ou nome no banco)
2. Normaliza o valor (`amount`) - aceita string com virgula
3. Gera ID aleatorio com `crypto.randomBytes(12)`
4. Instancia a entidade `Transaction`
5. Persiste via repositorio

**Entrada:**

```typescript
{
  userId: string;
  description: string;
  amount: number | string;
  card?: string;
  type: 'income' | 'expense';
  origin?: 'CREDIT_CARD' | 'CASH' | null;
  category: string;  // chave (ex: "FOOD") ou nome (ex: "Alimentacao")
  date: Date;
}
```

**Saida:** `Promise<Transaction>`

**Erro:** Lanca excecao se a categoria nao existir (`"Categoria invalida: XYZ"`).

---

### ListTransactions

**Arquivo:** `backend/src/domain/use-cases/ListTransactions.ts`

Lista transacoes de um usuario com paginacao.

**Dependencias:** `ITransactionRepository`

**Entrada:** `userId: string, options?: { limit?: number; skip?: number }`

**Saida:** `Promise<Transaction[]>`

---

### GetTransaction

**Arquivo:** `backend/src/domain/use-cases/GetTransaction.ts`

Busca uma transacao por ID.

**Dependencias:** `ITransactionRepository`

**Entrada:** `id: string`

**Saida:** `Promise<Transaction | null>`

---

### UpdateTransaction

**Arquivo:** `backend/src/domain/use-cases/UpdateTransaction.ts`

Atualiza parcialmente uma transacao.

**Dependencias:** `ITransactionRepository`

**Entrada:** `id: string, partial: Partial<Transaction>`

**Saida:** `Promise<Transaction | null>`

---

### DeleteTransaction

**Arquivo:** `backend/src/domain/use-cases/DeleteTransaction.ts`

Exclui uma transacao por ID.

**Dependencias:** `ITransactionRepository`

**Entrada:** `id: string`

**Saida:** `Promise<boolean>`

---

### ReprocessCategories

**Arquivo:** `backend/src/domain/use-cases/ReprocessCategories.ts`

Reprocessa as categorias de todas as transacoes de um usuario usando regras de categorizacao atualizadas.

**Dependencias:** `ITransactionRepository`

**Entrada:**

```typescript
userId: string,
corrections?: CategoryCorrection[],  // correcoes do usuario
categoryRules?: CategoryRule[]         // regras de palavras-chave do banco
```

**Saida:**

```typescript
{
  total: number;    // total de transacoes
  updated: number;  // quantas foram atualizadas
  unchanged: number; // quantas permaneceram iguais
}
```

**Fluxo:**
1. Busca todas as transacoes do usuario
2. Para cada transacao, executa `predictCategory()` com as regras
3. Compara com a categoria atual
4. Coleta atualizacoes necessarias em memoria
5. Executa `bulkUpdateCategories()` uma unica vez

### Funcao predictCategory

Definida no mesmo arquivo do use case. Prioridades de categorizacao:

1. **Correcoes do usuario** - Se a descricao contem o padrao de uma correcao
2. **Pular metodos de pagamento** - PIX, PAGAMENTO, TRANSFERENCIA retornam "A Categorizar"
3. **Regras de palavras-chave** - Categorias do banco ordenadas por `sortOrder`
4. **Fallback** - "Outros"

A comparacao e case-insensitive e remove acentos (normalizacao NFD).

---

## Diagrama de Fluxo

```
Lambda Handler
  │
  ├── Valida request (Zod schema)
  │
  ├── Instancia Repository (Infrastructure)
  │
  ├── Instancia Use Case (Domain)
  │     │
  │     └── Executa logica de negocio
  │           │
  │           └── Chama Repository (via interface)
  │
  └── Formata e retorna response HTTP
```
