import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../initialData';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransaction: () => void;
  compact?: boolean;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
  compact = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [categoryFilter, setCategoryFilter] = useState('todas');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`; // Return dd/mm for compact clean look
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getFullDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filter Transactions logic
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (tx.observacao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'todos' || tx.tipo === typeFilter;
    const matchesCategory = categoryFilter === 'todas' || tx.categoria === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // For compact view, we only show last 5 transactions
  const displayTransactions = compact ? transactions.slice(0, 5) : filteredTransactions;

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-display font-bold text-slate-800">Últimas Transações</h3>
            <p className="text-xs text-slate-400">Atividades registradas recentemente</p>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center"
          >
            Ver Tudo
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[300px]">
          {displayTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Nenhuma transação cadastrada.
            </div>
          ) : (
            displayTransactions.map((tx) => {
              const catInfo = CATEGORIES.find((c) => c.value === tx.categoria);
              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: catInfo?.color || '#cbd5e1' }}
                    >
                      <CategoryIcon name={catInfo?.icon || 'HelpCircle'} size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{tx.descricao}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(tx.data)} • {tx.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.tipo === 'receita' ? '+' : '-'} {formatCurrency(tx.valor)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onOpenNewTransaction}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md shadow-slate-200 flex items-center justify-center"
          >
            <CategoryIcon name="Plus" size={16} className="mr-1.5" />
            Nova Transação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Search & Filter Header bar */}
      <div className="p-6 border-b border-slate-100 bg-slate-50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 text-lg">Histórico de Transações</h3>
            <p className="text-xs text-slate-400">Busque, filtre e gerencie todas as receitas e despesas</p>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="bg-emerald-600 font-bold text-white text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-50 flex items-center shrink-0"
          >
            <CategoryIcon name="PlusCircle" size={14} className="mr-2" />
            Lançar Transação
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Text Search */}
          <div className="md:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <CategoryIcon name="Search" size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por descrição ou notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Type dropdown */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="todos">Todos os tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>

          {/* Category dropdown */}
          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="todas">Todas as categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table List representation */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[480px]">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Nenhuma transação corresponde aos filtros selecionados.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-6">Descrição / Data</th>
                <th className="py-3 px-6">Categoria</th>
                <th className="py-3 px-6 text-right">Valor</th>
                <th className="py-3 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const catInfo = CATEGORIES.find((c) => c.value === tx.categoria);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Descricao and Date */}
                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="font-bold text-slate-800 text-sm">{tx.descricao}</div>
                      <div className="text-xs text-slate-400 flex items-center mt-0.5 font-sans">
                        <CategoryIcon name="Calendar" size={12} className="mr-1" />
                        {getFullDateString(tx.data)}
                        {tx.observacao && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-slate-100 text-[10px] font-medium text-slate-500 truncate max-w-[150px]" title={tx.observacao}>
                            {tx.observacao}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category Label with Icon bubble */}
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center space-x-2 bg-slate-100/50 rounded-full py-1 pl-1 pr-3 max-w-full">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[12px] shrink-0"
                          style={{ backgroundColor: catInfo?.color || '#cbd5e1' }}
                        >
                          <CategoryIcon name={catInfo?.icon || 'HelpCircle'} size={12} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">{tx.categoria}</span>
                      </div>
                    </td>

                    {/* Colored Value with indicators */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-sm shrink-0">
                      <span className={tx.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.tipo === 'receita' ? '+' : '-'} {formatCurrency(tx.valor)}
                      </span>
                    </td>

                    {/* Action buttons list */}
                    <td className="py-4 px-6 text-center shrink-0">
                      <div className="flex items-center justify-center space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Editar transação"
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <CategoryIcon name="Edit2" size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Excluir transação"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <CategoryIcon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
