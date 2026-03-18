# Sistema de Categorias

O Finance Pro possui um sistema de categorias dinâmico armazenado no MongoDB, com auto-categorizacao baseada em palavras-chave e correcoes do usuario.

---

## Categorias no Backend

**Arquivo:** `backend/src/shared/constants/categories.ts`

Enum com as categorias padrao (usada como seed):

| Chave | Nome |
|---|---|
| `INCOME` | Salario |
| `FOOD` | Alimentacao |
| `TRANSPORT` | Transporte |
| `ENTERTAINMENT` | Lazer |
| `HEALTH` | Saude |
| `EDUCATION` | Educacao |
| `CLOTHING` | Vestuario |
| `SUBSCRIPTIONS` | Assinaturas |
| `SHOPPING` | Compras |
| `BILLS` | Contas |
| `GENERAL` | Gastos Gerais |
| `OTHER` | Outros |
| `TO_CATEGORIZE` | A Categorizar |
| `PETS` | Pets |

Essas categorias sao usadas como seed no banco. O `CategoryRepository.seedDefaultCategories()` popula o MongoDB se estiver vazio.

---

## Categorias no Frontend

**Arquivo:** `frontend/src/types/transaction.ts`

Constante `CATEGORIES` usada como fallback quando a API nao esta disponivel:

```typescript
const CATEGORIES = {
  FOOD: "Alimentacao",
  TRANSPORT: "Transporte",
  HEALTH: "Saude",
  EDUCATION: "Educacao",
  ENTERTAINMENT: "Entretenimento",
  SHOPPING: "Compras",
  BILLS: "Contas",
  SALARY: "Salario",
  INVESTMENT: "Investimento",
  OTHER: "Outros",
};
```

**Nota:** Essa constante pode estar desatualizada em relacao ao banco. O frontend prioriza categorias carregadas do backend via `useCategories()`.

---

## Modelo de Categoria no Banco

Cada categoria no MongoDB tem:

```typescript
interface Category {
  _id?: string;
  key: string;         // Chave unica (ex: "FOOD"), uppercase
  name: string;        // Nome de exibicao (ex: "Alimentacao")
  type: "income" | "expense" | "both";  // Tipo de transacao que aceita
  icon?: string;       // Emoji (ex: "🍔")
  color?: string;      // Cor hex (ex: "#f59e0b")
  keywords?: string[]; // Palavras-chave para auto-categorizacao
  sortOrder?: number;  // Prioridade na auto-categorizacao (menor = maior)
}
```

---

## CRUD de Categorias

O frontend permite gerenciar categorias via `ManageCategoriesModal`:

- **Criar:** chave + nome + tipo + icone + cor + keywords + prioridade
- **Editar:** tudo exceto a chave
- **Excluir:** com confirmacao

Endpoints:
- `POST /categories` - Criar
- `PUT /categories/{key}` - Atualizar
- `DELETE /categories/{key}` - Excluir
- `GET /categories` - Listar (com filtro opcional por tipo)

---

## Sistema de Auto-Categorizacao

A auto-categorizacao e usada em dois contextos:
1. **Importacao CSV** - Categoriza automaticamente cada transacao importada
2. **Reprocessamento** - Recategoriza todas as transacoes existentes

### Motor de Predicao (Frontend)

**Arquivo:** `frontend/src/lib/categoryPredictor.ts`

Funcao: `predictCategory(description, corrections?, categories?): string`

### Motor de Predicao (Backend)

**Arquivo:** `backend/src/domain/use-cases/ReprocessCategories.ts`

Funcao: `predictCategory(description, corrections?, categoryRules?): string`

Ambas implementacoes seguem a mesma logica de prioridades.

### Prioridades de Categorizacao

A predicao segue esta ordem estrita:

```
1. Correcoes do usuario
   ↓ (se nenhuma correcao combinar)
2. Pular metodos de pagamento
   ↓ (se nao for metodo de pagamento)
3. Regras de palavras-chave
   ↓ (se nenhuma keyword combinar)
4. Fallback: "Outros"
```

#### 1. Correcoes do Usuario

Correcoes sao salvas quando o usuario edita manualmente a categoria de uma transacao no `EditTransactionModal`. O sistema armazena o padrao da descricao e a categoria correta.

**Exemplo:** Se o usuario muda "IFOOD" de "Outros" para "Alimentacao", futuras transacoes contendo "IFOOD" na descricao serao automaticamente categorizadas como "Alimentacao".

Armazenamento: colecao `category-corrections` no MongoDB.

```typescript
{
  userId: "blanchimaah",
  descriptionPattern: "IFOOD",
  category: "Alimentacao"
}
```

#### 2. Metodos de Pagamento

Descricoes que comecam com palavras genericas de pagamento sao marcadas como "A Categorizar":

- `PIX`
- `PAGAMENTO` / `PAGAMENTO EFETUADO` / `PAGAMENTO DE BOLETO`
- `TRANSFERENCIA` / `TRANSFERÊNCIA`

Essas descricoes sao muito genericas para inferir a categoria real.

#### 3. Regras de Palavras-Chave

Cada categoria pode ter uma lista de `keywords`. Se a descricao da transacao contem alguma keyword, a categoria correspondente e atribuida.

As categorias sao processadas na ordem do `sortOrder` (menor primeiro), entao categorias com menor `sortOrder` tem prioridade.

**Exemplo:**
- Categoria "Alimentacao" com keywords `["IFOOD", "RAPPI", "MERCADO", "RESTAURANTE"]`
- Categoria "Transporte" com keywords `["UBER", "99", "GASOLINA"]`

#### 4. Fallback

Se nenhuma regra combinar, retorna `"Outros"`.

### Normalizacao

Todas as comparacoes sao feitas apos normalizacao:
- Conversao para UPPERCASE
- Remocao de acentos (NFD + regex)
- Trim de espacos

**Exemplo:** `"ifood - almoço"` e normalizado para `"IFOOD - ALMOCO"` antes da comparacao.

---

## Reprocessamento de Categorias

Disponivel na pagina de transacoes (botao "Reprocessar Categorias").

### Fluxo

1. Frontend chama `POST /transactions/reprocess-categories?userId=X`
2. Backend busca todas as transacoes do usuario
3. Backend busca correcoes e categorias (com keywords) do banco
4. Para cada transacao, executa `predictCategory()` com as regras atuais
5. Compara com a categoria atual da transacao
6. Atualiza em lote (bulk update) apenas as que mudaram
7. Retorna estatisticas: total, atualizadas, inalteradas

### Quando Usar

- Apos adicionar novas palavras-chave a uma categoria
- Apos criar correcoes de categoria
- Apos importar transacoes que ficaram como "Outros" ou "A Categorizar"
- Para aplicar retroativamente novas regras de categorizacao

---

## Sincronizacao

**Regra importante:** As categorias do backend (`categories.ts`) e do frontend (`transaction.ts`) devem estar sincronizadas. Ao adicionar uma categoria, atualizar ambos os arquivos.

Na pratica, o frontend prioriza categorias carregadas do backend via API. A constante `CATEGORIES` no frontend e apenas um fallback para quando a API nao esta disponivel.
