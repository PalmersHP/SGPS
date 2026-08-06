# PLAN — Sombrear Varejo (varejo.html)

## 1. Visão Geral

Sistema de gestão de pedidos de varejo integrado ao Ecossistema Sombrear. Arquivo único `varejo.html` em Vanilla HTML/JS + Supabase, seguindo o mesmo padrão de `ecosistema.html` e `engenharia.html`. Sem frameworks externos — garante zero overhead de deploy e total consistência visual.

**URL final:** `sombrear-ecosistema.vercel.app/varejo.html`
**Entrada no Ecossistema:** novo card "Pedidos Varejo" no `ecosistema.html`

---

## 2. Melhorias sobre o Escopo Original

| Proposta Original | Melhoria Adotada |
|---|---|
| Lista de pedidos | **Pipeline Kanban** com arrastar-e-soltar entre status |
| Notificação por e-mail/WhatsApp externo | **Central de notificações interna** + link wa.me direto |
| CEP manual | **Busca automática de CEP** via ViaCEP |
| Upload de arquivos (S3/Drive) | **Links externos** (Drive/Dropbox) + upload leve via Supabase Storage |
| Dashboard genérico | **3 dashboards distintos por perfil** (comercial / engenharia / financeiro) |
| Medida única | **Separação obrigatória** medida comercial vs. técnica com lock após aprovação |
| React/Next.js | **Vanilla JS** — consistência com o ecossistema, deploy instantâneo |

---

## 3. Perfis e Permissões

| Perfil | Criar pedido | Editar | Aprovar | Ver financeiro | Admin |
|---|---|---|---|---|---|
| `proprietario` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `gestor` | ✅ | ✅ | ✅ | ✅ | — |
| `vendedor` | ✅ | próprios | — | — | — |
| `engenharia` | — | ✅ | ✅ | — | — |
| `financeiro` | — | — | — | ✅ (só leitura) | — |

---

## 4. Banco de Dados (Supabase — projeto Sombrear)

### 4.1 Tabelas

```sql
-- Clientes
var_clientes (
  id UUID PK,
  tipo TEXT,                  -- 'pf' | 'pj'
  nome TEXT,
  cpf_cnpj TEXT,
  telefone TEXT,
  telefone2 TEXT,
  contato TEXT,
  email TEXT,
  email_nf TEXT,
  cep TEXT, endereco TEXT, numero TEXT, complemento TEXT,
  bairro TEXT, cidade TEXT, estado TEXT, maps_link TEXT,
  criado_por UUID → ecm_perfis,
  created_at TIMESTAMPTZ
)

-- Pedidos
var_pedidos (
  id UUID PK,
  numero SERIAL UNIQUE,       -- gerado automaticamente: VR-00001
  cliente_id UUID → var_clientes,
  vendedor_id UUID → ecm_perfis,
  status TEXT,                -- ver fluxo de status abaixo
  origem_lead TEXT,
  canal_venda TEXT,
  descricao TEXT,
  checklist_produto JSONB,    -- itens técnicos do produto
  -- Medidas Comerciais
  med_com_largura NUMERIC,
  med_com_comprimento NUMERIC,
  med_com_altura NUMERIC,
  med_com_vagas INTEGER,
  med_com_obs TEXT,
  -- Medidas Técnicas (preenchidas pela engenharia)
  med_tec_largura NUMERIC,
  med_tec_comprimento NUMERIC,
  med_tec_altura NUMERIC,
  med_tec_vagas INTEGER,
  med_tec_tipo TEXT,
  med_tec_obs TEXT,
  med_tec_locked BOOLEAN DEFAULT false,
  -- Prazos
  prazo_comercial TEXT,
  prazo_tecnico TEXT,
  data_fabricacao DATE,
  data_instalacao DATE,
  data_entrega DATE,
  -- Financeiro
  valor_total NUMERIC,
  valor_entrada NUMERIC,
  forma_pagamento TEXT,
  num_parcelas INTEGER,
  valor_parcela NUMERIC,
  datas_vencimento JSONB,     -- array de datas
  taxa_admin NUMERIC,
  obs_financeiro TEXT,
  -- Controle
  aprovado_eng_por UUID,
  aprovado_eng_em TIMESTAMPTZ,
  liberado_fin_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Documentos por pedido
var_pedido_docs (
  id UUID PK,
  pedido_id UUID → var_pedidos,
  tipo TEXT,                  -- 'orcamento' | 'contrato' | 'foto' | 'outro'
  nome TEXT,
  url TEXT,                   -- link Drive/Dropbox ou URL Supabase Storage
  storage_path TEXT,          -- se upload direto
  etapa TEXT,                 -- 'pré-obra' | 'execução' | 'entrega'
  comentario TEXT,
  criado_por UUID → ecm_perfis,
  created_at TIMESTAMPTZ
)

-- Histórico/Auditoria
var_pedido_historico (
  id UUID PK,
  pedido_id UUID → var_pedidos,
  usuario_id UUID → ecm_perfis,
  tipo TEXT,                  -- 'status' | 'edicao' | 'doc' | 'comentario'
  descricao TEXT,
  dados_anterior JSONB,
  created_at TIMESTAMPTZ
)

-- Notificações internas
var_notificacoes (
  id UUID PK,
  destinatario_id UUID → ecm_perfis,
  pedido_id UUID,
  titulo TEXT,
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

### 4.2 Fluxo de Status (máquina de estados)

```
novo_pedido
    ↓
em_analise          ← engenharia recebe e inicia análise
    ↓
aguardando_docs     ← engenharia solicita documentação (opcional)
    ↓ (ou direto de em_analise)
aprovado_eng        ← engenharia aprova; financeiro é desbloqueado
    ↓
liberado_fin        ← admin/gestor libera para operação
    ↓
em_fabricacao
    ↓
em_execucao
    ↓
finalizado
    (+ cancelado a qualquer momento por admin/gestor)
```

**Regras de bloqueio:**
- Financeiro só vê valores/contratos após `aprovado_eng`
- Medidas técnicas travam (`med_tec_locked = true`) após `em_fabricacao`
- Vendedor não avança status após `aprovado_eng` (só leitura)

---

## 5. Estrutura de Views (UI)

### 5.1 Header/Sidebar
- Idêntica ao `ecosistema.html` e `engenharia.html`
- Ícone de sino com badge de notificações não lidas
- Saudação personalizada por nome

### 5.2 Views

```
view-dashboard      → KPIs por perfil (3 painéis diferentes)
view-pedidos        → Pipeline Kanban + lista alternável
view-clientes       → Tabela de clientes com busca
view-relatorios     → Relatórios filtráveis (admin/fin/gestor)
view-notificacoes   → Central de alertas internos
```

### 5.3 Modal de Pedido (6 abas)

```
[Geral] [Medidas] [Produto] [Financeiro] [Documentos] [Histórico]
```

**Aba Geral:**
- Número, data, vendedor, status badge
- Cliente (busca ou cadastro rápido inline)
- Origem do lead, canal de venda
- Prazo comercial e prazos de execução

**Aba Medidas:**
- Coluna esquerda: Medida Comercial (vendedor preenche)
- Coluna direita: Medida Técnica (apenas engenharia — campo bloqueado para vendedor)
- Badge vermelho "⚠ Divergência" se largura/comprimento diferem > 10%

**Aba Produto:**
- Textarea ampla para descrição livre
- Checklist técnico configurável (tipo cobertura, cor, pintura, fixação...)
- Upload de fotos com label de etapa

**Aba Financeiro:**
- Visível completa: admin, gestor, financeiro, engenharia
- Visível parcial (só valor total): vendedor
- Campos: valor, entrada, forma de pagamento, parcelamento, datas, taxa, observações
- Resumo visual: "Entrada R$ X + Y parcelas de R$ Z"

**Aba Documentos:**
- 3 seções: Orçamento / Contrato / Fotos da Obra
- Cada seção: botão "Inserir link" (Drive/Dropbox) + botão "Upload arquivo"
- Fotos organizadas em cards com etapa e comentário

**Aba Histórico:**
- Timeline cronológica: criação, edições, mudanças de status, docs adicionados
- "João moveu para Em Fabricação — 12/05 às 14h"

---

## 6. Dashboards por Perfil

### Dashboard Comercial (vendedor / gestor / admin)
- KPIs: Total vendido no mês | Qtd pedidos | Ticket médio | Taxa conversão
- Gráfico: pedidos por status (barras horizontais — puro CSS, sem libs)
- Ranking de vendedores (só visível para gestor/admin)
- Lista: meus pedidos recentes (últimos 10)

### Dashboard Engenharia
- KPIs: Aguardando análise | Em fabricação | Em execução | Atrasados
- Fila de aprovação (pedidos em `em_analise` ordenados por data)
- Alertas de prazo: obras com entrega em menos de 7 dias

### Dashboard Financeiro
- KPIs: Valor total vendido | Contratos liberados | A receber no mês
- Tabela: pedidos liberados com valor e status de pagamento
- Fluxo previsto: próximas datas de vencimento

---

## 7. Funcionalidades de Melhoria Adicional

### 7.1 Busca de CEP automática
```js
// ViaCEP — gratuito, sem chave
fetch('https://viacep.com.br/ws/'+cep+'/json/')
```

### 7.2 WhatsApp integrado
- Botão "Contatar cliente" → `wa.me/55{telefone}?text=...`
- Mensagem pré-formatada com número do pedido

### 7.3 Numeração automática de pedidos
- Formato: `VR-00001`, `VR-00002`...
- Gerada por sequence no Supabase

### 7.4 Notificações internas
- Inserção em `var_notificacoes` nas transições de status
- Badge no sino atualizado a cada carregamento de página
- Clique na notificação abre o pedido correspondente

### 7.5 Kanban com Sortable.js (já em uso no engenharia.html)
- Colunas: Novo → Análise → Docs → Aprovado → Financeiro → Fabricação → Execução → Finalizado
- Cards com: número, cliente, valor, vendedor, badge status, ícone docs
- Drag-and-drop com validação de permissão e regras de bloqueio

---

## 8. Task Breakdown

### Task 1 — SQL: Tabelas e RLS
- Criar as 5 tabelas no Supabase Sombrear
- RLS: vendedor vê só os próprios; financeiro vê apenas campos liberados
- Sequence para numeração VR-XXXXX
- Trigger: registra histórico em todas as mudanças de status

### Task 2 — Shell e Autenticação
- Reaproveitar SSO do `ecm_session` (mesmo padrão do ecosistema.html)
- Detectar perfil e montar sidebar/views corretas
- Redirecionar para ecosistema.html se não autenticado

### Task 3 — CSS e Identidade Visual
- Verde #8DC63F, Grafite #2B2B2B, Montserrat/system-ui
- Cards Kanban, badges de status coloridos, modal com abas

### Task 4 — Pipeline Kanban
- 8 colunas com Sortable.js
- Cards com info resumida
- Bloqueio de drag por perfil e regras de status
- Filtros: por vendedor, por período, por status

### Task 5 — Modal de Pedido (6 abas)
- Cadastro de cliente inline (busca ou novo)
- CEP autofill
- Medidas comercial vs técnica com lock
- Checklist de produto

### Task 6 — Módulo Financeiro
- Campos financeiros com visibilidade por perfil
- Resumo de parcelamento visual
- Liberação controlada após aprovação eng.

### Task 7 — Gestão Documental
- Upload via Supabase Storage (PDFs/imagens)
- Links externos (Drive/Dropbox)
- Galeria de fotos por etapa

### Task 8 — Dashboards (3 versões)
- Comercial, Engenharia, Financeiro
- KPIs em tempo real via queries Supabase
- Ranking de vendedores

### Task 9 — Histórico e Notificações
- Trigger automático de histórico
- Sistema de notificações internas
- Badge no sino

### Task 10 — Integração Ecossistema
- Novo card "Pedidos Varejo" no ecosistema.html
- Stats: pedidos ativos + valor do mês

---

## 9. Critérios de Sucesso

- [ ] Vendedor cria pedido completo em menos de 3 minutos
- [ ] Engenharia aprova e completa medidas técnicas
- [ ] Financeiro visualiza contrato sem poder editar
- [ ] Histórico registra todas as transições de status
- [ ] Kanban atualiza ao arrastar sem recarregar página
- [ ] Busca de CEP preenche endereço automaticamente
- [ ] Notificação aparece ao destinatário na próxima abertura do sistema
- [ ] Login via SSO do Ecossistema (sem login separado)

---

## 10. Estimativa de Execução

| Task | Complexidade |
|---|---|
| Task 1 — SQL | Baixa |
| Task 2 — Shell/Auth | Baixa (reutiliza padrão) |
| Task 3 — CSS | Baixa |
| Task 4 — Kanban | Média |
| Task 5 — Modal Pedido | Alta |
| Task 6 — Financeiro | Média |
| Task 7 — Documentos | Média |
| Task 8 — Dashboards | Média |
| Task 9 — Histórico/Notif | Baixa |
| Task 10 — Integração | Baixa |

---

## 11. Decisões de Arquitetura

1. **Vanilla HTML/JS** — consistência com o ecossistema, zero overhead de build
2. **Supabase Storage** para uploads (já configurado no projeto)
3. **Sem libs de gráficos** — KPIs em CSS puro (barras, números grandes)
4. **Sortable.js CDN** — já em uso no engenharia.html, sem nova dependência
5. **ViaCEP** para CEP — gratuito, sem chave de API
6. **WhatsApp via wa.me** — sem integração de API paga
7. **RLS no Supabase** como principal controle de acesso (segurança server-side)
8. **Trigger PostgreSQL** para histórico automático (sem lógica no JS)
