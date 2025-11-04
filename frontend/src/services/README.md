# Sistema de Mock - Finance Pro

Este sistema de mock foi criado para facilitar o desenvolvimento e testes do Finance Pro, permitindo trabalhar com dados realistas sem depender de APIs externas.

## 🚀 Características

- **Dados Realistas**: Transações geradas automaticamente para os últimos 6 meses
- **Latência Simulada**: Simula delays de rede realistas (300-500ms)
- **Dados Consistentes**: Relacionamentos entre categorias, transações e relatórios
- **Fácil Substituição**: Estrutura preparada para migração para APIs reais

## 📊 Dados Incluídos

### Transações
- **Receitas**: Salário, Freelance, Dividendos
- **Despesas**: Alimentação, Moradia, Transporte, Lazer, Saúde, Educação
- **Variação Realista**: ±5% para receitas, ±10% para despesas
- **Recorrência**: Transações mensais automáticas

### Categorias
- **10 Categorias** com cores e ícones
- **Tipos**: Income/Expense
- **Orçamentos**: Suporte a orçamentos mensais

### Relatórios
- **Tendências Mensais**: Últimos 6 meses
- **Breakdown por Categoria**: Percentuais e valores
- **Top Transações**: Maiores movimentações
- **Estatísticas**: Gasto médio diário, total de transações

## 🔧 Como Usar

### 1. Hooks Disponíveis

```typescript
// Dashboard com estatísticas
const { currentMonth, changes, totalTransactions, loading } = useDashboard();

// Relatórios com filtros
const { monthlyTrends, categoryBreakdown, topTransactions } = useReports('2024-01');

// Categorias
const categories = useSelector(selectAllCategories);
```

### 2. MockService Direto

```typescript
import { mockService } from '@/services/mockData';

// Buscar dados
const transactions = await mockService.getTransactions();
const reportData = await mockService.getReportData('2024-01');
const dashboardStats = await mockService.getDashboardStats();
```

### 3. Redux Actions

```typescript
// Transações
dispatch(fetchTransactions({ userId: process.env.NEXT_PUBLIC_USER_ID }));
dispatch(addTransaction(newTransaction));
dispatch(updateTransaction(updatedTransaction));
dispatch(removeTransaction(transactionId));

// Relatórios
dispatch(fetchReportData('2024-01'));
dispatch(setSelectedMonthYear('2024-01'));

// Dashboard
dispatch(fetchDashboardStats());
```

## 🔄 Migração para APIs Reais

### 1. Configuração

```typescript
// src/services/apiConfig.ts
export const API_CONFIG = {
  USE_MOCK: false, // Mude para false
  ENDPOINTS: {
    TRANSACTIONS: '/api/transactions',
    CATEGORIES: '/api/categories',
    REPORTS: '/api/reports',
    DASHBOARD: '/api/dashboard',
  },
};
```

### 2. Substituir MockService

```typescript
// Antes (Mock)
import { mockService } from '@/services/mockData';
const data = await mockService.getTransactions();

// Depois (API Real)
import { apiRequest } from '@/services/apiConfig';
const data = await apiRequest<Transaction[]>('/api/transactions');
```

### 3. Atualizar Redux Actions

```typescript
// Substituir implementações nos slices
export const fetchTransactions = createAsyncThunk<Transaction[]>(
  'transactions/fetchAll',
  async () => {
    // Substituir mockService.getTransactions() por:
    return await apiRequest<Transaction[]>('/api/transactions');
  }
);
```

## 📈 Estrutura de Dados

### Transaction
```typescript
{
  id: string;
  date: string;           // ISO string
  monthYear: string;      // YYYY-MM
  name: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  tags?: string[];
  recurring?: boolean;
  recurringType?: 'monthly' | 'weekly' | 'yearly';
}
```

### Category
```typescript
{
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  budget?: number;
}
```

### ReportData
```typescript
{
  monthlyTrends: Array<{
    monthYear: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    type: 'income' | 'expense';
  }>;
  topTransactions: Transaction[];
  averageDailySpending: number;
}
```

## 🎯 Benefícios

1. **Desenvolvimento Rápido**: Não precisa de backend para começar
2. **Dados Consistentes**: Relacionamentos mantidos entre entidades
3. **Testes Realistas**: Dados variados para testar edge cases
4. **Migração Suave**: Estrutura preparada para APIs reais
5. **Performance**: Dados em memória, sem latência de rede real

## 🔧 Customização

### Adicionar Novos Dados

```typescript
// Em mockData.ts, modifique generateMockTransactions()
const newExpenseData = [
  { name: 'Assinatura', category: 'Lazer', amount: 50, recurring: true },
  // ...
];
```

### Modificar Latência

```typescript
// Em MockService, ajuste os delays
private async delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Adicionar Novas Categorias

```typescript
// Em mockData.ts, adicione ao array categories
{ id: '11', name: 'Investimentos', type: 'expense', color: '#8b5cf6', icon: '📈' },
```
