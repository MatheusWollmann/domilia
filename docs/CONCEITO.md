# Domilia - Conceito do Projeto

## 1. Visão Geral

**Nome:** Domilia (Derivado de *Domus* + *Família* + *IA*)

**Elevator Pitch:** O Domilia é uma plataforma SaaS (Software como Serviço) projetada para ser o centro de controle da vida doméstica moderna. Nosso objetivo é simplificar e centralizar o gerenciamento do lar, unificando finanças, tarefas e, futuramente, outros aspectos da rotina familiar em uma interface intuitiva e inteligente.

**Público-Alvo:** Famílias e indivíduos que buscam clareza, organização e controle sobre as finanças e responsabilidades do lar. O foco são pessoas que se sentem sobrecarregadas com a "carga mental" de gerenciar a casa e procuram uma solução tecnológica para aliviar esse peso.

**Diferencial:** A proposta de valor do Domilia reside na sua capacidade de centralização e na futura integração de inteligência artificial para fornecer insights proativos, automação de tarefas e sugestões personalizadas para otimizar a gestão do lar.

---

## 2. Status Atual do Produto (MVP+)

O projeto já superou a fase de Produto Mínimo Viável (MVP) e conta com um núcleo financeiro robusto e funcional.

### Funcionalidades Implementadas:

- **Autenticação Segura:** Sistema completo de cadastro e login de usuários.
- **Dashboard Financeiro:** Visão geral da saúde financeira com cards para Saldo Disponível, Total de Receitas e Total de Despesas do mês.
- **Gráficos Visuais:**
  - Gráfico de pizza no dashboard para análise da distribuição de despesas por categoria.
- **Gestão de Transações (CRUD Completo):**
  - Adição, visualização, edição e exclusão de receitas e despesas.
- **Página de Relatórios Avançados:**
  - Navegação intuitiva por mês para análise detalhada.
  - Gráfico de barras comparativo da evolução de receitas vs. despesas nos últimos 6 meses.
  - Exportação de dados do período selecionado para formato CSV.
- **Configurações e Personalização:**
  - Página de configurações robusta com interface de abas.
  - CRUD completo para categorias personalizadas de receitas e despesas, com orçamento opcional para despesas.
  - CRUD completo para contas recorrentes (receitas e despesas), permitindo automatizar lançamentos futuros.
- **Implementar sistema de 'Domus' (Casas) compartilhadas:** Permitir que múltiplos usuários acessem e gerenciem o mesmo conjunto de dados.
---

## 3. Stack Tecnológica

- **Frontend:** `Next.js 15`, `React 19`, `TypeScript`, `Tailwind CSS`
- **Backend & Base de Dados:** `Supabase` (utilizando `PostgreSQL` para dados e `Supabase Auth` para autenticação)
- **Bibliotecas Notáveis:** `Recharts` (gráficos), `react-hook-form` & `Zod` (formulários e validação), `date-fns` (manipulação de datas)
- **Hospedagem (Deploy):** `Vercel`

---

## 4. Roadmap Futuro (Próximos Passos)

### Curto Prazo:

- **Módulo de Tarefas Domésticas:** Desenvolver a funcionalidade principal para criar, atribuir e marcar tarefas domésticas como concluídas.
- **Lançamento Automático de Recorrentes:** Criar um mecanismo (provavelmente via Edge Functions da Supabase) para lançar as contas recorrentes automaticamente nas datas corretas.

### Médio Prazo (Fase Alpha/Beta):
- **Integração Final nos Relatórios:** Garantir que os relatórios e gráficos financeiros utilizem 100% as categorias personalizadas.
- **Orçamento Familiar:** Ferramentas para criar metas de gastos por categoria e acompanhar o progresso.
- **Lançamento de um PWA (Progressive Web App):** Para uma experiência otimizada em dispositivos móveis.

### Longo Prazo (Visão 1.0+):
- **Módulo de Inventário:** Controle de estoque de itens domésticos e de supermercado.
- **Módulo de Documentos:** Armazenamento seguro de documentos e contas importantes.
- **Aplicativo Mobile Nativo (iOS/Android).**
- **Integração com Open Banking** para importação automática de transações.
- **Funcionalidades de IA:** Análise de padrões de gastos, sugestões de economia, e automação de categorização.

---

## 5. Modelo de Negócio (Planejado)

- **Plano Gratuito (Freemium):** Acesso ao módulo financeiro essencial para um usuário, servindo como porta de entrada para a plataforma.
- **Plano Família (Assinatura Mensal):** Todos os módulos, múltiplos usuários, colaboração em tempo real.
- **Plano Premium (Assinatura Mensal):** Funcionalidades avançadas, gerenciamento de múltiplas propriedades, suporte prioritário.
