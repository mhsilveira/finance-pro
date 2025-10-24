import { createSlice, createAsyncThunk, PayloadAction, nanoid } from '@reduxjs/toolkit';

export type Transaction = {
  id: string;
  date: string;      // ISO completo (mantemos para hora/min)
  monthYear: string; // YYYY-MM
  name: string;      // nome curto (ex: "Mercado Extra")
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

type TransactionsState = {
  items: Transaction[];
  loading: boolean;
  error: string | null;
};

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

// Mock async calls via Next API
export const fetchTransactions = createAsyncThunk<Transaction[]>(
  'transactions/fetchAll',
  async () => {
    const res = await fetch('/api/transactions', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  }
);

export const addTransaction = createAsyncThunk<Transaction, Omit<Transaction, 'id'>>(
  'transactions/add',
  async (data) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to add');
    return res.json();
  }
);

export const updateTransaction = createAsyncThunk<Transaction, Transaction>(
  'transactions/update',
  async (data) => {
    const res = await fetch(`/api/transactions/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
  }
);

export const removeTransaction = createAsyncThunk<string, string>(
  'transactions/remove',
  async (id) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    return id;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Exemplo de reducer sync (optimistic UI se quiser depois)
    addLocal(state, action: PayloadAction<Omit<Transaction, 'id'>>) {
      state.items.unshift({ id: nanoid(), ...action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unknown error';
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { addLocal } = transactionsSlice.actions;
export default transactionsSlice.reducer;