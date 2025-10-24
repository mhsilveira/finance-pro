import { configureStore, combineReducers } from '@reduxjs/toolkit';
import transactionsReducer from './transactions/transactionsSlice';
import filtersReducer from './transactions/filtersSlice';
import categoriesReducer from './categories/categoriesSlice';
import reportsReducer from './reports/reportsSlice';
import dashboardReducer from './dashboard/dashboardSlice';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

const rootReducer = combineReducers({
  transactions: transactionsReducer,
  filters: filtersReducer,
  categories: categoriesReducer,
  reports: reportsReducer,
  dashboard: dashboardReducer,
});

const persistConfig = {
  key: 'finance-pro',
  storage,
  whitelist: ['transactions', 'filters', 'categories'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;