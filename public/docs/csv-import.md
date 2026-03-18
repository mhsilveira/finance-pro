# Sistema de Importacao CSV

O Finance Pro permite importar transacoes de extratos e faturas de bancos brasileiros. A importacao e feita inteiramente no frontend, com envio em lote ao backend.

**Arquivo principal:** `frontend/src/services/csv.ts`

---

## Formatos Suportados

| Fonte | Tipo | Separador | Formato de Data | Formato de Valor |
|---|---|---|---|---|
| Nubank Extrato | Conta Corrente | `,` (virgula) | DD/MM/YYYY | Ponto decimal (ex: `-20.00`) |
| Nubank Fatura | Cartao de Credito | `,` (virgula) | YYYY-MM-DD | Ponto decimal (ex: `39.90`) |
| Itau Extrato | Conta Corrente | `;` (ponto-e-virgula) | DD/MM/YYYY | Virgula decimal (ex: `-28,76`) |
| Itau Fatura | Cartao de Credito | `,` (virgula) | YYYY-MM-DD | Ponto decimal (ex: `31`) |

---

## Parser 1: Nubank Extrato (Conta Corrente)

**Fonte:** `NUBANK_CHECKING`

### Formato do CSV

```csv
Data,Valor,Identificador,Descrição
01/08/2025,-20.00,UUID123,Compra no débito - Supermercado
02/08/2025,3500.00,UUID456,Transferência recebida
```

### Headers Esperados

`data`, `valor`, `identificador`, `descrição` (case-insensitive)

### Regras de Parsing

- **Data:** `DD/MM/YYYY` convertido para `YYYY-MM-DD`
- **Valor:** Ponto como separador decimal, sem separador de milhar
- **Tipo:** Negativo = despesa, Positivo = receita
- **Origem:** Sempre `CASH`
- **Cartao:** Nenhum

---

## Parser 2: Nubank Fatura (Cartao de Credito)

**Fonte:** `NUBANK_CREDIT`

### Formato do CSV

```csv
date,title,amount
2025-06-14,Apple.Com/Bill,39.90
2025-06-15,Netflix,55.90
```

### Headers Esperados

`date`, `title`, `amount` (case-insensitive)

### Regras de Parsing

- **Data:** Ja em formato `YYYY-MM-DD`
- **Valor:** Ponto como separador decimal
- **Tipo:** Sempre `expense` (compras no cartao sao despesas)
- **Origem:** Sempre `CREDIT_CARD`
- **Cartao:** Sempre `"Nubank"`

---

## Parser 3: Itau Extrato (Conta Corrente)

**Fonte:** `ITAU_CHECKING`

### Formato do CSV

```csv
Data;Descricao;Valor
05/06/2025;Pagamento Conta;-28,76
06/06/2025;Credito Salario;5.500,00
```

### Headers Esperados

`data`, `descricao`, `valor` (case-insensitive, separados por `;`)

### Regras de Parsing

- **Separador:** Ponto-e-virgula (`;`)
- **Data:** `DD/MM/YYYY` convertido para `YYYY-MM-DD`
- **Valor:** Formato brasileiro - ponto como separador de milhar, virgula como decimal
  - Ex: `5.500,00` -> `5500.00`
  - Ex: `-28,76` -> `-28.76`
- **Tipo:** Negativo = despesa, Positivo = receita
- **Origem:** Sempre `CASH`
- **Cartao:** Nenhum

---

## Parser 4: Itau Fatura (Cartao de Credito)

**Fonte:** `ITAU_CREDIT`

### Formato do CSV

```csv
data,lançamento,valor
2025-11-12,MP *NOVAPOINT,31
2025-11-13,SPOTIFY,21.90
```

### Headers Esperados

`data`, `lançamento`, `valor` (case-insensitive)

### Regras de Parsing

- **Data:** Ja em formato `YYYY-MM-DD`
- **Valor:** Ponto como separador decimal
- **Tipo:** Sempre `expense`
- **Origem:** Sempre `CREDIT_CARD`
- **Cartao:** Sempre `"Itaú"`

---

## Fluxo Completo de Importacao

```
1. Usuario abre ImportCSVModal
2. Seleciona banco (Nubank ou Itau)
3. Seleciona arquivo CSV
4. Clica "Importar"
   │
   ├── Frontend le o arquivo como texto
   ├── Busca correcoes de categoria do usuario (API)
   ├── Busca categorias com keywords do banco (API)
   │
   ├── parseCSV(texto, fonte, correcoes, categorias)
   │   ├── Identifica formato pelo header
   │   ├── Parseia cada linha
   │   ├── Para cada transacao:
   │   │   ├── Converte data para YYYY-MM-DD
   │   │   ├── Converte valor para numero positivo
   │   │   ├── Determina tipo (income/expense)
   │   │   ├── predictCategory(descricao, correcoes, categorias)
   │   │   └── Monta CreateTransactionPayload
   │   └── Retorna array de payloads
   │
   ├── batchCreateTransactions(payloads) -> POST /transactions/batch
   │   ├── Backend valida cada transacao (Zod)
   │   ├── Resolve categoria (chave ou nome)
   │   ├── Gera idempotencyKey (hash de data+descricao+valor)
   │   ├── insertMany com ordered: false
   │   └── Retorna: success, duplicates, failed, errors
   │
   ├── Exibe resumo ao usuario
   ├── Se houver erros, oferece download do log
   └── Refetch das transacoes
```

---

## Auto-Categorizacao durante Import

Cada transacao importada e auto-categorizada pela funcao `predictCategory()` do `categoryPredictor.ts`:

1. **Correcoes do usuario** - Se a descricao contem um padrao de correcao salvo
2. **Metodos de pagamento** - PIX, PAGAMENTO, etc. -> "A Categorizar"
3. **Keywords de categorias** - Comparacao com palavras-chave do banco
4. **Fallback** - "Outros"

Veja [categories.md](./categories.md) para detalhes completos.

---

## Prevencao de Duplicatas

O backend gera um `idempotencyKey` para cada transacao baseado em:
- Data da transacao
- Descricao
- Valor

Se uma transacao com a mesma chave ja existe no banco, ela e ignorada (indice unico no MongoDB). O resultado do batch retorna o numero de duplicatas ignoradas.

---

## Tratamento de Erros

### Erros de Parsing

- Linhas com valores invalidos (NaN, zero) sao ignoradas com `console.warn`
- Formatos nao reconhecidos lancam `Error` com mensagem descritiva

### Erros de Validacao (Backend)

- Cada transacao e validada individualmente pelo schema Zod
- Erros de validacao sao coletados com indice da linha
- O batch continua apos erros (`ordered: false`)

### Log de Erros

Se houver erros, o usuario pode baixar um arquivo de log contendo:
- Numero da linha no CSV
- Descricao da transacao
- Valor e tipo
- Mensagem de erro
- Dados completos da transacao

---

## Exportacao CSV

### `exportTransactionsToCSV(transactions: Transaction[]): void`

Exporta as transacoes filtradas como CSV.

**Colunas:** ID, Data, Descricao, Valor, Tipo, Categoria, Origem, Cartao, Criado em

**Comportamento:**
- Campos com virgula, aspas ou quebra de linha sao escapados com aspas duplas
- Download automatico como `transacoes_YYYY-MM-DD.csv`
- Alerta se nao houver transacoes

---

## Template de Importacao

### `downloadCSVTemplate(): void`

Gera arquivo modelo com exemplos de todos os 4 formatos:

```
# NUBANK - EXTRATO (Conta Corrente)
Data,Valor,Identificador,Descrição
01/08/2025,-20.00,UUID123,Compra no débito - Supermercado

# ITAÚ - EXTRATO (Conta Corrente)
Data;Descricao;Valor
05/06/2025;Pagamento Conta;-28,76

# NUBANK - FATURA (Cartão de Crédito)
date,title,amount
2025-06-14,Apple.Com/Bill,39.90

# ITAÚ - FATURA (Cartão de Crédito)
data,lançamento,valor
2025-11-12,MP *NOVAPOINT,31
```

Download como `modelo_importacao.csv`.
