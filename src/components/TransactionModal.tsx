import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { CATEGORIES } from '../initialData';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  transaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction,
}) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [tipo, setTipo] = useState<TransactionType>('despesa');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    if (transaction) {
      setDescricao(transaction.descricao);
      setValor(transaction.valor);
      setTipo(transaction.tipo);
      setCategoria(transaction.categoria);
      setData(transaction.data);
      setObservacao(transaction.observacao || '');
    } else {
      setDescricao('');
      setValor('');
      setTipo('despesa');
      setCategoria('');
      setData(new Date().toISOString().split('T')[0]);
      setObservacao('');
    }
  }, [transaction, isOpen]);

  // Set default category when type changes
  useEffect(() => {
    if (!transaction) {
      if (tipo === 'receita') {
        setCategoria('Salário');
      } else {
        setCategoria('Alimentação');
      }
    }
  }, [tipo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || valor === '' || valor <= 0 || !categoria || !data) {
      alert('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    onSave({
      id: transaction?.id,
      descricao,
      valor: Number(valor),
      tipo,
      categoria,
      data,
      observacao: observacao.trim() || undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-display font-bold text-slate-800 text-lg">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <CategoryIcon name="X" size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTipo('despesa')}
              className={`py-2 rounded-lg font-bold text-sm transition-all ${
                tipo === 'despesa'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setTipo('receita')}
              className={`py-2 rounded-lg font-bold text-sm transition-all ${
                tipo === 'receita'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Receita
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Descrição *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado Extra"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Value and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value !== '' ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Data *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Categoria *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Observações (Opcional)
            </label>
            <textarea
              placeholder="Notas adicionais sobre a transação..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-100"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
