// src/ui/analytics/CategoryBreakdownChart.tsx
"use client";
import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions, type ChartData } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
	data: Array<{ category: string; amount: number; percentage: number; type: "income" | "expense" }>;
}

export default function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
	const safe = Array.isArray(data) ? data : [];
	const incomeData = safe.filter((item) => item.type === "income");
	const expenseData = safe.filter((item) => item.type === "expense");

	const colors = [
		"#3ddc97",
		"#6ca1ff",
		"#ffd93d",
		"#ff6b6b",
		"#8b5cf6",
		"#06b6d4",
		"#f59e0b",
		"#ef4444",
		"#10b981",
		"#6b7280",
	];

	const makeDataset = (arr: typeof safe): ChartData<"doughnut"> => {
		const labels = arr.map((item) => item.category);
		const values = arr.map((item) => (Number.isFinite(item.amount) ? item.amount : 0));
		const backgroundColor = colors.slice(0, Math.max(values.length, 1));
		const borderColor = backgroundColor.map((c) => c + "80");
		return { labels, datasets: [{ data: values, backgroundColor, borderColor, borderWidth: 2, hoverOffset: 4 }] };
	};

	const incomeChartData = makeDataset(incomeData);
	const expenseChartData = makeDataset(expenseData);

	const options: ChartOptions<"doughnut"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "bottom",
				labels: { color: "#e6e9ef", font: { size: 11, weight: "normal" }, padding: 15 },
			},
			tooltip: {
				backgroundColor: "rgba(21, 24, 33, 0.9)",
				titleColor: "#e6e9ef",
				bodyColor: "#e6e9ef",
				borderColor: "#232838",
				borderWidth: 1,
				callbacks: {
					label: function (context: any) {
						const value = context.parsed || 0;
						const total = (context.dataset.data as number[]).reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);
						const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
						return `${context.label}: R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${pct}%)`;
					},
				},
			},
		},
	};

	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", height: "400px" }}>
			<div>
				<div style={{ textAlign: "center", marginBottom: "16px" }}>
					<h3 style={{ color: "#3ddc97", margin: 0, fontSize: "16px", fontWeight: 600 }}>Receitas por Categoria</h3>
				</div>
				<div style={{ height: "300px" }}>
					<Doughnut data={incomeChartData} options={options} />
				</div>
			</div>

			<div>
				<div style={{ textAlign: "center", marginBottom: "16px" }}>
					<h3 style={{ color: "#ff6b6b", margin: 0, fontSize: "16px", fontWeight: 600 }}>Despesas por Categoria</h3>
				</div>
				<div style={{ height: "300px" }}>
					<Doughnut data={expenseChartData} options={options} />
				</div>
			</div>
		</div>
	);
}
