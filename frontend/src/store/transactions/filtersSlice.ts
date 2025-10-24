import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FiltersState = {
  query: string;
  category: string | 'all';
  type: 'all' | 'income' | 'expense';
  monthYear: 'all' | string; // 'YYYY-MM'
};

const initialState: FiltersState = {
  query: '',
  category: 'all',
  type: 'all',
  monthYear: 'all',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setCategory(state, action: PayloadAction<FiltersState['category']>) {
      state.category = action.payload;
    },
    setType(state, action: PayloadAction<FiltersState['type']>) {
      state.type = action.payload;
    },
    setMonthYear(state, action: PayloadAction<FiltersState['monthYear']>) {
      state.monthYear = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setQuery, setCategory, setType, setMonthYear, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;