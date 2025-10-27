"use client";
import React from "react";
import { Card, Text } from "@/ui/design/atoms";
import { formatCurrencyBR, formatMonthYearBR } from "@/ui/utils/format";

interface StatsCardsProps {
    monthlyTrends: Array<{
        monthYear: string;
        income: number;
        expense: number;
        balance: number;
    }>;
    averageDailySpending: number;
}

export default function StatsCards({ monthlyTrends, averageDailySpending }: StatsCardsProps) {
    // Calcular estatísticas avançadas
    const totalIncome = monthlyTrends.reduce((sum, month) => sum + month.income, 0);
    const totalExpense = monthlyTrends.reduce((sum, month) => sum + month.expense, 0);
    const averageMonthlyIncome = totalIncome / monthlyTrends.length;
    const averageMonthlyExpense = totalExpense / monthlyTrends.length;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Encontrar melhor e pior mês
    const bestMonth = monthlyTrends.reduce((best, current) => (current.balance > best.balance ? current : best));
    const worstMonth = monthlyTrends.reduce((worst, current) => (current.balance < worst.balance ? current : worst));

    // Calcular tendência (últimos 3 meses vs primeiros 3 meses)
    const recentMonths = monthlyTrends.slice(-3);
    const olderMonths = monthlyTrends.slice(0, 3);
    const recentAvg = recentMonths.reduce((sum, month) => sum + month.balance, 0) / recentMonths.length;
    const olderAvg = olderMonths.reduce((sum, month) => sum + month.balance, 0) / olderMonths.length;
    const trend = recentAvg - olderAvg;

    return (
        <div className="grid-3" style={{ marginBottom: 24 }}>
            <Card>
                <Text muted>Receita Média Mensal</Text>
                <Text size={20} weight={600} style={{ color: "var(--success)" }}>
                    {formatCurrencyBR(averageMonthlyIncome)}
                </Text>
                <Text size={12} muted>
                    Total: {formatCurrencyBR(totalIncome)}
                </Text>
            </Card>

            <Card>
                <Text muted>Gasto Médio Mensal</Text>
                <Text size={20} weight={600} style={{ color: "var(--danger)" }}>
                    {formatCurrencyBR(averageMonthlyExpense)}
                </Text>
                <Text size={12} muted>
                    Total: {formatCurrencyBR(totalExpense)}
                </Text>
            </Card>

            <Card>
                <Text muted>Taxa de Poupança</Text>
                <Text
                    size={20}
                    weight={600}
                    style={{
                        color: savingsRate >= 20 ? "var(--success)" : savingsRate >= 10 ? "#f59e0b" : "var(--danger)",
                    }}
                >
                    {savingsRate.toFixed(1)}%
                </Text>
                <Text size={12} muted>
                    {savingsRate >= 20 ? "Excelente!" : savingsRate >= 10 ? "Bom" : "Pode melhorar"}
                </Text>
            </Card>

            <Card>
                <Text muted>Gasto Médio Diário</Text>
                <Text size={20} weight={600} style={{ color: "var(--danger)" }}>
                    {formatCurrencyBR(averageDailySpending)}
                </Text>
                <Text size={12} muted>
                    Baseado nos últimos meses
                </Text>
            </Card>

            <Card>
                <Text muted>Melhor Mês</Text>
                <Text size={18} weight={600} style={{ color: "var(--success)" }}>
                    {formatMonthYearBR(bestMonth.monthYear)}
                </Text>
                <Text size={12} muted>
                    Saldo: {formatCurrencyBR(bestMonth.balance)}
                </Text>
            </Card>

            <Card>
                <Text muted>Tendência</Text>
                <Text
                    size={18}
                    weight={600}
                    style={{ color: trend > 0 ? "var(--success)" : trend < 0 ? "var(--danger)" : "var(--muted)" }}
                >
                    {trend > 0 ? "↗ Melhorando" : trend < 0 ? "↘ Piorando" : "→ Estável"}
                </Text>
                <Text size={12} muted>
                    Últimos 3 vs primeiros 3 meses
                </Text>
            </Card>
        </div>
    );
}
