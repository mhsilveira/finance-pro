"use client";
import React from "react";
import { Card, H1, Input, Select, Stack, Text } from "@/ui/design/atoms";
import { useReports } from "@/ui/hooks/useReports";
import { formatCurrencyBR, formatMonthYearBR } from "@/ui/utils/format";

export default function ReportsPage() {
    const [selectedMonth, setSelectedMonth] = React.useState<string>("");
    const { monthlyTrends, categoryBreakdown, topTransactions, averageDailySpending, loading } = useReports(
        selectedMonth || undefined,
    );

    // Gerar opções de mês/ano dos últimos 6 meses
    const monthOptions = React.useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = date.toISOString().slice(0, 7);
            options.push({ value, label: formatMonthYearBR(value) });
        }
        return options;
    }, []);

    if (loading) {
        return (
            <div className="container">
                <H1>Relatórios</H1>
                <Card style={{ marginTop: 16 }}>
                    <Text muted>Carregando dados...</Text>
                </Card>
            </div>
        );
    }

    return (
        <div className="container">
            <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <H1>Relatórios</H1>
                <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ minWidth: 200 }}
                >
                    <option value="">Todos os meses</option>
                    {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </Stack>

            {/* Estatísticas Gerais */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <Card>
                    <Text muted>Gasto Médio Diário</Text>
                    <Text size={20} weight={600} style={{ color: "var(--danger)" }}>
                        {formatCurrencyBR(averageDailySpending)}
                    </Text>
                </Card>
                <Card>
                    <Text muted>Total de Categorias</Text>
                    <Text size={20} weight={600}>
                        {categoryBreakdown.length}
                    </Text>
                </Card>
                <Card>
                    <Text muted>Período</Text>
                    <Text size={20} weight={600}>
                        {selectedMonth ? formatMonthYearBR(selectedMonth) : "Últimos 6 meses"}
                    </Text>
                </Card>
            </div>

            {/* Tendências Mensais */}
            <Card style={{ marginBottom: 24 }}>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Tendências Mensais
                </Text>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mês</th>
                            <th>Receitas</th>
                            <th>Despesas</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyTrends.map((trend) => (
                            <tr key={trend.monthYear}>
                                <td>{formatMonthYearBR(trend.monthYear)}</td>
                                <td style={{ color: "var(--success)" }}>{formatCurrencyBR(trend.income)}</td>
                                <td style={{ color: "var(--danger)" }}>{formatCurrencyBR(trend.expense)}</td>
                                <td style={{ color: trend.balance >= 0 ? "var(--success)" : "var(--danger)" }}>
                                    {formatCurrencyBR(trend.balance)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Breakdown por Categoria */}
            <Card style={{ marginBottom: 24 }}>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Gastos por Categoria
                </Text>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>%</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryBreakdown.slice(0, 10).map((item, index) => (
                            <tr key={index}>
                                <td>{item.category}</td>
                                <td style={{ color: item.type === "income" ? "var(--success)" : "var(--danger)" }}>
                                    {formatCurrencyBR(item.amount)}
                                </td>
                                <td>{item.percentage.toFixed(1)}%</td>
                                <td>
                                    <Text
                                        size={12}
                                        style={{
                                            color: item.type === "income" ? "var(--success)" : "var(--danger)",
                                            background:
                                                item.type === "income"
                                                    ? "rgba(61, 220, 151, 0.1)"
                                                    : "rgba(255, 107, 107, 0.1)",
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            display: "inline-block",
                                        }}
                                    >
                                        {item.type === "income" ? "Receita" : "Despesa"}
                                    </Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Top Transações */}
            <Card>
                <Text size={18} weight={600} style={{ marginBottom: 16 }}>
                    Maiores Transações
                </Text>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topTransactions.slice(0, 10).map((transaction) => (
                            <tr key={transaction.id}>
                                <td>
                                    <Text weight={600}>{transaction.name}</Text>
                                    <div className="muted" style={{ fontSize: 12 }}>
                                        {transaction.description}
                                    </div>
                                </td>
                                <td>{transaction.category}</td>
                                <td
                                    style={{
                                        color: transaction.type === "income" ? "var(--success)" : "var(--danger)",
                                    }}
                                >
                                    {formatCurrencyBR(transaction.amount)}
                                </td>
                                <td>
                                    <Text
                                        size={12}
                                        style={{
                                            color: transaction.type === "income" ? "var(--success)" : "var(--danger)",
                                            background:
                                                transaction.type === "income"
                                                    ? "rgba(61, 220, 151, 0.1)"
                                                    : "rgba(255, 107, 107, 0.1)",
                                            padding: "2px 8px",
                                            borderRadius: 4,
                                            display: "inline-block",
                                        }}
                                    >
                                        {transaction.type === "income" ? "Receita" : "Despesa"}
                                    </Text>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
