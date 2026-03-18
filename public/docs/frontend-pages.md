# Paginas do Frontend

Todas as paginas usam `"use client"` e estao dentro de `frontend/src/app/`. O layout raiz (`layout.tsx`) envolve tudo com `QueryProvider`, `ThemeProvider` e `AppShell`.

---

## Layout Raiz

**Arquivo:** `frontend/src/app/layout.tsx`

Estrutura de providers:

```
<html lang="pt-BR">
  <body className={poppins}>
    <QueryProvider>          // React Query
      <ThemeProvider>         // Forca dark mode
        <AppShell>            // Sidebar + conteudo
          {children}
        </AppShell>
      </ThemeProvider>
    </QueryProvider>
  </body>
</html>
```

- Fonte: Poppins (Google Fonts, pesos 300-700)
- Metadata: titulo "Finance Pro", descricao "Controle financeiro pessoal inteligente"
- O `AppShell` renderiza a `Sidebar` em todas as paginas exceto a landing page (`/`)

---

## Dashboard (`/dashboard`)

**Arquivo:** `frontend/src/app/dashboard/page.tsx`

Visao geral das financas do usuario com metricas e graficos.

### Dados

Usa `useAllTransactions()` para buscar todas as transacoes. Todos os calculos sao feitos client-side.

### Metricas Exibidas

**Cards principais (primeira linha):**
- Total de transacoes
- Total de receitas (periodo completo)
- Total de despesas (periodo completo)
- Maior gasto do mes (categoria com maior despesa no mes atual)

**Cards secundarios (segunda linha):**
- Taxa de economia (% de receita poupada)
- Despesas do mes atual (com variacao % vs mes anterior)
- Media diaria de gastos (mes atual / dias passados)
- Gastos fixos (categorias: Contas, Assinaturas, Aluguel)

### Graficos

- **Tendencia Mensal:** Grafico de linha (Line) com receitas vs despesas dos ultimos 6 meses
- **Despesas por Categoria:** Grafico de rosca (Doughnut) com breakdown por categoria

### Transacoes Recentes

Lista as 5 transacoes mais recentes ordenadas por data, com link para a pagina de transacoes.

### Bibliotecas

Chart.js com registros: CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend.

---

## Transacoes (`/transactions`)

**Arquivo:** `frontend/src/app/transactions/page.tsx`

Pagina principal de gerenciamento de transacoes. A mais complexa do sistema.

### Funcionalidades

- **CRUD completo** de transacoes (criar, listar, editar, excluir)
- **Filtros persistidos** (busca por texto, tipo, categoria, origem, cartao, periodo)
- **Paginacao server-side** quando sem filtros ativos
- **Filtragem client-side** quando filtros estao ativos
- **Exportacao CSV** das transacoes filtradas
- **Importacao CSV** de faturas de banco (Nubank, Itau)
- **Reprocessamento de categorias** em lote
- **Gerenciamento de categorias** (CRUD)

### Hooks Utilizados

| Hook | Descricao |
|---|---|
| `usePaginatedTransactions()` | Transacoes com paginacao server-side |
| `useAllTransactions()` | Todas as transacoes (para filtros client-side) |
| `useDeleteTransaction()` | Mutation de exclusao |
| `useTransactionStats()` | Estatisticas server-side |
| `usePersistedFilters()` | Filtros salvos em localStorage |

### Filtros Disponiveis

| Filtro | Tipo | Persistido |
|---|---|---|
| Busca por descricao | texto livre | Sim |
| Tipo | income / expense / all | Sim |
| Categoria | dropdown dinamico | Sim |
| Origem | CREDIT_CARD / CASH / all | Sim |
| Cartao | dropdown dinamico | Sim |
| Periodo (de/ate) | seletor de mes | Sim |
| Itens por pagina | 5 / 10 / 25 | Sim |

### Estrategia de Dados

- **Sem filtros ativos:** Usa paginacao server-side (`usePaginatedTransactions`)
- **Com filtros ativos:** Filtra client-side a partir de `useAllTransactions`, exibe tudo sem paginacao
- **Estatisticas:** Usa `getTransactionStats()` (server-side) quando so ha filtros de periodo; calcula client-side quando ha filtros de texto/tipo/categoria

### Componentes Utilizados

- `AddTransactionModal` - Criar transacao
- `EditTransactionModal` - Editar transacao
- `ImportCSVModal` - Importar CSV
- `ManageCategoriesModal` - Gerenciar categorias
- `TransactionTable` - Tabela com ordenacao
- `DevTools` - Ferramentas de desenvolvimento
- `Pagination` (UI) - Paginacao

### Fluxo de Importacao CSV

1. Usuario clica "Importar CSV" -> abre `ImportCSVModal`
2. Seleciona banco (Nubank/Itau) e arquivo CSV
3. Sistema busca correcoes de categoria e regras do banco
4. Parseia CSV com `parseCSV()` usando o parser correto
5. Envia em lote via `batchCreateTransactions()`
6. Exibe resumo (sucesso, duplicatas, erros)
7. Oferece download do log de erros se houver falhas

---

## Transacoes Recorrentes (`/recurring`)

**Arquivo:** `frontend/src/app/recurring/page.tsx`

Gerenciamento de transacoes recorrentes (contas mensais, salario, etc.).

### Armazenamento

**Importante:** Dados armazenados exclusivamente em `localStorage`. Nenhuma chamada ao backend.

### Funcionalidades

- Criar template de transacao recorrente
- Listar em grid de cards (1-3 colunas responsivo)
- Ativar/desativar template (sem excluir)
- Excluir template
- Gerar transacao real a partir do template (chama API `createTransaction`)

### Campos do Template

| Campo | Tipo | Obrigatorio |
|---|---|---|
| Descricao | texto | Sim |
| Valor | numero | Sim |
| Tipo | income / expense | Sim |
| Categoria | texto | Sim |
| Frequencia | daily / weekly / monthly / yearly | Sim |
| Origem | CREDIT_CARD / CASH | Sim |
| Cartao | texto | Nao |
| Data de inicio | data | Sim |
| Data de termino | data | Nao |

### Geracao Manual

Ao clicar "Gerar Transacao Agora", o sistema cria uma transacao real via API com a data atual (`YYYY-MM-DD`). A geracao e manual, nao automatica.

---

## Analises (`/analytics`)

**Arquivo:** `frontend/src/app/analytics/page.tsx`

Pagina de analises e insights sobre padroes de gastos.

### Filtro de Periodo

Tres opcoes: Todos | Ultimo Mes | Ultimo Trimestre

### Metricas

- Total de despesas no periodo
- Total de receitas no periodo
- Variacao percentual vs periodo anterior (somente quando periodo selecionado)

### Graficos

- **Distribuicao por Categoria:** Grafico de barras (Bar) com gastos por categoria
- **Comparacao Mensal:** Grafico de barras agrupado com receitas vs despesas (ultimos 6 meses)

### Detalhamento por Categoria

Lista de todas as categorias de despesa com:
- Numero de transacoes
- Valor total
- Media por transacao
- Percentual do total
- Barra de progresso visual

### Maiores Despesas

Top 10 maiores despesas individuais, ordenadas por valor, com ranking visual.

---

## Orcamento (`/budget`)

**Arquivo:** `frontend/src/app/budget/page.tsx`

Definicao de orcamentos por categoria e metas financeiras.

### Armazenamento

Orcamentos e metas sao armazenados em `localStorage` (chaves: `budgets` e `goals`).

### Orcamentos Mensais

- Definir limite mensal por categoria (ex: "Alimentacao: R$ 1.000")
- Visualizacao com barra de progresso colorida:
  - **Verde:** Dentro do orcamento (< 80%)
  - **Amarelo:** Atencao (80-100%)
  - **Vermelho:** Acima do limite (> 100%)
- Alerta de categorias com gastos mas sem orcamento definido
- Orcamentos padrao ao primeiro acesso: Alimentacao (R$ 1.000), Transporte (R$ 500), Contas (R$ 800)

### Metas Financeiras

- Definir meta com nome, valor alvo, valor atual e prazo
- Visualizacao com:
  - Barra de progresso (% do alvo)
  - Valor faltante
  - Dias restantes (destaque vermelho se < 30 dias)

### Dados de Transacoes

Usa `useAllTransactions()` para calcular os gastos reais do mes atual por categoria e comparar com os orcamentos definidos.
