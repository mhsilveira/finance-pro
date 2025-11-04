import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectDashboardStats = (state: RootState) => state.dashboard.stats;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;

export const selectCurrentMonthStats = createSelector(
	[selectDashboardStats],
	(stats) => stats?.currentMonth || { income: 0, expense: 0, balance: 0 },
);

export const selectChanges = createSelector(
	[selectDashboardStats],
	(stats) => stats?.changes || { incomeChange: 0, expenseChange: 0 },
);

export const selectTotalTransactions = createSelector([selectDashboardStats], (stats) => stats?.totalTransactions || 0);
