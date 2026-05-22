import { Transaction, Budget, FinancialGoal, CategoryOption } from './types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'Salário', label: 'Salário', color: '#10b981', icon: 'DollarSign' },
  { value: 'Investimentos', label: 'Investimentos', color: '#06b6d4', icon: 'TrendingUp' },
  { value: 'Alimentação', label: 'Alimentação', color: '#f59e0b', icon: 'Utensils' },
  { value: 'Moradia', label: 'Moradia', color: '#3b82f6', icon: 'Home' },
  { value: 'Transporte', label: 'Transporte', color: '#8b5cf6', icon: 'Car' },
  { value: 'Lazer', label: 'Lazer', color: '#ec4899', icon: 'Sparkles' },
  { value: 'Saúde', label: 'Saúde', color: '#ef4444', icon: 'HeartPulse' },
  { value: 'Outros', label: 'Outros', color: '#6b7280', icon: 'HelpCircle' },
];

const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-12',
    descricao: 'Salário Mensal',
    valor: 7500.00,
    tipo: 'receita',
    categoria: 'Salário',
    data: getPastDate(20),
    observacao: 'Salário com bônus de performance',
  },
  {
    id: 'tx-11',
    descricao: 'Freelance Frontend Dev',
    valor: 2200.00,
    tipo: 'receita',
    categoria: 'Investimentos',
    data: getPastDate(18),
    observacao: 'API Spring Boot + React Admin',
  },
  {
    id: 'tx-1',
    descricao: 'Supermercado Extra',
    valor: 245.50,
    tipo: 'despesa',
    categoria: 'Alimentação',
    data: getPastDate(15),
    observacao: 'Compras da quinzena',
  },
  {
    id: 'tx-2',
    descricao: 'Aluguel Loft',
    valor: 1800.00,
    tipo: 'despesa',
    categoria: 'Moradia',
    data: getPastDate(12),
    observacao: 'Aluguel do mês',
  },
  {
    id: 'tx-3',
    descricao: 'Netflix Brasil',
    valor: 55.90,
    tipo: 'despesa',
    categoria: 'Lazer',
    data: getPastDate(10),
  },
  {
    id: 'tx-4',
    descricao: 'Enel Distribuição',
    valor: 189.20,
    tipo: 'despesa',
    categoria: 'Moradia',
    data: getPastDate(8),
    observacao: 'Conta de luz',
  },
  {
    id: 'tx-5',
    descricao: 'Rendimento Fiis',
    valor: 320.00,
    tipo: 'receita',
    categoria: 'Investimentos',
    data: getPastDate(6),
  },
  {
    id: 'tx-6',
    descricao: 'Uber Viagens',
    valor: 48.00,
    tipo: 'despesa',
    categoria: 'Transporte',
    data: getPastDate(5),
  },
  {
    id: 'tx-7',
    descricao: 'Restaurante Sabor',
    valor: 120.00,
    tipo: 'despesa',
    categoria: 'Alimentação',
    data: getPastDate(3),
  },
  {
    id: 'tx-8',
    descricao: 'Combustível Posto',
    valor: 150.00,
    tipo: 'despesa',
    categoria: 'Transporte',
    data: getPastDate(2),
  },
  {
    id: 'tx-9',
    descricao: 'Farmácia Preço Popular',
    valor: 64.90,
    tipo: 'despesa',
    categoria: 'Saúde',
    data: getPastDate(1),
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  { categoria: 'Alimentação', limite: 800.00 },
  { categoria: 'Moradia', limite: 2200.00 },
  { categoria: 'Transporte', limite: 400.00 },
  { categoria: 'Lazer', limite: 500.00 },
  { categoria: 'Saúde', limite: 300.00 },
  { categoria: 'Outros', limite: 200.00 },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'g-1',
    titulo: 'Reserva de Emergência',
    valorAlvo: 15000.00,
    valorAtual: 9500.00,
    dataLimite: '2026-11-30',
  },
  {
    id: 'g-2',
    titulo: 'Curso de Spring Expert',
    valorAlvo: 1200.00,
    valorAtual: 800.00,
    dataLimite: '2026-08-15',
  },
  {
    id: 'g-3',
    titulo: 'Troca de Macbook',
    valorAlvo: 12000.00,
    valorAtual: 4500.00,
    dataLimite: '2027-02-28',
  },
];
