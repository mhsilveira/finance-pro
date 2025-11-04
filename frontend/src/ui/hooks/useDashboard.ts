// src/ui/hooks/useDashboard.ts
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "@/store/dashboard/dashboardSlice";
import {
	selectChanges,
	selectCurrentMonthStats,
	selectDashboardError,
	selectDashboardLoading,
	selectTotalTransactions,
} from "@/store/dashboard/selectors";
import type { AppDispatch } from "@/store/store";

export function useDashboard() {
	const dispatch = useDispatch<AppDispatch>();

	const currentMonth = useSelector(selectCurrentMonthStats);
	const changes = useSelector(selectChanges);
	const totalTransactions = useSelector(selectTotalTransactions);
	const loading = useSelector(selectDashboardLoading);
	const error = useSelector(selectDashboardError);

	const userId = process.env.NEXT_PUBLIC_USER_ID || "dev-user";

	useEffect(() => {
		dispatch(fetchDashboardStats({ userId }));
	}, [dispatch, userId]);

	return {
		currentMonth,
		changes,
		totalTransactions,
		loading,
		error,
		refetch: () => dispatch(fetchDashboardStats({ userId })),
	};
}
