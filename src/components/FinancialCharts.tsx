import React from 'react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { Transaction } from '../types';
import { CATEGORIES } from '../initialData';

interface FinancialChartsProps {
  transactions: Transaction[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions }) => {
  // 1. Process Monthly Data (Last 5 Months)
  // Let's group transactions by month
  const getMonthYear = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Outro';
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months[date.getMonth()];
    } catch {
      return 'Outro';
    }
  };

  const monthlyMap: { [key: string]: { month: string; receita: number; despesa: number } } = {};

  // Standard static months for a nice structured flow
  const currentMonthIndices = [3, 2, 1, 0]; // Relative past months
  const monthsList = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Initialize last 5 months
  const today = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mName = monthsList[d.getMonth()];
    monthlyMap[mName] = { month: mName, receita: 0, despesa: 0 };
  }

  // Populate actual transactions
  transactions.forEach((tx) => {
    const mName = getMonthYear(tx.data);
    if (monthlyMap[mName]) {
      if (tx.tipo === 'receita') {
        monthlyMap[mName].receita += tx.valor;
      } else {
        monthlyMap[mName].despesa += tx.valor;
      }
    }
  });

  const barChartData = Object.values(monthlyMap);

  // 2. Process Category Expenses
  const categoryMap: { [key: string]: number } = {};
  transactions
    .filter((tx) => tx.tipo === 'despesa')
    .forEach((tx) => {
      categoryMap[tx.categoria] = (categoryMap[tx.categoria] || 0) + tx.valor;
    });

  const pieChartData = Object.entries(categoryMap).map(([name, value]) => {
    const info = CATEGORIES.find((c) => c.value === name);
    return {
      name,
      value,
      color: info ? info.color : '#6b7280',
    };
  }).filter(item => item.value > 0);

  // Fallback if no categories
  const hasExpenses = pieChartData.length > 0;
  const safePieData = hasExpenses ? pieChartData : [{ name: 'Sem despesas', value: 1, color: '#e5e7eb' }];

  // Custom tooltips
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Monthly flow chart */}
      <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Fluxo de Caixa Mensal</h3>
            <p className="text-xs text-slate-400">Comparativo histórico de ganhos vs. gastos</p>
          </div>
          <div className="flex space-x-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs mr-2 inline-block"></span>
              Receitas
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-rose-500 rounded-xs mr-2 inline-block"></span>
              Despesas
            </span>
          </div>
        </div>

        <div className="flex-1 h-[260px] min-h-[260px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
              <ReTooltip
                formatter={(value: any) => [formatValue(Number(value)), '']}
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
              <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesa" />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses by category chart */}
      <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base mb-1">Gastos por Categoria</h3>
          <p className="text-xs text-slate-400 mb-4">Composição de despesas no período completo</p>
        </div>

        <div className="relative flex items-center justify-center my-2 h-[160px] w-full text-xs">
          {hasExpenses ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={safePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {safePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value: any) => [formatValue(Number(value)), '']} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">Nenhuma despesa para exibir</p>
            </div>
          )}
          {hasExpenses && (
            <div className="absolute text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total</span>
              <span className="font-display font-bold text-sm text-slate-800">
                {formatValue(safePieData.reduce((acc, curr) => acc + (curr.name !== 'Sem despesas' ? curr.value : 0), 0))}
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 max-h-[110px] overflow-y-auto pr-1">
          {safePieData.map((item, index) => {
            if (item.name === 'Sem despesas') return null;
            return (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-slate-500 font-semibold">{formatValue(item.value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
