// src/ui/analytics/SpendingPatternChart.tsx
"use client";
import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
	type ChartOptions,
	type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatMonthYearBR } from "@/ui/utils/format";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface SpendingPatternChartProps {
	monthlyTrends: Array<{ monthYear: string; income: number; expense: number; balance: number }>;
	averageDailySpending: number;
}

export default function SpendingPatternChart({ monthlyTrends, averageDailySpending }: SpendingPatternChartProps) {
	const trends = Array.isArray(monthlyTrends) ? monthlyTrends : [];

	const labels = trends.map((item) => formatMonthYearBR(item.monthYear));
	const dailySpendingData = trends.map((month) => {
		const [y, m] = month.monthYear.split("-").map(Number);
		const daysInMonth = new Date(y, m, 0).getDate();
		const expense = Number.isFinite(month.expense) ? month.expense : 0;
		return daysInMonth > 0 ? expense / daysInMonth : 0;
	});

	const avg = Number.isFinite(averageDailySpending) ? averageDailySpending : 0;
	const avgLine = Array(labels.length).fill(avg);

	const data: ChartData<"bar" | "line"> = {
		labels,
		datasets: [
			{
				type: "bar",
				label: "Gasto Diário Real",
				data: dailySpendingData,
				backgroundColor: "rgba(255, 107, 107, 0.8)",
				borderColor: "#ff6b6b",
				borderWidth: 2,
				borderRadius: 4,
				borderSkipped: false,
			},
			{
				type: "line",
				label: "Média Geral",
				data: avgLine,
				backgroundColor: "rgba(108, 161, 255, 0.6)",
				borderColor: "#6ca1ff",
				borderWidth: 2,
				borderDash: [5, 5],
				pointRadius: 0,
				fill: false,
				yAxisID: "y",
			},
		],
	};

	const options: ChartOptions<"bar"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
				labels: { color: "#e6e9ef", font: { size: 12, weight: "normal" } },
			},
			tooltip: {
				backgroundColor: "rgba(21, 24, 33, 0.9)",
				titleColor: "#e6e9ef",
				bodyColor: "#e6e9ef",
				borderColor: "#232838",
				borderWidth: 1,
				callbacks: {
					label: function (context: any) {
						const value = context.parsed.y ?? 0;
						return `${context.dataset.label}: R$ ${Number(value).toLocaleString("pt-BR", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}`;
					},
				},
			},
		},
		scales: {
			x: { grid: { color: "#232838" }, ticks: { color: "#aeb4c0" } },
			y: {
				grid: { color: "#232838" },
				ticks: {
					color: "#aeb4c0",
					callback: (value) => `R$ ${Number(value as number).toLocaleString("pt-BR")}`,
				},
			},
		},
	};

	return (
		<div style={{ height: "400px", width: "100%" }}>
			<Bar data={data as any} options={options} />
		</div>
	);
}
