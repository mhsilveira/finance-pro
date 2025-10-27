"use client";
import React from "react";
import { Card, H1, Stack, Text } from "@/ui/design/atoms";
import { useReports } from "@/ui/hooks/useReports";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import MonthlyTrendsChart from "./MonthlyTrendsChart";
import SpendingPatternChart from "./SpendingPatternChart";
import StatsCards from "./StatsCards";

export default function ChartsContainer() {
    const { monthlyTrends, categoryBreakdown, averageDailySpending, loading } = useReports();

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

    return (
        <div className="container">
            <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <H1>Análises e Gráficos</H1>
                <Text muted>Visualizações avançadas</Text>
            </Stack>

            {/* Cards de Estatísticas */}
            <StatsCards monthlyTrends={monthlyTrends} averageDailySpending={averageDailySpending} />

            {/* Gráfico de Tendências Mensais */}
            <Card style={{ marginTop: 24, marginBottom: 24 }}>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Tendências Mensais
                </Text>
                <MonthlyTrendsChart data={monthlyTrends} />
            </Card>

            {/* Gráfico de Breakdown por Categoria */}
            <Card style={{ marginBottom: 24 }}>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Gastos por Categoria
                </Text>
                <CategoryBreakdownChart data={categoryBreakdown} />
            </Card>

            {/* Gráfico de Padrão de Gastos */}
            <Card>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Padrão de Gastos Diários
                </Text>
                <SpendingPatternChart monthlyTrends={monthlyTrends} averageDailySpending={averageDailySpending} />
            </Card>
        </div>
    );
}
