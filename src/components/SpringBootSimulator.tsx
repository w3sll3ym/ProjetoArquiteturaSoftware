import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface SpringBootSimulatorProps {
  logs: string[];
  transactions: Transaction[];
}

export const SpringBootSimulator: React.FC<SpringBootSimulatorProps> = ({ logs, transactions }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'controller' | 'entity' | 'properties' | 'h2-console'>('terminal');
  const [h2Connected, setH2Connected] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM tb_transacoes ORDER BY data DESC;');
  const [sqlResult, setSqlResult] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal to bottom when new logs are received
  useEffect(() => {
    if (terminalEndRef.current && activeTab === 'terminal') {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Execute SQL inside our simulator
  const handleExecuteSQL = (queryToRun: string) => {
    setSqlError(null);
    const cleaned = queryToRun.trim().toLowerCase().replace(/;$/, '');

    try {
      if (!cleaned.startsWith('select')) {
        throw new Error('Erro de Sintaxe: No ambiente de demonstração, realize apenas consultas com SELECT.');
      }

      if (cleaned.includes('group by') && cleaned.includes('categoria')) {
        // Aggregated view by category
        const isExpense = cleaned.includes("tipo = 'despesa'") || cleaned.includes("tipo='despesa'");
        const isIncome = cleaned.includes("tipo = 'receita'") || cleaned.includes("tipo='receita'");
        
        let filtered = transactions;
        if (isExpense) filtered = transactions.filter(t => t.tipo === 'despesa');
        if (isIncome) filtered = transactions.filter(t => t.tipo === 'receita');

        const groups: { [key: string]: number } = {};
        filtered.forEach(t => {
          groups[t.categoria] = (groups[t.categoria] || 0) + t.valor;
        });

        const headers = ['CATEGORIA', 'TOTAL_A_RECEBER_OU_GASTO (R$)'];
        const rows = Object.entries(groups).map(([cat, sum]) => [
          cat.toUpperCase(),
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sum)
        ]);

        setSqlResult({ headers, rows });
        return;
      }

      // Default SELECT * from table
      if (cleaned.includes('from tb_transacoes') || cleaned.includes('from tb_transações')) {
        let list = [...transactions];

        // Apply filters
        if (cleaned.includes("tipo = 'receita'") || cleaned.includes("tipo='receita'")) {
          list = list.filter(t => t.tipo === 'receita');
        } else if (cleaned.includes("tipo = 'despesa'") || cleaned.includes("tipo='despesa'")) {
          list = list.filter(t => t.tipo === 'despesa');
        }

        // Apply valor filter
        if (cleaned.includes('valor >')) {
          const match = cleaned.match(/valor\s*>\s*(\d+)/);
          if (match && match[1]) {
            const limit = parseFloat(match[1]);
            list = list.filter(t => t.valor > limit);
          }
        }

        // Apply ordering
        if (cleaned.includes('order by data desc')) {
          list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        } else if (cleaned.includes('order by data asc')) {
          list.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        }

        const headers = ['ID', 'DESCRICAO', 'VALOR', 'TIPO', 'CATEGORIA', 'DATA', 'OBSERVACAO'];
        const rows = list.map(t => [
          t.id.toUpperCase(),
          t.descricao,
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor),
          t.tipo.toUpperCase(),
          t.categoria.toUpperCase(),
          t.data,
          t.observacao || 'NULL'
        ]);

        setSqlResult({ headers, rows });
      } else {
        throw new Error('Tabela não encontrada. Utilize a tabela: tb_transacoes');
      }
    } catch (err: any) {
      setSqlError(err.message || 'Erro de Execução SQL.');
      setSqlResult(null);
    }
  };

  // Run initial query when connected
  useEffect(() => {
    if (h2Connected) {
      handleExecuteSQL(sqlQuery);
    }
  }, [h2Connected, transactions]);

  const controllerCode = `package com.financapro.api.controller;

import com.financapro.api.model.Transaction;
import com.financapro.api.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Permite comunicação com React/Vite
public class TransactionController {

    @Autowired
    private TransactionRepository repository;

    @GetMapping
    public List<Transaction> getAll() {
        return repository.findAllByOrderByDataDesc();
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        Transaction saved = repository.save(transaction);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable String id, @RequestBody Transaction details) {
        return repository.findById(id)
            .map(tx -> {
                tx.setDescricao(details.getDescricao());
                tx.setValor(details.getValor());
                tx.setTipo(details.getTipo());
                tx.setCategoria(details.getCategoria());
                tx.setData(details.getData());
                tx.setObservacao(details.getObservacao());
                return ResponseEntity.ok(repository.save(tx));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}`;

  const entityCode = `package com.financapro.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_transacoes")
@Data // Lombok gera getters, setters, toString
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private String tipo; // "receita" ou "despesa"

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private LocalDate data;

    @Column(columnDefinition = "TEXT")
    private String observacao;
}`;

  const propertiesCode = `# Configurações de Porta do Servidor Tomcat
server.port=8080

# BANCO DE DADOS PADRÃO: H2 (Banco em memória relacional para desenvolvimento ágil)
spring.datasource.url=jdbc:h2:mem:financapro_db;DB_CLOSE_DELAY=-1
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Console Web do Banco de Dados H2 habilitado em http://localhost:8080/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Inicializador Hibernate DDL (Gera e atualiza tabelas automaticamente no banco)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Ajuste de fusos e internacionalização
spring.jackson.time-zone=America/Sao_Paulo
spring.jackson.date-format=yyyy-MM-dd`;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header bar */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
            <CategoryIcon name="Database" size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-tight text-white flex items-center">
              Retaguarda Java & Spring Boot
              <span className="ml-2.5 inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              v3.2.5 • Banco {h2Connected ? 'H2 Ativo e Conectado' : 'PostgreSQL/H2 Configurado'}
            </p>
          </div>
        </div>

        {/* View Selection Menu */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'terminal' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'controller' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Controller
          </button>
          <button
            onClick={() => setActiveTab('entity')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'entity' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Entity
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'properties' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Props
          </button>
          <button
            onClick={() => {
              setActiveTab('h2-console');
              if (!h2Connected) setH2Connected(true);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center ${activeTab === 'h2-console' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-500'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            H2 Console
          </button>
        </div>
      </div>

      {/* Code / Console Output Window */}
      <div className="flex-1 p-5 font-mono text-xs overflow-y-auto max-h-[460px] bg-slate-950">
        {activeTab === 'terminal' && (
          <div className="space-y-1.5 h-full">
            <div className="text-slate-400 mb-2 italic">// Log de execução de microsserviço Spring Boot em tempo real</div>
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed break-all whitespace-pre-wrap select-text">
                {log.includes('INFO') && <span className="text-emerald-500">INFO</span>}
                {log.includes('WARN') && <span className="text-amber-500">WARN</span>}
                {log.includes('ERROR') && <span className="text-rose-500">ERROR</span>}
                {log.slice(log.indexOf('---') !== -1 ? log.indexOf('---') : 0)}
              </div>
            ))}
            <div ref={terminalEndRef}></div>
          </div>
        )}

        {activeTab === 'controller' && (
          <pre className="text-sky-300 leading-relaxed overflow-x-auto selection:bg-slate-800">
            <code>{controllerCode}</code>
          </pre>
        )}

        {activeTab === 'entity' && (
          <pre className="text-emerald-300 leading-relaxed overflow-x-auto selection:bg-slate-800">
            <code>{entityCode}</code>
          </pre>
        )}

        {activeTab === 'properties' && (
          <pre className="text-rose-300 leading-relaxed overflow-x-auto selection:bg-slate-800">
            <code>{propertiesCode}</code>
          </pre>
        )}

        {activeTab === 'h2-console' && (
          <div className="h-full flex flex-col space-y-4">
            {!h2Connected ? (
              // H2 Console Login Screen Mockup
              <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6 my-4">
                <div className="flex items-center space-x-3 mb-4 border-b border-slate-800 pb-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center font-bold text-slate-900 text-xs">H2</div>
                  <h4 className="text-slate-200 font-bold text-sm">H2 Console - Login de Conexão</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-500">Driver Class</label>
                    <input type="text" disabled value="org.h2.Driver" className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-slate-400 rounded-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">JDBC URL</label>
                    <input type="text" disabled value="jdbc:h2:mem:financapro_db" className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-slate-300 rounded-xs font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500">User Name</label>
                      <input type="text" disabled value="sa" className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-slate-300 rounded-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500">Password</label>
                      <input type="text" disabled value="" className="w-full bg-slate-950 border border-slate-800 px-2 py-1 text-slate-500 rounded-xs" placeholder="(sem senha)" />
                    </div>
                  </div>
                  <button
                    onClick={() => setH2Connected(true)}
                    className="w-full bg-amber-500 font-bold text-slate-900 py-2 rounded-lg hover:bg-amber-400 transition-all font-sans text-xs mt-2"
                  >
                    Conectar Banco de Dados
                  </button>
                </div>
              </div>
            ) : (
              // Active Interactive H2 Workspace
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Tables sidebar */}
                <div className="md:col-span-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h5 className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-2 flex items-center">
                    <CategoryIcon name="Database" size={12} className="mr-1" />
                    financapro_db
                  </h5>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center font-semibold text-slate-300">
                      <span className="text-amber-500 mr-1">📁</span> PUBLIC
                    </div>
                    <div className="pl-3 space-y-1.5">
                      <div className="flex items-center text-slate-300 bg-slate-900 px-1.5 py-1 rounded-sm border border-slate-800/50">
                        <span className="text-amber-400 mr-1.5">📊</span>
                        <span>TB_TRANSACOES</span>
                      </div>
                      <div className="pl-4 space-y-0.5 text-[10px] text-slate-500 font-mono">
                        <div>🔑 ID (VARCHAR)</div>
                        <div>DESCRICAO (VARCHAR)</div>
                        <div>VALOR (DECIMAL)</div>
                        <div>TIPO (VARCHAR)</div>
                        <div>CATEGORIA (VARCHAR)</div>
                        <div>DATA (DATE)</div>
                        <div>OBSERVACAO (CLOB)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Query execution screen */}
                <div className="md:col-span-3 space-y-4">
                  {/* Short query runner preset links */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Dicas rápidas SQL:</span>
                    <button
                      onClick={() => {
                        setSqlQuery('SELECT * FROM tb_transacoes ORDER BY data DESC;');
                        handleExecuteSQL('SELECT * FROM tb_transacoes ORDER BY data DESC;');
                      }}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xs text-[10px] text-amber-500/90 transition-all"
                    >
                      Exibir Todas
                    </button>
                    <button
                      onClick={() => {
                        setSqlQuery("SELECT * FROM tb_transacoes WHERE tipo = 'despesa';");
                        handleExecuteSQL("SELECT * FROM tb_transacoes WHERE tipo = 'despesa';");
                      }}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xs text-[10px] text-amber-500/90 transition-all"
                    >
                      Despesas
                    </button>
                    <button
                      onClick={() => {
                        setSqlQuery("SELECT categoria, SUM(valor) FROM tb_transacoes GROUP BY categoria;");
                        handleExecuteSQL("SELECT categoria, SUM(valor) FROM tb_transacoes GROUP BY categoria;");
                      }}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xs text-[10px] text-amber-500/90 transition-all"
                    >
                      Agrupar Categorias
                    </button>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-amber-400 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500/30"
                      />
                    </div>
                    <button
                      onClick={() => handleExecuteSQL(sqlQuery)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all font-sans text-xs shrink-0 self-stretch flex flex-col justify-center items-center"
                    >
                      <span>Executar</span>
                      <span className="text-[9px] font-normal leading-none mt-0.5">SQL Query</span>
                    </button>
                  </div>

                  {/* SQL Results area */}
                  <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Resultado da Consulta</span>
                      <span className="text-[9px] text-slate-500 font-mono">Retorno: {sqlResult ? `${sqlResult.rows.length} linhas` : '0'}</span>
                    </div>

                    <div className="p-3 overflow-x-auto max-h-[180px]">
                      {sqlError && (
                        <div className="text-rose-500 p-2 text-xs leading-relaxed bg-rose-500/5 rounded-xs border border-rose-500/20 italic">
                          ⚠️ {sqlError}
                        </div>
                      )}

                      {sqlResult && (
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-800">
                              {sqlResult.headers.map((h, i) => (
                                <th key={i} className="py-2 px-3 text-slate-400 font-bold font-mono">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sqlResult.rows.length === 0 ? (
                              <tr>
                                <td colSpan={sqlResult.headers.length} className="py-4 text-center text-slate-500 font-mono italic">
                                  Consulta retornou 0 linhas.
                                </td>
                              </tr>
                            ) : (
                              sqlResult.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-900/40">
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3 text-slate-300 font-mono truncate max-w-[120px]" title={val}>
                                      {val}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Tomcat rodando no endereço local:8080</span>
        <span>Estilo: Geometric Balance IDE</span>
      </div>
    </div>
  );
};
