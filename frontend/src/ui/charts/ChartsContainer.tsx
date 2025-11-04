// src/ui/analytics/ChartsContainer.tsx
"use client";
import React from "react";
import { Card, H1, Stack, Text } from "@/ui/design/atoms";
import { useReports } from "@/ui/hooks/useReports";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
// import MonthlyTrendsChart from "./MonthlyTrendsChart";
// import SpendingPatternChart from "./SpendingPatternChart";
 import StatsCards from "./StatsCards";

export default function ChartsContainer() {
	const { monthlyTrends, categoryBreakdown, averageDailySpending, loading, error } = useReports();

	if (loading) {
		return (
			<div className="container">
				<H1>Análises e Gráficos</H1>
				<Card style={{ marginTop: 16 }}>
					<Text muted>Carregando dados...</Text>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container">
				<H1>Análises e Gráficos</H1>
				<Card style={{ marginTop: 16 }}>
					<Text style={{ color: "var(--danger)" }}>Erro: {error}</Text>
				</Card>
			</div>
		);
	}

	const hasTrends = monthlyTrends && monthlyTrends.length > 0;
	const hasBreakdown = categoryBreakdown && categoryBreakdown.length > 0;

	return (
		<div className="container">
			<Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 16 }}>
				<H1>Análises e Gráficos</H1>
				<Text muted>Visualizações avançadas</Text>
			</Stack>

			<StatsCards monthlyTrends={monthlyTrends} averageDailySpending={averageDailySpending} />

			<Card style={{ marginTop: 24, marginBottom: 24 }}>
				<Text size={18} weight={600} style={{ marginBottom: 16 }}>
					Tendências Mensais
				</Text>
				{hasTrends ? (
					<MonthlyTrendsChart data={monthlyTrends} />
				) : (
					<Text muted>Nenhuma tendência encontrada. Adicione transações para ver os gráficos.</Text>
				)}
			</Card>

			<Card style={{ marginBottom: 24 }}>
				<Text size={18} weight={600} style={{ marginBottom: 16 }}>
					Gastos por Categoria
				</Text>
				{hasBreakdown ? (
					<CategoryBreakdownChart data={categoryBreakdown} />
				) : (
					<Text muted>Nenhum dado de categorias para exibir.</Text>
				)}
			</Card>

			<Card>
				<Text size={18} weight={600} style={{ marginBottom: 16 }}>
					Padrão de Gastos Diários
				</Text>
				{hasTrends ? (
					<SpendingPatternChart monthlyTrends={monthlyTrends} averageDailySpending={averageDailySpending} />
				) : (
					<Text muted>Sem dados suficientes para calcular o padrão diário.</Text>
				)}
			</Card>
		</div>
	);
}
