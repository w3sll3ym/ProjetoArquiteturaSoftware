export type TransactionType = 'receita' | 'despesa';

export interface Transaction {
  id: string;
  descricao: string;
  valor: number;
  tipo: TransactionType;
  categoria: string;
  data: string;
  observacao?: string;
}

export interface Budget {
  categoria: string;
  limite: number;
}

export interface FinancialGoal {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
  dataLimite: string;
}

export interface CategoryOption {
  value: string;
  label: string;
  color: string;
  icon: string;
}
