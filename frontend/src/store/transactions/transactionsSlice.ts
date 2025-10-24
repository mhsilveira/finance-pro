import { createSlice, createAsyncThunk, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { mockService, Transaction } from '@/services/mockData';

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

// Mock async calls via MockService
export const fetchTransactions = createAsyncThunk<Transaction[]>(
  'transactions/fetchAll',
  async () => {
    return await mockService.getTransactions();
  }
);

export const addTransaction = createAsyncThunk<Transaction, Omit<Transaction, 'id'>>(
  'transactions/add',
  async (data) => {
    return await mockService.addTransaction(data);
  }
);

export const updateTransaction = createAsyncThunk<Transaction, Transaction>(
  'transactions/update',
  async (data) => {
    return await mockService.updateTransaction(data);
  }
);

export const removeTransaction = createAsyncThunk<string, string>(
  'transactions/remove',
  async (id) => {
    await mockService.deleteTransaction(id);
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