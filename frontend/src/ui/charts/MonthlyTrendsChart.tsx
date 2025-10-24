'use client';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatMonthYearBR } from '@/ui/utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyTrendsChartProps {
  data: Array<{
    monthYear: string;
    income: number;
    expense: number;
    balance: number;
  }>;
}

export default function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartData = {
    labels: data.map(item => formatMonthYearBR(item.monthYear)),
    datasets: [
      {
        label: 'Receitas',
        data: data.map(item => item.income),
        borderColor: '#3ddc97',
        backgroundColor: 'rgba(61, 220, 151, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3ddc97',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Despesas',
        data: data.map(item => item.expense),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#ff6b6b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: 'Saldo',
        data: data.map(item => item.balance),
        borderColor: '#6ca1ff',
        backgroundColor: 'rgba(108, 161, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6ca1ff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e6e9ef',
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(21, 24, 33, 0.9)',
        titleColor: '#e6e9ef',
        bodyColor: '#e6e9ef',
        borderColor: '#232838',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            return `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#232838',
        },
        ticks: {
          color: '#aeb4c0',
        },
      },
      y: {
        grid: {
          color: '#232838',
        },
        ticks: {
          color: '#aeb4c0',
          callback: function(value: any) {
            return `R$ ${value.toLocaleString('pt-BR')}`;
          }
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
