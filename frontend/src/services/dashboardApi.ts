// src/services/dashboardApi.ts
import { getReports } from "./reportsApi";

export type DashboardResponse = {
	currentMonth: { income: number; expense: number; balance: number };
	changes: { incomeChange: number; expenseChange: number };
	totalTransactions: number;
};

// Implementa getDashboard consumindo /reports, e devolvendo o shape esperado pelo seu dashboardSlice.
export async function getDashboard(userId: string): Promise<DashboardResponse> {
	const reports = await getReports(userId);

	const trends = reports.monthlyTrends;
	const last = trends[trends.length - 1];
	const prev = trends[trends.length - 2];

	const income = Number(last?.income ?? 0);
	const expense = Number(last?.expense ?? 0);
	const balance = Number(last?.balance ?? income - expense);

	const incomePrev = Number(prev?.income ?? 0);
	const expensePrev = Number(prev?.expense ?? 0);

	// Se você quiser totalTransactions real, chame /transactions e conte.
	// Mantendo 0 para não gerar outra chamada agora.
	const totalTransactions = 0;

	return {
		currentMonth: { income, expense, balance },
		changes: {
			incomeChange: income - incomePrev,
			expenseChange: expense - expensePrev,
		},
		totalTransactions,
	};
}
