# Componentes do Frontend

Localizados em `frontend/src/components/`. Todos sao client components (`"use client"`).

---

## AppShell

**Arquivo:** `frontend/src/components/AppShell.tsx`

Componente de layout principal que envolve todas as paginas (exceto a landing page).

**Comportamento:**
- Se a rota atual e `/` (landing page), renderiza apenas o `children` sem sidebar
- Para qualquer outra rota, envolve com `SidebarProvider` e renderiza `Sidebar` + conteudo
- O conteudo principal tem `padding-left` dinamico que se ajusta ao estado da sidebar (colapsada: 16 = 4rem, expandida: 60 = 15rem)
- Transicao suave de 200ms no padding

**Componentes internos:**
- `AppContent` - Componente que usa o contexto da sidebar para ajustar o layout

---

## Sidebar

**Arquivo:** `frontend/src/components/Sidebar.tsx`

Barra de navegacao lateral responsiva com suporte a desktop e mobile.

### Itens de Navegacao

| Rota | Label | Icone |
|---|---|---|
| `/dashboard` | Dashboard | `LayoutDashboard` |
| `/transactions` | Transacoes | `Receipt` |
| `/recurring` | Recorrentes | `Repeat` |
| `/analytics` | Analises | `BarChart3` |
| `/budget` | Orcamento | `Target` |

### Desktop

- Sidebar fixa a esquerda com largura de 60 (expandida) ou 16 (colapsada)
- Logo "Finance Pro" com icone Wallet em fundo amarelo
- Indicador visual de rota ativa (barra amarela lateral + cor amber)
- Tooltip com nome da pagina quando colapsada (aparece no hover)
- Botao de colapsar/expandir no rodape
- Transicao suave de largura (200ms)

### Mobile

- Header fixo no topo (h-14) com botao hamburguer e logo
- Sidebar abre como overlay com backdrop blur
- Botao X para fechar
- Clique no backdrop fecha a sidebar
- Clique em item de navegacao fecha a sidebar automaticamente

### Icones

Usa `lucide-react`: LayoutDashboard, Receipt, Repeat, BarChart3, Target, ChevronLeft, ChevronRight, X, Menu, Wallet.

---

## SidebarContext

**Arquivo:** `frontend/src/components/SidebarContext.tsx`

Contexto React para o estado da sidebar.

### Estado

| Campo | Tipo | Descricao |
|---|---|---|
| `collapsed` | `boolean` | Se a sidebar esta colapsada (desktop) |
| `mobileOpen` | `boolean` | Se a sidebar esta aberta (mobile) |

### Persistencia

O estado `collapsed` e salvo em `localStorage` (chave: `sidebar-collapsed`) e restaurado ao montar.

### Hook

```typescript
const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
```

Lanca erro se usado fora do `SidebarProvider`.

---

## AddTransactionModal

**Arquivo:** `frontend/src/components/AddTransactionModal.tsx`

Modal para criar uma nova transacao. Usa Radix UI Dialog.

### Props

| Prop | Tipo | Descricao |
|---|---|---|
| `userId` | `string` | ID do usuario |
| `onSuccess` | `() => void` | Callback apos criar com sucesso |

### Campos do Formulario

- **Descricao** (texto, obrigatorio)
- **Valor** (numero, step 0.01, obrigatorio)
- **Tipo** (radio: Despesa / Receita)
- **Origem** (select: Dinheiro / Cartao de Credito)
- **Cartao** (texto, condicional - so aparece quando origem = Cartao)
- **Categoria** (select dinamico - carrega do backend via `useCategories()`, filtra por tipo)
- **Data** (date picker, default: hoje)

### Comportamento

- Usa `useCreateTransaction()` mutation do React Query
- Categorias sao carregadas do backend; fallback para constante `CATEGORIES` se API falhar
- Filtra categorias pelo tipo selecionado (income/expense/both)
- Reseta formulario apos sucesso
- Exibe erro inline se a criacao falhar

---

## EditTransactionModal

**Arquivo:** `frontend/src/components/EditTransactionModal.tsx`

Modal para editar uma transacao existente. Semelhante ao `AddTransactionModal`.

### Props

| Prop | Tipo | Descricao |
|---|---|---|
| `transaction` | `Transaction` | Transacao sendo editada |
| `userId` | `string` | ID do usuario |
| `open` | `boolean` | Controlado externamente |
| `onOpenChange` | `(open: boolean) => void` | Callback de visibilidade |
| `onSuccess` | `() => void` | Callback apos editar |

### Comportamento Especial

- Pre-popula todos os campos com os dados da transacao
- Ao salvar com categoria diferente da original, salva automaticamente uma **correcao de categoria** via `saveCategoryCorrection()`. Isso melhora a auto-categorizacao futura de transacoes com a mesma descricao.
- Usa `useUpdateTransaction()` mutation

---

## ImportCSVModal

**Arquivo:** `frontend/src/components/ImportCSVModal.tsx`

Modal para importar faturas CSV de bancos brasileiros.

### Props

| Prop | Tipo | Descricao |
|---|---|---|
| `isOpen` | `boolean` | Visibilidade |
| `onClose` | `() => void` | Fechar modal |
| `onImport` | `(file: File, source: CSVSource) => void` | Callback de importacao |
| `isImporting` | `boolean` | Estado de carregamento |

### Interface

1. Selecao de banco (Nubank ou Itau) com botoes visuais
2. Upload de arquivo CSV (input file com accept=".csv")
3. Preview do nome do arquivo selecionado
4. Botoes Cancelar / Importar

### Tipo CSVSource

Exporta o tipo `CSVSource = "NUBANK_CREDIT" | "ITAU_CREDIT"`.

**Nota:** A logica de parsing e feita na pagina de transacoes, nao neste componente.

---

## ManageCategoriesModal

**Arquivo:** `frontend/src/components/ManageCategoriesModal.tsx`

Modal para CRUD completo de categorias.

### Funcionalidades

- Listar todas as categorias do banco com cor, icone, tipo e keywords
- Filtrar por tipo (Todas / Receitas / Despesas / Ambos)
- Criar nova categoria com: chave, nome, tipo, icone, cor, palavras-chave, prioridade
- Editar categoria existente (todos os campos exceto chave)
- Excluir categoria (com confirmacao)

### Campos da Categoria

| Campo | Descricao |
|---|---|
| Chave | Identificador unico (ex: FOOD), auto-uppercase |
| Nome | Nome de exibicao (ex: Alimentacao) |
| Tipo | income / expense / both |
| Icone | Emoji (ex: 🍔) |
| Cor | Hex color picker |
| Palavras-chave | Lista separada por virgula, auto-uppercase (usadas na auto-categorizacao) |
| Prioridade | Numero (menor = maior prioridade na auto-categorizacao) |

### Hooks

- `useCategories()` - Carrega categorias do backend
- `useQueryClient()` - Invalida cache apos operacoes

---

## TransactionTable

**Arquivo:** `frontend/src/components/TransactionTable.tsx`

Tabela de transacoes com ordenacao por coluna.

### Props

| Prop | Tipo | Descricao |
|---|---|---|
| `transactions` | `Transaction[]` | Lista de transacoes |
| `onDelete` | `(id: string) => void` | Callback de exclusao |
| `onEdit` | `(transaction: Transaction) => void` | Callback de edicao |

### Colunas

| Coluna | Ordenavel | Descricao |
|---|---|---|
| Descricao | Sim | Nome + cartao (se houver) |
| Categoria | Sim | Badge com nome da categoria |
| Tipo | Sim | Badge colorido (Receita verde / Despesa vermelho) |
| Origem | Sim | "Cartao" ou "Dinheiro" |
| Valor | Sim (default desc) | Formatado em BRL com sinal |
| Data | Sim | Formato DD/MM/YYYY |
| Acoes | Nao | Botoes editar e excluir |

### Ordenacao

- Clique na coluna alterna entre ascendente e descendente
- Default: valor decrescente
- Icones visuais indicam direcao atual (CaretUp/CaretDown/CaretSort)
- Ordenacao memoizada com `useMemo`

### Rodape

Exibe sumario: total de transacoes, receitas, despesas e saldo.

### Estado Vazio

Quando nao ha transacoes, exibe mensagem com icone SVG.

---

## TransactionCard

**Arquivo:** `frontend/src/components/TransactionCard.tsx`

Componente simples para exibir uma transacao em formato de card. Usa inline styles.

**Props:** `{ t: Transaction }` (descricao, valor, tipo, data)

Exibe descricao, data, e valor com cor (verde para receita, vermelho para despesa).

---

## DevTools

**Arquivo:** `frontend/src/components/DevTools.tsx`

Ferramentas de desenvolvimento acessiveis via botao flutuante no canto inferior direito.

### Funcionalidades

- **Seed:** Cria 30 transacoes de exemplo cobrindo varias categorias (salario, aluguel, alimentacao, transporte, saude, educacao, lazer, compras, assinaturas, gastos gerais)
- **Limpar Tudo:** Exclui todas as transacoes do usuario (com confirmacao dupla)

### Interface

- Botao roxo flutuante com emoji 🛠️
- Ao clicar, abre painel com dois botoes (Seed verde, Limpar vermelho)
- Ambos com confirmacao antes de executar
- Indicador de carregamento durante operacao

---

## ThemeProvider

**Arquivo:** `frontend/src/components/ThemeProvider.tsx`

Provider de tema que forca dark mode permanentemente.

- Adiciona classe `dark` ao `<html>` no mount
- Expoe contexto com `theme: "dark"` e `mounted: boolean`
- Hook `useTheme()` para acessar o contexto

**Nota:** Nao ha toggle de tema. O app e sempre dark mode.

---

## QueryProvider

**Arquivo:** `frontend/src/components/QueryProvider.tsx`

Provider do React Query com configuracao padrao.

### Configuracoes

| Opcao | Valor | Descricao |
|---|---|---|
| `staleTime` | 60s (1 minuto) | Tempo ate os dados serem considerados "velhos" |
| `gcTime` | 300s (5 minutos) | Tempo de cache (garbage collection) |
| `refetchOnWindowFocus` | `false` | Nao refetch ao focar a janela |
| `retry` | 1 | Uma tentativa de retry em caso de erro |

---

## Navbar

**Arquivo:** `frontend/src/components/Navbar.tsx`

Componente de navegacao legado. Substituido pelo `Sidebar` + `AppShell`.
