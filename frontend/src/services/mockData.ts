import { nanoid } from '@reduxjs/toolkit';

// Tipos expandidos para o sistema completo
export type Transaction = {
  id: string;
  date: string;
  monthYear: string; // YYYY-MM
  name: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  tags?: string[];
  recurring?: boolean;
  recurringType?: 'monthly' | 'weekly' | 'yearly';
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  budget?: number; // orçamento mensal opcional
};

export type Budget = {
  id: string;
  categoryId: string;
  monthYear: string; // YYYY-MM
  amount: number;
  spent: number;
};

export type ReportData = {
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
};

// Dados mock realistas
const categories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', color: '#3ddc97', icon: '💰' },
  { id: '2', name: 'Freelance', type: 'income', color: '#6ca1ff', icon: '💼' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#ffd93d', icon: '📈' },
  { id: '4', name: 'Alimentação', type: 'expense', color: '#ff6b6b', icon: '🍕' },
  { id: '5', name: 'Moradia', type: 'expense', color: '#8b5cf6', icon: '🏠' },
  { id: '6', name: 'Transporte', type: 'expense', color: '#06b6d4', icon: '🚗' },
  { id: '7', name: 'Lazer', type: 'expense', color: '#f59e0b', icon: '🎬' },
  { id: '8', name: 'Saúde', type: 'expense', color: '#ef4444', icon: '🏥' },
  { id: '9', name: 'Educação', type: 'expense', color: '#10b981', icon: '📚' },
  { id: '10', name: 'Outros', type: 'expense', color: '#6b7280', icon: '📦' },
];

// Dados fixos para testes consistentes
const mockTransactionsData: Transaction[] = [
  // Janeiro 2024
  { id: '1', date: '2024-01-05T10:00:00.000Z', monthYear: '2024-01', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '2', date: '2024-01-10T14:30:00.000Z', monthYear: '2024-01', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 450, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '3', date: '2024-01-15T09:15:00.000Z', monthYear: '2024-01', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '4', date: '2024-01-20T16:45:00.000Z', monthYear: '2024-01', name: 'Uber', description: 'Viagem para trabalho', category: 'Transporte', amount: 120, type: 'expense' },
  { id: '5', date: '2024-01-25T19:30:00.000Z', monthYear: '2024-01', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '6', date: '2024-01-28T11:20:00.000Z', monthYear: '2024-01', name: 'Freelance Web', description: 'Projeto pontual', category: 'Freelance', amount: 2500, type: 'income' },

  // Fevereiro 2024
  { id: '7', date: '2024-02-05T10:00:00.000Z', monthYear: '2024-02', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '8', date: '2024-02-08T15:30:00.000Z', monthYear: '2024-02', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 420, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '9', date: '2024-02-10T12:00:00.000Z', monthYear: '2024-02', name: 'Restaurante', description: 'Jantar com amigos', category: 'Alimentação', amount: 180, type: 'expense' },
  { id: '10', date: '2024-02-15T09:15:00.000Z', monthYear: '2024-02', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '11', date: '2024-02-18T14:20:00.000Z', monthYear: '2024-02', name: 'Gasolina', description: 'Abastecimento', category: 'Transporte', amount: 200, type: 'expense' },
  { id: '12', date: '2024-02-22T20:00:00.000Z', monthYear: '2024-02', name: 'Cinema', description: 'Ingresso de filme', category: 'Lazer', amount: 60, type: 'expense' },
  { id: '13', date: '2024-02-25T19:30:00.000Z', monthYear: '2024-02', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '14', date: '2024-02-28T13:45:00.000Z', monthYear: '2024-02', name: 'Dividendos', description: 'Rendimentos de investimentos', category: 'Investimentos', amount: 300, type: 'income', recurring: true, recurringType: 'monthly' },

  // Março 2024
  { id: '15', date: '2024-03-05T10:00:00.000Z', monthYear: '2024-03', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '16', date: '2024-03-12T16:30:00.000Z', monthYear: '2024-03', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 480, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '17', date: '2024-03-15T09:15:00.000Z', monthYear: '2024-03', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '18', date: '2024-03-15T09:15:00.000Z', monthYear: '2024-03', name: 'Condomínio', description: 'Taxa mensal', category: 'Moradia', amount: 400, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '19', date: '2024-03-18T11:30:00.000Z', monthYear: '2024-03', name: 'Farmácia', description: 'Medicamentos', category: 'Saúde', amount: 80, type: 'expense' },
  { id: '20', date: '2024-03-22T15:45:00.000Z', monthYear: '2024-03', name: 'Curso Online', description: 'Curso de programação', category: 'Educação', amount: 299, type: 'expense' },
  { id: '21', date: '2024-03-25T19:30:00.000Z', monthYear: '2024-03', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '22', date: '2024-03-28T13:45:00.000Z', monthYear: '2024-03', name: 'Dividendos', description: 'Rendimentos de investimentos', category: 'Investimentos', amount: 300, type: 'income', recurring: true, recurringType: 'monthly' },

  // Abril 2024
  { id: '23', date: '2024-04-05T10:00:00.000Z', monthYear: '2024-04', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '24', date: '2024-04-10T14:15:00.000Z', monthYear: '2024-04', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 520, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '25', date: '2024-04-15T09:15:00.000Z', monthYear: '2024-04', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '26', date: '2024-04-15T09:15:00.000Z', monthYear: '2024-04', name: 'Condomínio', description: 'Taxa mensal', category: 'Moradia', amount: 400, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '27', date: '2024-04-20T17:30:00.000Z', monthYear: '2024-04', name: 'Uber', description: 'Viagem para aeroporto', category: 'Transporte', amount: 150, type: 'expense' },
  { id: '28', date: '2024-04-25T19:30:00.000Z', monthYear: '2024-04', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '29', date: '2024-04-28T13:45:00.000Z', monthYear: '2024-04', name: 'Dividendos', description: 'Rendimentos de investimentos', category: 'Investimentos', amount: 300, type: 'income', recurring: true, recurringType: 'monthly' },

  // Maio 2024
  { id: '30', date: '2024-05-05T10:00:00.000Z', monthYear: '2024-05', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '31', date: '2024-05-08T15:20:00.000Z', monthYear: '2024-05', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 380, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '32', date: '2024-05-12T18:45:00.000Z', monthYear: '2024-05', name: 'Restaurante', description: 'Jantar romântico', category: 'Alimentação', amount: 220, type: 'expense' },
  { id: '33', date: '2024-05-15T09:15:00.000Z', monthYear: '2024-05', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '34', date: '2024-05-15T09:15:00.000Z', monthYear: '2024-05', name: 'Condomínio', description: 'Taxa mensal', category: 'Moradia', amount: 400, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '35', date: '2024-05-18T12:30:00.000Z', monthYear: '2024-05', name: 'Gasolina', description: 'Abastecimento', category: 'Transporte', amount: 180, type: 'expense' },
  { id: '36', date: '2024-05-22T20:15:00.000Z', monthYear: '2024-05', name: 'Cinema', description: 'Ingresso de filme', category: 'Lazer', amount: 60, type: 'expense' },
  { id: '37', date: '2024-05-25T19:30:00.000Z', monthYear: '2024-05', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '38', date: '2024-05-28T13:45:00.000Z', monthYear: '2024-05', name: 'Dividendos', description: 'Rendimentos de investimentos', category: 'Investimentos', amount: 300, type: 'income', recurring: true, recurringType: 'monthly' },

  // Junho 2024 (mês atual)
  { id: '39', date: '2024-06-05T10:00:00.000Z', monthYear: '2024-06', name: 'Salário', description: 'Pagamento mensal', category: 'Salário', amount: 8000, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '40', date: '2024-06-10T16:45:00.000Z', monthYear: '2024-06', name: 'Supermercado', description: 'Compras da semana', category: 'Alimentação', amount: 460, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '41', date: '2024-06-12T19:20:00.000Z', monthYear: '2024-06', name: 'Restaurante', description: 'Almoço de negócios', category: 'Alimentação', amount: 95, type: 'expense' },
  { id: '42', date: '2024-06-15T09:15:00.000Z', monthYear: '2024-06', name: 'Aluguel', description: 'Pagamento mensal', category: 'Moradia', amount: 3000, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '43', date: '2024-06-15T09:15:00.000Z', monthYear: '2024-06', name: 'Condomínio', description: 'Taxa mensal', category: 'Moradia', amount: 400, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '44', date: '2024-06-18T14:30:00.000Z', monthYear: '2024-06', name: 'Uber', description: 'Viagem para shopping', category: 'Transporte', amount: 85, type: 'expense' },
  { id: '45', date: '2024-06-20T11:15:00.000Z', monthYear: '2024-06', name: 'Farmácia', description: 'Medicamentos', category: 'Saúde', amount: 120, type: 'expense' },
  { id: '46', date: '2024-06-25T19:30:00.000Z', monthYear: '2024-06', name: 'Netflix', description: 'Assinatura mensal', category: 'Lazer', amount: 45, type: 'expense', recurring: true, recurringType: 'monthly' },
  { id: '47', date: '2024-06-28T13:45:00.000Z', monthYear: '2024-06', name: 'Dividendos', description: 'Rendimentos de investimentos', category: 'Investimentos', amount: 300, type: 'income', recurring: true, recurringType: 'monthly' },
  { id: '48', date: '2024-06-30T16:20:00.000Z', monthYear: '2024-06', name: 'Freelance Design', description: 'Projeto de logo', category: 'Freelance', amount: 1800, type: 'income' },
];

// Mock Service centralizado
export class MockService {
  private transactions: Transaction[] = [...mockTransactionsData];
  private categories: Category[] = categories;

  // Simular latência de rede
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === TRANSACTIONS ===
  async getTransactions(): Promise<Transaction[]> {
    await this.delay();
    return [...this.transactions];
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await this.delay();
    const newTransaction: Transaction = {
      id: nanoid(),
      ...transaction,
    };
    this.transactions.unshift(newTransaction);
    return newTransaction;
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    await this.delay();
    const index = this.transactions.findIndex(t => t.id === transaction.id);
    if (index === -1) throw new Error('Transaction not found');
    this.transactions[index] = transaction;
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.delay();
    this.transactions = this.transactions.filter(t => t.id !== id);
  }

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    await this.delay(100);
    return [...this.categories];
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
    await this.delay(100);
    return this.categories.filter(c => c.type === type);
  }

  // === REPORTS ===
  async getReportData(monthYear?: string): Promise<ReportData> {
    await this.delay(500);
    
    const filteredTransactions = monthYear 
      ? this.transactions.filter(t => t.monthYear === monthYear)
      : this.transactions;

    // Monthly trends (últimos 6 meses)
    const monthlyTrends = this.getMonthlyTrends();
    
    // Category breakdown
    const categoryBreakdown = this.getCategoryBreakdown(filteredTransactions);
    
    // Top transactions
    const topTransactions = filteredTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    
    // Average daily spending
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const totalDays = new Set(expenseTransactions.map(t => t.date.slice(0, 10))).size;
    const averageDailySpending = totalDays > 0 
      ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / totalDays
      : 0;

    return {
      monthlyTrends,
      categoryBreakdown,
      topTransactions,
      averageDailySpending,
    };
  }

  private getMonthlyTrends() {
    const trends: ReportData['monthlyTrends'] = [];
    
    // Dados fixos para os últimos 6 meses
    const monthlyData = [
      { monthYear: '2024-01', income: 10500, expense: 3615, balance: 6885 },
      { monthYear: '2024-02', income: 8300, expense: 3905, balance: 4395 },
      { monthYear: '2024-03', income: 8300, expense: 4204, balance: 4096 },
      { monthYear: '2024-04', income: 8300, expense: 4115, balance: 4185 },
      { monthYear: '2024-05', income: 8300, expense: 4105, balance: 4195 },
      { monthYear: '2024-06', income: 10100, expense: 4205, balance: 5895 },
    ];
    
    return monthlyData;
  }

  private getCategoryBreakdown(transactions: Transaction[]) {
    const categoryMap = new Map<string, { amount: number; type: 'income' | 'expense' }>();
    
    transactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category);
      if (existing) {
        existing.amount += transaction.amount;
      } else {
        categoryMap.set(transaction.category, {
          amount: transaction.amount,
          type: transaction.type,
        });
      }
    });

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      type: data.type,
    })).sort((a, b) => b.amount - a.amount);
  }

  // === DASHBOARD STATS ===
  async getDashboardStats() {
    await this.delay(200);
    
    // Dados fixos para o mês atual (Junho 2024)
    const currentMonth = {
      income: 10100, // 8000 (salário) + 300 (dividendos) + 1800 (freelance)
      expense: 4205, // Total das despesas de junho
      balance: 5895,
    };
    
    // Comparação com mês anterior (Maio 2024)
    const lastMonth = {
      income: 8300, // 8000 (salário) + 300 (dividendos)
      expense: 4105, // Total das despesas de maio
    };
    
    const incomeChange = ((currentMonth.income - lastMonth.income) / lastMonth.income) * 100;
    const expenseChange = ((currentMonth.expense - lastMonth.expense) / lastMonth.expense) * 100;
    
    return {
      currentMonth,
      changes: {
        incomeChange: Math.round(incomeChange * 10) / 10, // Arredondar para 1 casa decimal
        expenseChange: Math.round(expenseChange * 10) / 10,
      },
      totalTransactions: 10, // Número de transações em junho
    };
  }
}

// Instância singleton do mock service
export const mockService = new MockService();
