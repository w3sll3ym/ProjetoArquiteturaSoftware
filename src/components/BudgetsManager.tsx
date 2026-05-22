import React, { useState } from 'react';
import { Budget, Transaction } from '../types';
import { CATEGORIES } from '../initialData';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Budget) => void;
  onDeleteBudget: (categoria: string) => void;
}

export const BudgetsManager: React.FC<BudgetsManagerProps> = ({
  budgets,
  transactions,
  onAddBudget,
  onDeleteBudget,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [categoria, setCategoria] = useState(CATEGORIES[2].value); // Default to 'Alimentação'
  const [limite, setLimite] = useState<number | ''>('');

  // Calculate actual spending per category
  const getCategorySpending = (catName: string) => {
    return transactions
      .filter((t) => t.tipo === 'despesa' && t.categoria === catName)
      .reduce((sum, t) => sum + t.valor, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limite === '' || limite <= 0) return;

    onAddBudget({
      categoria,
      limite: Number(limite),
    });

    setIsAdding(false);
    setLimite('');
  };

  const getPercentage = (spent: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1.0) return 'bg-rose-500';
    if (ratio >= 0.8) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getProgressBg = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1.0) return 'bg-rose-50 border-rose-100';
    if (ratio >= 0.8) return 'bg-amber-50 border-amber-100';
    return 'bg-emerald-50 border-emerald-100';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Get categories that don't have budgets yet
  const availableCategories = CATEGORIES.filter(
    (c) => c.value !== 'Salário' && !budgets.some((b) => b.categoria === c.value)
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Orçamentos Mensais</h3>
          <p className="text-xs text-slate-400">Controle de limites por categoria de gasto</p>
        </div>
        {!isAdding && availableCategories.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all flex items-center"
          >
            <CategoryIcon name="Plus" size={14} className="mr-1" />
            Adicionar Limite
          </button>
        )}
      </div>

      {/* Add Budget Inline Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border-b border-slate-100 animate-[fadeIn_0.15s_ease-out] space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Novo Limite de Gasto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
              >
                {availableCategories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Limite Mensal (R$)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={limite}
                onChange={(e) => setLimite(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 500,00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </form>
      )}

      {/* Budgets List */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[360px]">
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">Nenhum orçamento configurado.</p>
            <p className="text-xs text-slate-400/80 mt-1">Defina limites para controlar melhor suas despesas.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = getCategorySpending(budget.categoria);
            const percent = getPercentage(spent, budget.limite);
            const categoryInfo = CATEGORIES.find((c) => c.value === budget.categoria);
            const isOver = spent > budget.limite;

            return (
              <div key={budget.categoria} className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Category description */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: categoryInfo?.color || '#cbd5e1' }}
                    >
                      <CategoryIcon name={categoryInfo?.icon || 'HelpCircle'} size={16} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{budget.categoria}</span>
                      <span className="text-xs text-slate-400 block font-mono">
                        Gastou {formatCurrency(spent)} de {formatCurrency(budget.limite)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Percentage label */}
                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      isOver 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : percent >= 80 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {percent.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => onDeleteBudget(budget.categoria)}
                      title="Excluir limite"
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition-all"
                    >
                      <CategoryIcon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(spent, budget.limite)}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                {/* Warnings */}
                {isOver && (
                  <p className="text-[10px] font-bold text-rose-600 flex items-center">
                    <CategoryIcon name="AlertTriangle" size={12} className="mr-1" />
                    Aviso: Você ultrapassou o limite em {formatCurrency(spent - budget.limite)}!
                  </p>
                )}
                {!isOver && percent >= 80 && (
                  <p className="text-[10px] font-bold text-amber-600 flex items-center">
                    <CategoryIcon name="AlertTriangle" size={12} className="mr-1" />
                    Alerta: Você atingiu {percent.toFixed(0)}% do seu limite!
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
