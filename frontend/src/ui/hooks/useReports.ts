// src/ui/hooks/useReports.ts
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportData, setSelectedMonthYear } from "@/store/reports/reportsSlice";
import {
	selectAverageDailySpending,
	selectCategoryBreakdown,
	selectExpenseCategories,
	selectIncomeCategories,
	selectMonthlyTrends,
	selectReportData,
	selectReportsError,
	selectReportsLoading,
	selectSelectedMonthYear,
	selectTopTransactions,
} from "@/store/reports/selectors";
import type { AppDispatch } from "@/store/store";

export function useReports(monthYear?: string) {
	const dispatch = useDispatch<AppDispatch>();

	const reportData = useSelector(selectReportData);
	const monthlyTrends = useSelector(selectMonthlyTrends);
	const categoryBreakdown = useSelector(selectCategoryBreakdown);
	const topTransactions = useSelector(selectTopTransactions);
	const averageDailySpending = useSelector(selectAverageDailySpending);
	const incomeCategories = useSelector(selectIncomeCategories);
	const expenseCategories = useSelector(selectExpenseCategories);
	const loading = useSelector(selectReportsLoading);
	const error = useSelector(selectReportsError);
	const selectedMonthYear = useSelector(selectSelectedMonthYear);

	const userId = process.env.NEXT_PUBLIC_USER_ID || "dev-user";

	useEffect(() => {
		if (monthYear && monthYear !== selectedMonthYear) {
			dispatch(setSelectedMonthYear(monthYear));
		}
		dispatch(
			fetchReportData({
				userId,
				monthYear: monthYear || selectedMonthYear || "all",
			}),
		);
	}, [dispatch, monthYear, selectedMonthYear, userId]);

	return {
		reportData,
		monthlyTrends,
		categoryBreakdown,
		topTransactions,
		averageDailySpending,
		incomeCategories,
		expenseCategories,
		loading,
		error,
		selectedMonthYear,
		refetch: () =>
			dispatch(
				fetchReportData({
					userId,
					monthYear: monthYear || selectedMonthYear || "all",
				}),
			),
	};
}
