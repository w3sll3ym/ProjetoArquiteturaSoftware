# FinançaPro - Sistema de Controle Financeiro Pessoal

**FinançaPro** é uma plataforma moderna e elegante de planejamento financeiro pessoal de alta fidelidade desenvolvida com uma interface de balanço geométrico. O sistema oferece uma experiência visual impecável para que profissionais e indivíduos gerenciem suas finanças com máxima clareza e controle.

O projeto é integrado a uma simulação fidedigna de microsserviço de retaguarda desenvolvido em **Java com Spring Boot 3** e banco de dados relacional **H2 / PostgreSQL**, com console interativo de banco de dados e logs em tempo real.

---

## 🚀 Funcionalidades Principais

### 1. Painel de Controle (Dashboard)
- **Visão Geral Financeira**: Cartões de status com somatórios de receitas, despesas e saldo líquido consolidado.
- **Gráficos Dinâmicos**: Análise visual inteligente do fluxo de caixa e progresso de gastos mensais por categoria.
- **Últimas Atividades**: Acesso rápido às transações listadas recentemente.

### 2. Controle de Lançamentos (Transações)
- **Histórico Completo**: Visualização robusta de todas as transações cadastradas no banco de dados.
- **Filtros Avançados**: Busca instantânea por descrição e observações, filtro por classes (Receitas/Despesas) e categorias específicas.
- **Formulário Inteligente**: Cadastro e edição de lançamentos com validações de campos.

### 3. Planejamento Orçamentário e Metas
- **Orçamentos**: Definição de limites de gastos por categoria (Ex: Transporte, Alimentação, Saúde) com avisos e logs automáticos em caso de estouro do teto.
- **Metas de Poupança**: Criação de objetivos financeiros de médio/longo prazo (Ex: Reserva de Emergência, Viagem), com barra de progresso em tempo real e formulário integrado para aportes e resgates.

### 4. Retaguarda Integrada (Spring Boot & H2 Database)
- **Visualizador Spring Boot**: Painel completo para acompanhamento dos logs reais de inicialização da JVM, rotas e mapeamento da API.
- **Arquitetura Java**: Código-fonte autêntico exposto no painel, contendo:
  - `TransactionController.java` (REST Controller com mapeamento CRUD, CORS habilitado)
  - `Transaction.java` (Entidade JPA mapeada corretamente para a tabela `tb_transacoes` utilizando persistência padrão Jakarta)
  - `TransactionRepository.java` (Interface JPA estendendo `JpaRepository` com ordenação nativa por data)
  - `application.properties` (Mapeamentos do banco H2 para desenvolvimento ágil e PostgreSQL para ambiente produtivo)
- **Painel H2 Console**: Console interativo de banco de dados SQL onde é possível executar pesquisas reais como `SELECT * FROM tb_transacoes;` ou agrupamentos estatísticos diretamente em tela.

---

## 🛠️ Tecnologias Utilizadas

### Front-End (Interface SPA)
- **React 18** com **Vite** para inicialização veloz e modularização.
- **TypeScript** para assegurar tipagem estática e segurança do código.
- **Tailwind CSS** para estilização utilitária elegante e design responsivo.
- **Recharts** para renderização de gráficos de alta qualidade.
- **Lucide React** para iconografia limpa e moderna.

### Back-End (Modelagem de Retaguarda)
- **Java 17**
- **Spring Boot 3.2.5** (Spring Web, JPA, Starter Validation)
- **Lombok** para redução de código boiler-plate
- **H2 Database** (para persistência relacional ágil)
- **PostgreSQL** Dialect (preparado para produção)

---

## 👥 Desenvolvedores do Projeto

O desenvolvimento, concepção e integração deste sistema de controle financeiro profissional foram realizados por:

* **WESLLEY MATHEUS GOMES FREIRE FERREIRA** | MATRÍCULA: 01717630
* **EMILY VITÓRIA LACERDA DA SILVA** | MATRÍCULA: 01360848
