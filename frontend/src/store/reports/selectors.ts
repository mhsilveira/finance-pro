import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectReportData = (state: RootState) => state.reports.data;
export const selectReportsLoading = (state: RootState) => state.reports.loading;
export const selectReportsError = (state: RootState) => state.reports.error;
export const selectSelectedMonthYear = (state: RootState) => state.reports.selectedMonthYear;

export const selectMonthlyTrends = createSelector([selectReportData], (data) => data?.monthlyTrends || []);

export const selectCategoryBreakdown = createSelector([selectReportData], (data) => data?.categoryBreakdown || []);

export const selectTopTransactions = createSelector([selectReportData], (data) => data?.topTransactions || []);

export const selectAverageDailySpending = createSelector([selectReportData], (data) => data?.averageDailySpending || 0);

export const selectIncomeCategories = createSelector([selectCategoryBreakdown], (breakdown) =>
    breakdown.filter((item) => item.type === "income"),
);

export const selectExpenseCategories = createSelector([selectCategoryBreakdown], (breakdown) =>
    breakdown.filter((item) => item.type === "expense"),
);
