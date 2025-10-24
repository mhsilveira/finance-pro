'use client';
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
    type: 'income' | 'expense';
  }>;
}

export default function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  // Separar receitas e despesas
  const incomeData = data.filter(item => item.type === 'income');
  const expenseData = data.filter(item => item.type === 'expense');

  // Cores para as categorias
  const colors = [
    '#3ddc97', '#6ca1ff', '#ffd93d', '#ff6b6b', '#8b5cf6',
    '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#6b7280'
  ];

  const incomeChartData = {
    labels: incomeData.map(item => item.category),
    datasets: [
      {
        data: incomeData.map(item => item.amount),
        backgroundColor: colors.slice(0, incomeData.length),
        borderColor: colors.slice(0, incomeData.length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const expenseChartData = {
    labels: expenseData.map(item => item.category),
    datasets: [
      {
        data: expenseData.map(item => item.amount),
        backgroundColor: colors.slice(0, expenseData.length),
        borderColor: colors.slice(0, expenseData.length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e6e9ef',
          font: {
            size: 11,
            weight: '500' as const,
          },
          padding: 15,
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
            const value = context.parsed;
            const percentage = ((value / data.reduce((sum, item) => sum + item.amount, 0)) * 100).toFixed(1);
            return `${context.label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '400px' }}>
      <div>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#3ddc97', margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Receitas por Categoria
          </h3>
        </div>
        <div style={{ height: '300px' }}>
          <Doughnut data={incomeChartData} options={chartOptions} />
        </div>
      </div>
      
      <div>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#ff6b6b', margin: 0, fontSize: '16px', fontWeight: 600 }}>
            Despesas por Categoria
          </h3>
        </div>
        <div style={{ height: '300px' }}>
          <Doughnut data={expenseChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
