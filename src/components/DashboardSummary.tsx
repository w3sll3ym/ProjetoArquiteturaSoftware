import React, { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';

interface DashboardSummaryProps {
  totalIncome: number;
  totalExpenses: number;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalIncome,
  totalExpenses,
}) => {
  const [showValues, setShowValues] = useState<boolean>(true);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const formatCurrency = (val: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getSavingsRateColor = (rate: number) => {
    if (rate >= 30) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (rate >= 10) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getSavingsRateLabel = (rate: number) => {
    if (rate >= 30) return 'Excelente poupador!';
    if (rate >= 10) return 'Razoável, busque guardar mais';
    if (rate > 0) return 'Atenção, margem pequena';
    return 'Alerta: Gastando mais do que ganha!';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Balance Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Saldo Atual</span>
          <button
            onClick={() => setShowValues(!showValues)}
            aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <CategoryIcon name={showValues ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>
        <h2 className={`font-display font-bold text-2xl tracking-tight leading-none ${balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
          {formatCurrency(balance)}
        </h2>
        <div className="mt-4 flex items-center text-xs">
          <span className={`inline-flex items-center font-semibold px-2.5 py-0.5 rounded-full ${balance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <CategoryIcon name={balance >= 0 ? 'ArrowUpRight' : 'ArrowDownLeft'} size={12} className="mr-1" />
            {balance >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'}
          </span>
        </div>
      </div>

      {/* Income Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Receitas</span>
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <CategoryIcon name="ArrowUpRight" size={16} />
          </div>
        </div>
        <h2 className="font-display font-bold text-2xl tracking-tight text-emerald-600 leading-none">
          {formatCurrency(totalIncome)}
        </h2>
        <div className="mt-4 text-xs text-slate-400 flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
          Entradas deste mês
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Despesas</span>
          <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
            <CategoryIcon name="ArrowDownLeft" size={16} />
          </div>
        </div>
        <h2 className="font-display font-bold text-2xl tracking-tight text-rose-600 leading-none">
          {formatCurrency(totalExpenses)}
        </h2>
        <div className="mt-4 text-xs text-slate-400 flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
          Saídas deste mês
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Taxa Poupada</span>
          <div className="bg-cyan-50 p-2 rounded-xl text-cyan-600">
            <CategoryIcon name="TrendingUp" size={16} />
          </div>
        </div>
        <h2 className="font-display font-bold text-2xl tracking-tight text-slate-800 leading-none">
          {showValues ? `${savingsRate.toFixed(1)}%` : '••••••'}
        </h2>
        <div className="mt-4.5">
          <span className={`inline-block text-center text-[10px] font-bold tracking-wider rounded-lg border px-2.5 py-0.5 ${getSavingsRateColor(savingsRate)}`}>
            {getSavingsRateLabel(savingsRate)}
          </span>
        </div>
      </div>
    </div>
  );
};
