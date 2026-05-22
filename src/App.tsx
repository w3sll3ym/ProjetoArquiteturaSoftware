import React, { useState, useEffect } from 'react';
import { Transaction, Budget, FinancialGoal, TransactionType } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_GOALS } from './initialData';
import { DashboardSummary } from './components/DashboardSummary';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionsList } from './components/TransactionsList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetsManager } from './components/BudgetsManager';
import { GoalsManager } from './components/GoalsManager';
import { SpringBootSimulator } from './components/SpringBootSimulator';
import { CategoryIcon } from './components/CategoryIcon';

export default function App() {
  // --- Persistent States (backed by localStorage) ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('financapro_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('financapro_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('financapro_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('financapro_username') || 'Carlos Oliveira';
  });

  // --- UI Control States ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'planning' | 'config' | 'springboot'>('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [inputName, setInputName] = useState(userName);

  // --- Spring Boot Logger Terminal Simulation ---
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  // Push new log to simulator
  const addLog = (msg: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') => {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const pid = '14520';
    const logLine = `${time}  ${level} ${pid} --- [nio-8080-exec-${Math.floor(Math.random() * 8) + 1}] c.f.p.PersonalFinanceController   : ${msg}`;
    setBootLogs((prev) => [...prev, logLine]);
  };

  // Synchronizers of state changes
  useEffect(() => {
    localStorage.setItem('financapro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financapro_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('financapro_goals', JSON.stringify(goals));
  }, [goals]);

  // Initializing Spring Boot Simulator boot-up
  useEffect(() => {
    const initLogs = [
      '2026-05-22 11:46:01.042  INFO 14520 --- [           main] c.f.p.PersonalFinanceApplication        : Starting PersonalFinanceApplication using Java 17...',
      '2026-05-22 11:46:02.130  INFO 14520 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM Core 6.2.14.Final',
      '2026-05-22 11:46:02.408  INFO 14520 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)',
      '2026-05-22 11:46:02.501  INFO 14520 --- [           main] o.s.web.servlet.DispatcherServlet        : Initializing Servlet \'dispatcherServlet\'',
      '2026-05-22 11:46:02.810  INFO 14520 --- [           main] c.f.p.PersonalFinanceApplication        : Spring Boot 3.2.5 started successfully on port 8080.',
      '2026-05-22 11:46:03.011  INFO 14520 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 5 ms',
      '2026-05-22 11:46:03.490  INFO 14520 --- [nio-8080-exec-2] c.f.p.c.TransactionController           : GET /api/transactions - Consolidando estado inicial.',
    ];
    setBootLogs(initLogs);
  }, []);

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExpenses = transactions
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  // --- Transactions Actions CRUD ---
  const handleSaveTransaction = (data: Omit<Transaction, 'id'> & { id?: string }) => {
    if (data.id) {
      // Edit mode
      setTransactions((prev) =>
        prev.map((t) => (t.id === data.id ? (data as Transaction) : t))
      );
      addLog(`PUT /api/transactions/${data.id} - Atualizada transação "${data.descricao}" (R$ ${data.valor.toFixed(2)})`);
    } else {
      // Create mode
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      addLog(`POST /api/transactions - Lançada nova transação "${newTx.descricao}" (R$ ${newTx.valor.toFixed(2)})`);

      // Check budget overruns mock trigger
      const categoryBudget = budgets.find((b) => b.categoria === data.categoria);
      if (categoryBudget && data.tipo === 'despesa') {
        const spent = transactions
          .filter((t) => t.tipo === 'despesa' && t.categoria === data.categoria)
          .reduce((sum, t) => sum + t.valor, 0) + data.valor;
        if (spent > categoryBudget.limite) {
          addLog(`AVISO: Orçamento de [${data.categoria}] ultrapassado! Gasto: R$ ${spent.toFixed(2)} / Limite: R$ ${categoryBudget.limite.toFixed(2)}`, 'WARN');
        }
      }
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addLog(`DELETE /api/transactions/${id} - Removida transação "${target?.descricao || 'Desconhecida'}"`);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  // --- Budgets Actions CRUD ---
  const handleAddBudget = (newBudget: Budget) => {
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.categoria !== newBudget.categoria);
      return [...filtered, newBudget];
    });
    addLog(`POST /api/budgets - Estabelecido limite para [${newBudget.categoria}] de R$ ${newBudget.limite.toFixed(2)}`);
  };

  const handleDeleteBudget = (catName: string) => {
    setBudgets((prev) => prev.filter((b) => b.categoria !== catName));
    addLog(`DELETE /api/budgets/${encodeURIComponent(catName)} - Removido limite orçamentário da categoria`);
  };

  // --- Goals Actions CRUD ---
  const handleAddGoal = (newGoal: FinancialGoal) => {
    setGoals((prev) => [...prev, newGoal]);
    addLog(`POST /api/goals - Criada meta de investimento "${newGoal.titulo}" com alvo de R$ ${newGoal.valorAlvo.toFixed(2)}`);
  };

  const handleUpdateGoalProgress = (id: string, newAmount: number) => {
    const target = goals.find((g) => g.id === id);
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, valorAtual: newAmount } : g))
    );
    addLog(`PUT /api/goals/${id}/progress - Atualizado saldo guardado para "${target?.titulo}" para R$ ${newAmount.toFixed(2)}`);
  };

  const handleDeleteGoal = (id: string) => {
    const target = goals.find((g) => g.id === id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    addLog(`DELETE /api/goals/${id} - Excluída a meta de poupança "${target?.titulo}"`);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName);
      localStorage.setItem('financapro_username', inputName);
      setEditingName(false);
      addLog(`PATCH /api/user/profile - Nome do profissional atualizado para "${inputName}"`);
    }
  };

  // Calculate initials of username
  const getNameInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Sidebar Navigation (Matching Geometric Balance Theme) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xs">
            {/* Geometric logo design */}
            <div className="w-5 h-5 bg-white rounded-sm rotate-45 transition-transform hover:rotate-90 duration-500"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-bold tracking-tight text-slate-800">FinançaPro</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Spring Native SPA</span>
          </div>
        </div>

        {/* Navigation Sidebar links */}
        <nav className="flex-1 px-4 py-3 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); addLog('GET /api/dashboard - Carregando visão geral'); }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CategoryIcon name="PieIcon" size={18} className={activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab('transactions'); addLog('GET /api/transactions - Consultando extrato completo'); }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'transactions'
                ? 'bg-slate-100 text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CategoryIcon name="SlidersHorizontal" size={18} className={activeTab === 'transactions' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Transações</span>
          </button>

          <button
            onClick={() => { setActiveTab('planning'); addLog('GET /api/budgets && GET /api/goals - Planejamento carregado'); }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'planning'
                ? 'bg-slate-100 text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CategoryIcon name="Target" size={18} className={activeTab === 'planning' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Metas & Orçamentos</span>
          </button>

          <button
            onClick={() => { setActiveTab('springboot'); addLog('GET /actuator/health - Verificando beans e configurações'); }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'springboot'
                ? 'bg-slate-100 text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CategoryIcon name="Database" size={18} className={activeTab === 'springboot' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>JVM & Spring Boot</span>
          </button>
        </nav>

        {/* Backend State Indicator (as requested inside Geometric Balance layout) */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5 shadow-xs">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Servidor Integrado</p>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-700">Spring Boot v3.2.5</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium font-mono leading-tight">Porta: 8080 • Online</p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Header Module */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
              {activeTab === 'dashboard' && 'Visão Geral'}
              {activeTab === 'transactions' && 'Controle de Lançamentos'}
              {activeTab === 'planning' && 'Metas & Orçamentos'}
              {activeTab === 'springboot' && 'Painel de Retaguarda Java'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Profissional</p>
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex items-center mt-1">
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-emerald-500"
                    maxLength={30}
                    autoFocus
                  />
                  <button type="submit" className="ml-1 text-emerald-600 text-xs font-bold hover:underline">Salvar</button>
                </form>
              ) : (
                <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="text-sm font-bold text-slate-700 block">{userName}</span>
                  <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <CategoryIcon name="Edit2" size={11} />
                  </button>
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-white ring-2 ring-slate-100 text-xs tracking-wider">
              {getNameInitials(userName)}
            </div>
          </div>
        </header>

        {/* Tab views panel switch */}
        <div className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-[fadeIn_0.20s_ease-out]">
              {/* Core numbers cards */}
              <DashboardSummary totalIncome={totalIncome} totalExpenses={totalExpenses} />

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Visual historical graph container */}
                <div className="xl:col-span-8 flex flex-col space-y-8">
                  <FinancialCharts transactions={transactions} />
                </div>

                {/* Sidebar list items widget */}
                <div className="xl:col-span-4 flex flex-col">
                  <TransactionsList
                    transactions={transactions}
                    onDeleteTransaction={handleDeleteTransaction}
                    onEditTransaction={handleOpenEditModal}
                    onOpenNewTransaction={() => {
                      setEditingTransaction(null);
                      setIsTransactionModalOpen(true);
                    }}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="h-full animate-[fadeIn_0.20s_ease-out]">
              <TransactionsList
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleOpenEditModal}
                onOpenNewTransaction={() => {
                  setEditingTransaction(null);
                  setIsTransactionModalOpen(true);
                }}
                compact={false}
              />
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-[fadeIn_0.20s_ease-out]">
              <BudgetsManager
                budgets={budgets}
                transactions={transactions}
                onAddBudget={handleAddBudget}
                onDeleteBudget={handleDeleteBudget}
              />
              <GoalsManager
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onDeleteGoal={handleDeleteGoal}
              />
            </div>
          )}

          {activeTab === 'springboot' && (
            <div className="h-full animate-[fadeIn_0.20s_ease-out]">
              <SpringBootSimulator logs={bootLogs} transactions={transactions} />
            </div>
          )}
        </div>
      </main>

      {/* Transaction insertion popup modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen || !!editingTransaction}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
