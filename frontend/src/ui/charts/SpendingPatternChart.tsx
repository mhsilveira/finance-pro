"use client";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";
import { formatMonthYearBR } from "@/ui/utils/format";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SpendingPatternChartProps {
    monthlyTrends: Array<{
        monthYear: string;
        income: number;
        expense: number;
        balance: number;
    }>;
    averageDailySpending: number;
}

export default function SpendingPatternChart({ monthlyTrends, averageDailySpending }: SpendingPatternChartProps) {
    // Calcular gasto diário estimado por mês
    const dailySpendingData = monthlyTrends.map((month) => {
        const daysInMonth = new Date(
            parseInt(month.monthYear.split("-")[0]),
            parseInt(month.monthYear.split("-")[1]),
            0,
        ).getDate();
        return month.expense / daysInMonth;
    });

    const chartData = {
        labels: monthlyTrends.map((item) => formatMonthYearBR(item.monthYear)),
        datasets: [
            {
                label: "Gasto Diário Real",
                data: dailySpendingData,
                backgroundColor: "rgba(255, 107, 107, 0.8)",
                borderColor: "#ff6b6b",
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: "Média Geral",
                data: new Array(monthlyTrends.length).fill(averageDailySpending),
                backgroundColor: "rgba(108, 161, 255, 0.6)",
                borderColor: "#6ca1ff",
                borderWidth: 2,
                borderDash: [5, 5],
                type: "line" as const,
                pointRadius: 0,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: "#e6e9ef",
                    font: {
                        size: 12,
                        weight: "500" as const,
                    },
                },
            },
            tooltip: {
                backgroundColor: "rgba(21, 24, 33, 0.9)",
                titleColor: "#e6e9ef",
                bodyColor: "#e6e9ef",
                borderColor: "#232838",
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: "#232838",
                },
                ticks: {
                    color: "#aeb4c0",
                },
            },
            y: {
                grid: {
                    color: "#232838",
                },
                ticks: {
                    color: "#aeb4c0",
                    callback: function (value: any) {
                        return `R$ ${value.toLocaleString("pt-BR")}`;
                    },
                },
            },
        },
    };

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}
