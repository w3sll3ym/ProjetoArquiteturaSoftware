import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface GoalsManagerProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: FinancialGoal) => void;
  onUpdateGoalProgress: (id: string, newAmount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [valorAlvo, setValorAlvo] = useState<number | ''>('');
  const [valorAtual, setValorAtual] = useState<number | ''>('');
  const [dataLimite, setDataLimite] = useState('');

  // Local state for contributions
  const [contribId, setContribId] = useState<string | null>(null);
  const [contribValue, setContribValue] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || valorAlvo === '' || valorAlvo <= 0 || !dataLimite) return;

    onAddGoal({
      id: `goal-${Date.now()}`,
      titulo,
      valorAlvo: Number(valorAlvo),
      valorAtual: Number(valorAtual || 0),
      dataLimite,
    });

    setIsAdding(false);
    setTitulo('');
    setValorAlvo('');
    setValorAtual('');
    setDataLimite('');
  };

  const handleContribSubmit = (id: string, goal: FinancialGoal, type: 'add' | 'sub') => {
    if (contribValue === '' || contribValue <= 0) return;

    let nextValue = goal.valorAtual;
    if (type === 'add') {
      nextValue = Math.min(goal.valorAtual + Number(contribValue), goal.valorAlvo);
    } else {
      nextValue = Math.max(goal.valorAtual - Number(contribValue), 0);
    }

    onUpdateGoalProgress(id, nextValue);
    setContribId(null);
    setContribValue('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Metas Financeiras</h3>
          <p className="text-xs text-slate-400">Planeje seus objetivos de médio e longo prazo</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition-all flex items-center"
          >
            <CategoryIcon name="Plus" size={14} className="mr-1" />
            Nova Meta
          </button>
        )}
      </div>

      {/* Inline Goal Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nova Meta Financeira</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Título</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Reserva de Emergência, Viagem"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={valorAlvo}
                onChange={(e) => setValorAlvo(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 10000,00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Valor Atual Guardado (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorAtual}
                onChange={(e) => setValorAtual(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="Ex: 0,00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Data Limite</label>
              <input
                type="date"
                required
                value={dataLimite}
                onChange={(e) => setDataLimite(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
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

      {/* Goals list */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[380px]">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm">Nenhuma meta configurada ainda.</p>
            <p className="text-xs text-slate-400/80 mt-1">Crie metas para motivar suas economias!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const ratio = goal.valorAlvo > 0 ? goal.valorAtual / goal.valorAlvo : 0;
            const percent = ratio * 100;
            const isCompleted = goal.valorAtual >= goal.valorAlvo;

            return (
              <div key={goal.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-slate-800 text-sm flex items-center">
                      {goal.titulo}
                      {isCompleted && (
                        <span className="ml-2 inline-flex items-center text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-emerald-500 text-white tracking-widest">
                          <CategoryIcon name="ShieldCheck" size={10} className="mr-0.5" /> Concluída!
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Prazo: <span className="font-medium text-slate-600">{formatDate(goal.dataLimite)}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setContribId(contribId === goal.id ? null : goal.id)}
                      className="text-xs font-bold text-indigo-600 hover:bg-indigo-100/50 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors"
                    >
                      Ajustar Saldo
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-all"
                    >
                      <CategoryIcon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress calculation */}
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-indigo-600 font-bold">{formatCurrency(goal.valorAtual)}</span>
                  <span className="text-slate-400">alvo: {formatCurrency(goal.valorAlvo)}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-extrabold font-mono ${isCompleted ? 'text-emerald-600' : 'text-indigo-500'}`}>
                    {percent.toFixed(1)}% Guardado
                  </span>
                </div>

                {/* Adjust flow inline form */}
                {contribId === goal.id && (
                  <div className="mt-4 p-3 bg-white border border-slate-100 rounded-xl space-y-2 animate-[fadeIn_0.1s_ease-out]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aportes ou Resgates</p>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={contribValue}
                        onChange={(e) => setContribValue(e.target.value !== '' ? Number(e.target.value) : '')}
                        placeholder="Valor R$"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleContribSubmit(goal.id, goal, 'sub')}
                        className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Resgatar (-)
                      </button>
                      <button
                        onClick={() => handleContribSubmit(goal.id, goal, 'add')}
                        className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Guardar (+)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
