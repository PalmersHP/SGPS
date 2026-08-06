# PLAN-sombrear-engenharia

## 1. Overview
O objetivo é desenvolver o sistema web **Sombrear Engenharia – Controle de Obras**, voltado para a gestão operacional da engenharia da Sombrear. O sistema atuará como um Kanban de execução de obras, garantindo que todas as etapas (do contrato à entrega) sejam controladas rigorosamente através de checklists obrigatórios, dashboards gerenciais e controle de pendências.

## 2. Project Type
**WEB** (Web Application)

## 3. Success Criteria
- [ ] Login funcional diferenciando Proprietário (somente visualização) e Engenharia/Admin (acesso completo).
- [ ] Dashboard gerencial exibindo KPIs em tempo real (obras ativas, vagas contratadas, valores, pendências).
- [ ] Kanban operacional com 12 colunas e funcionalidade de movimentação de cards.
- [ ] Modal de cadastro de obra com cálculo automático de quantitativos e checklists obrigatórios por etapa.
- [ ] Interface seguindo a identidade visual Sombrear (Verde principal #8DC63F, Grafite #2B2B2B, Montserrat/Poppins).

## 4. Tech Stack
Com base na complexidade exigida (Kanban interativo, relatórios, tempo real, multi-usuário) e integrando com a infraestrutura já planejada em versões anteriores:
- **Frontend**: `Next.js` com `React` e `Tailwind CSS`. Racional: O Tailwind acelera a UI moderna exigida, e o React simplifica enormemente a criação de um Kanban drag-and-drop complexo. (Substitui Vanilla JS pela necessidade de gerenciar múltiplos estados no Kanban).
- **Backend & Database**: `Supabase` (PostgreSQL + Auth + Storage). Racional: Mantém o que já havia sido definido no ecossistema Sombrear (custo inicial zero, autenticação out-of-the-box, banco relacional robusto e Storage para fotos/PDFs).
- **Hospedagem**: `Vercel`. Racional: Deploy contínuo e sem atrito com Next.js.
- **Ícones e Gráficos**: `Lucide React` (ícones) e `Recharts` ou `Chart.js` (para o dashboard).
- **Drag and Drop**: `dnd-kit` ou `hello-pangea/dnd` para o Kanban.

## 5. File Structure (Next.js App Router)
```text
/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/proprietario/page.tsx
│   │   ├── (dashboard)/engenharia/kanban/page.tsx
│   │   ├── (dashboard)/engenharia/relatorios/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Kanban/
│   │   │   ├── Board.tsx
│   │   │   ├── Column.tsx
│   │   │   └── Card.tsx
│   │   ├── Obra/
│   │   │   ├── ModalObra.tsx
│   │   │   ├── Checklist.tsx
│   │   │   └── Quantitativo.tsx
│   │   └── ui/ (Tailwind components)
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       └── database.types.ts
└── supabase/
    └── migrations/
```

## 6. Task Breakdown

- [ ] **Task 1: Setup do Projeto e Autenticação**
  - **Agent:** `frontend-specialist` + `backend-specialist`
  - **Skill:** `nextjs-react-expert`, `database-design`
  - **INPUT:** Inicializar Next.js + Tailwind. Configurar projeto no Supabase e conectar chaves.
  - **OUTPUT:** Tabelas de `perfis` no Supabase e Tela de Login funcional.
  - **VERIFY:** Usuário "Proprietário" loga e vai para `/proprietario`, "Engenheiro" vai para `/engenharia`.

- [ ] **Task 2: Modelagem do Banco de Dados (Obras e Checklists)**
  - **Agent:** `database-architect`
  - **Skill:** `database-design`
  - **INPUT:** Criar schemas para `obras`, `etapas`, `checklists`, `quantitativos`, `historico`.
  - **OUTPUT:** Migrations SQL aplicadas no Supabase.
  - **VERIFY:** Inserção manual de uma obra via painel do Supabase com sucesso.

- [ ] **Task 3: Layout Base e Identidade Visual**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`, `tailwind-patterns`
  - **INPUT:** Configurar fontes (Montserrat) e cores (Verde #8DC63F, Grafite #2B2B2B) no Tailwind. Criar layout shell (Sidebar + Header).
  - **OUTPUT:** Estrutura visual pronta para navegação.
  - **VERIFY:** Páginas em branco rodam com o estilo correto sem erros de UI.

- [ ] **Task 4: Kanban Board Core (Visual e Drag-and-Drop)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `nextjs-react-expert`
  - **INPUT:** Implementar as 12 colunas do Kanban e funcionalidade de arrastar cards (Obras).
  - **OUTPUT:** Kanban renderizado com dados mockados permitindo mudança de coluna.
  - **VERIFY:** Mover um card da coluna "1" para "2" reflete o estado na UI.

- [ ] **Task 5: Modal de Cadastro e Edição de Obra**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **INPUT:** Desenvolver formulário completo em abas: Dados Gerais, Contrato (com upload de arquivo), Tipos de Produto, Itens Extras.
  - **OUTPUT:** Modal funcional que envia dados para o banco.
  - **VERIFY:** Nova obra cadastrada aparece no Kanban.

- [ ] **Task 6: Lógica de Quantitativos e Fórmulas**
  - **Agent:** `backend-specialist`
  - **Skill:** `clean-code`
  - **INPUT:** Implementar cálculo automático de peças (ex: vagas / 2.5 = módulos) para Sombrite, Telha, etc, permitindo edição manual.
  - **OUTPUT:** Interface de quantitativo gerando valores baseados no input.
  - **VERIFY:** Alterar o número de vagas recalcula instantaneamente o número de módulos sugeridos.

- [ ] **Task 7: Lógica de Checklists Bloqueantes por Etapa**
  - **Agent:** `frontend-specialist` + `backend-specialist`
  - **Skill:** `clean-code`
  - **INPUT:** Criar checklist de itens para cada uma das 12 colunas. Impedir o avanço do card (drag drop) se pendências obrigatórias não estiverem marcadas.
  - **OUTPUT:** Validação antes de atualizar a coluna da obra no banco.
  - **VERIFY:** Tentativa de arrastar obra de "Cadastro Técnico" sem "Tipo de produto definido" retorna aviso e cancela a ação.

- [ ] **Task 8: Dashboard Gerencial (Proprietário e Admin)**
  - **Agent:** `frontend-specialist`
  - **Skill:** `frontend-design`
  - **INPUT:** Desenvolver os KPIs e gráficos solicitados na seção 10 (Total ativas, valor em execução, vagas montadas, funil de etapas).
  - **OUTPUT:** Painel visual alimentado pelos dados do Supabase.
  - **VERIFY:** O valor total em execução soma exatamente o valor das obras que não estão na coluna "Entrega".

- [ ] **Task 9: Linha do Tempo (Histórico) e Relatórios Básicos**
  - **Agent:** `backend-specialist`
  - **Skill:** `api-patterns`
  - **INPUT:** Gravar na tabela `historico` cada mudança de etapa ou checklist. Criar tabelas de dados exportáveis.
  - **OUTPUT:** Aba de "Timeline" no modal da obra funcionando.
  - **VERIFY:** Mudar o status de uma obra registra no histórico "Usuário X moveu para coluna Y às [hora]".

## 7. ✅ PHASE X: VERIFICATION

- [ ] **Regras Gerais:**
  - Nenhuma cor "roxa/violeta" (Purple Ban respeitado).
  - Layout não é um template clichê.
- [ ] **Automação:**
  - Executar: `npm run lint && npx tsc --noEmit`
  - Executar P1: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
  - Build test: `npm run build`
- [ ] **Testes de Funcionalidade:**
  - Conseguimos criar uma obra do início ao fim?
  - O bloqueio de etapas funcionou?
  - Dashboard refletiu os dados inseridos?
