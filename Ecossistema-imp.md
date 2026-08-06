# Ecossistema Obrasul — Plano de Implementação

> Empresa: Obrasul — Engenharia de fachadas, impermeabilização, telhados e pintura de áreas comuns.
> Arquitetura-base: mesma do Sombrear (single-file HTML + Supabase + Vercel). Reutiliza padrões já validados.

---

## 1. Visão Geral

O ecossistema é composto por **5 arquivos HTML** independentes, todos compartilhando o mesmo banco Supabase (projeto próprio da Obrasul, tabelas com prefixo `obs_`):

| Arquivo | Módulo | Quem usa |
|---|---|---|
| `ecosistema-obs.html` | Hub central / Auth / Usuários / Clientes | Todos (internos) |
| `engenharia-obs.html` | Controle de obras (Kanban, etapas, diário) | Engenheiros, encarregados |
| `financeiro-obs.html` | Financeiro (CP, CR, compras, RH, DRE) | Financeiro, gestores |
| `portal-sindico-obs.html` | Portal externo do síndico (somente leitura + comunicados) | Síndico / cliente |
| *(pasta separada)* | Orçamentos | Engenheiros, vendedores |

**Princípio de integração:** um condomínio (cliente) cadastrado no Ecossistema aparece automaticamente em Engenharia (como obra potencial) e Financeiro (como cliente para recebíveis). Uma obra criada na Engenharia já fica disponível no Financeiro para lançar custos vinculados a ela.

---

## 2. Arquitetura Técnica

Idêntica ao Sombrear — sem frameworks, sem build step:

```
HTML único por módulo
  └─ CSS inline (variáveis CSS, dark sidebar, cards)
  └─ JS inline (fetch direto ao Supabase REST API)
  └─ Supabase Auth (JWT + refresh token)
  └─ localStorage: obs_session (Ecossistema), obs_fin_session (Financeiro), obs_eng_session (Engenharia)
  └─ Deploy: Vercel (arrastar pasta ou CLI)
```

**Sessão compartilhada:** ao logar em qualquer módulo, todos os outros reconhecem o usuário (mesma lógica bidirecional implementada no Sombrear com `fin_session` ↔ `ecm_session`).

**Refresh de token:** `_withRefresh()` em todos os helpers — zero logout por JWT expirado.

**Audit log:** toda ação crítica (criar, editar, pagar, excluir) grava em `obs_audit_logs`. Tabela protegida (sem DELETE no RLS).

---

## 3. Perfis de Acesso (ROLE_MAP)

| Perfil | Acesso |
|---|---|
| `proprietario` | Admin total em todos os módulos |
| `gestor` | Admin em Engenharia e Financeiro |
| `financeiro` | Somente Financeiro |
| `engenheiro` | Engenharia + visualização Financeiro (readonly) |
| `encarregado` | Engenharia (campo) — lança diário, checklist, etapas |
| `orcamentista` | Somente módulo de Orçamentos |
| `vendedor` | Visualização de obras e clientes |

---

## 4. Banco de Dados — Supabase (prefixo `obs_`)

### 4.1 Núcleo compartilhado

```sql
-- Usuários (espelha ecm_perfis do Sombrear)
obs_perfis (id UUID PK refs auth.users, nome, perfil, email, cargo, unidade_id, ativo)

-- Clientes = Condomínios
obs_clients (
  id UUID PK,
  nome TEXT NOT NULL,           -- "Condomínio Res. Parque Sul"
  tipo TEXT,                    -- 'condominio' | 'pessoa_fisica' | 'pessoa_juridica'
  cnpj TEXT,
  sindico_nome TEXT,
  sindico_email TEXT,
  sindico_telefone TEXT,
  administradora TEXT,
  endereco TEXT,
  cidade TEXT,
  cep TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Empresas do grupo Obrasul (pode ter mais de uma CNPJ)
obs_companies (id UUID PK, nome, cnpj, razao_social, email, telefone, endereco, ativo)
```

### 4.2 Engenharia

```sql
-- Obras
obs_projects (
  id UUID PK,
  nome TEXT NOT NULL,
  client_id UUID refs obs_clients,
  company_id UUID refs obs_companies,
  tipo_servico TEXT,            -- 'fachada' | 'impermeabilizacao_pelotis' | 'impermeabilizacao_reservatorio'
                                -- | 'telhado' | 'pintura_hall' | 'pintura_area_comum' | 'misto'
  status TEXT,                  -- 'prospeccao' | 'orcamento' | 'aprovado' | 'mobilizacao'
                                -- | 'em_execucao' | 'vistoria' | 'entregue' | 'em_garantia' | 'cancelado'
  valor_contrato NUMERIC(12,2),
  valor_recebido NUMERIC(12,2) DEFAULT 0,
  valor_custo NUMERIC(12,2) DEFAULT 0,
  data_inicio DATE,
  data_prev_fim DATE,
  data_fim DATE,
  andares INT,                  -- para fachada
  area_m2 NUMERIC(10,2),
  responsavel_id UUID refs obs_perfis,
  encarregado_id UUID refs obs_perfis,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Tipos de obra com suas etapas padrão (template)
obs_project_types (id UUID PK, nome, descricao, ativo)

-- Etapas padrão por tipo de obra (template)
obs_type_stages (
  id UUID PK,
  project_type_id UUID refs obs_project_types,
  nome TEXT,
  ordem INT,
  obrigatoria BOOLEAN DEFAULT false,
  bloqueante BOOLEAN DEFAULT false   -- impede avançar se não concluída
)

-- Etapas efetivas de cada obra (instância do template)
obs_project_stages (
  id UUID PK,
  project_id UUID refs obs_projects,
  nome TEXT,
  ordem INT,
  status TEXT,    -- 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada'
  obrigatoria BOOLEAN,
  bloqueante BOOLEAN,
  responsavel_id UUID refs obs_perfis,
  data_prev DATE,
  data_conclusao DATE,
  observacoes TEXT
)

-- Diário de obra (registro diário do campo)
obs_diary (
  id UUID PK,
  project_id UUID refs obs_projects,
  data DATE NOT NULL,
  autor_id UUID refs obs_perfis,
  clima TEXT,                   -- 'sol' | 'nublado' | 'chuva' | 'chuva_forte'
  trabalhadores_presentes INT,
  atividades TEXT,
  ocorrencias TEXT,
  materiais_usados TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Fotos da obra
obs_photos (
  id UUID PK,
  project_id UUID refs obs_projects,
  stage_id UUID refs obs_project_stages,
  url TEXT NOT NULL,
  legenda TEXT,
  tipo TEXT,                    -- 'antes' | 'durante' | 'depois' | 'ocorrencia'
  autor_id UUID refs obs_perfis,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Checklists de segurança / qualidade
obs_checklists (
  id UUID PK,
  project_id UUID refs obs_projects,
  tipo TEXT,                    -- 'NR18' | 'qualidade' | 'entrega'
  data DATE,
  autor_id UUID refs obs_perfis,
  itens JSONB,                  -- [{label, ok, obs}]
  assinado BOOLEAN DEFAULT false
)
```

### 4.3 Financeiro

```sql
-- Categorias de receita/despesa
obs_categories (id UUID PK, nome, tipo, pai_id, ativo)

-- Contas bancárias
obs_bank_accounts (id UUID PK, nome, banco, agencia, conta_numero, tipo, saldo_atual, company_id, ativo)

-- Fornecedores
obs_suppliers (id UUID PK, nome, cnpj, categoria, email, telefone, banco, agencia, conta, pix, endereco, ativo)

-- Contas a Pagar
obs_payables (
  id UUID PK,
  company_id UUID refs obs_companies,
  project_id UUID refs obs_projects,    -- qual obra gerou essa despesa
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2),
  data_vencimento DATE,
  data_pagamento DATE,
  status TEXT,                          -- 'em_aberto' | 'pago' | 'cancelado'
  tipo TEXT,                            -- 'material' | 'servico' | 'mao_de_obra' | 'equipamento' | 'administrativo' | 'imposto'
  fornecedor_id UUID refs obs_suppliers,
  categoria_id UUID refs obs_categories,
  conta_id UUID refs obs_bank_accounts,
  nf_numero TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Contas a Receber
obs_receivables (
  id UUID PK,
  company_id UUID refs obs_companies,
  project_id UUID refs obs_projects,
  client_id UUID refs obs_clients,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2),
  data_vencimento DATE,
  data_recebimento DATE,
  status TEXT,                          -- 'em_aberto' | 'recebido' | 'cancelado'
  tipo_recebimento TEXT,                -- 'parcela' | 'medicao' | 'final' | 'adiantamento'
  categoria_id UUID refs obs_categories,
  conta_id UUID refs obs_bank_accounts,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Solicitações de compra
obs_purchase_requests (
  id UUID PK,
  project_id UUID refs obs_projects,
  solicitante_id UUID refs obs_perfis,
  descricao TEXT,
  valor_estimado NUMERIC(12,2),
  fornecedor_id UUID refs obs_suppliers,
  status TEXT,                          -- 'solicitado' | 'aprovado' | 'recusado' | 'comprado'
  tipo_material TEXT,
  urgencia TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Funcionários
obs_employees (id UUID PK, nome, cpf, tipo_vinculo, funcao, salario_base, company_id, data_admissao, email, telefone, banco, agencia, conta, pix, ativo, observacoes)

-- Folha de pagamento
obs_payroll (id UUID PK, employee_id UUID refs obs_employees, company_id, periodo DATE, salario_base, adicional_producao, vale_alimentacao, vale_transporte, fgts, inss, outros_descontos, valor_liquido, status, observacoes)

-- Cronograma Físico-Financeiro da obra (preenchido pelo engenheiro)
obs_cronograma (
  id UUID PK,
  project_id UUID refs obs_projects,
  periodo TEXT NOT NULL,                -- "Semana 1", "Mês 1", etc.
  data_inicio DATE,
  data_fim DATE,
  perc_fisico_prev NUMERIC(5,2),        -- % físico planejado até esta linha
  perc_fisico_real NUMERIC(5,2),        -- % físico efetivamente executado
  valor_financeiro_prev NUMERIC(12,2),  -- valor previsto a receber neste período
  valor_financeiro_real NUMERIC(12,2),  -- valor efetivamente recebido
  observacoes TEXT,
  ordem INT
)

-- Documentos da obra (contratos, ART, laudos, etc.)
obs_documents (
  id UUID PK,
  project_id UUID refs obs_projects,
  nome TEXT NOT NULL,
  tipo TEXT,             -- 'contrato' | 'art' | 'orcamento_aprovado' | 'laudo' | 'as_built' | 'outro'
  url TEXT NOT NULL,     -- link Supabase Storage ou URL externa
  visivel_sindico BOOLEAN DEFAULT true,
  autor_id UUID refs obs_perfis,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Comunicados (canal Obrasul ↔ Síndico)
obs_comunicados (
  id UUID PK,
  project_id UUID refs obs_projects,
  remetente TEXT NOT NULL,   -- 'obrasul' | 'sindico'
  remetente_nome TEXT,
  mensagem TEXT NOT NULL,
  tipo TEXT,                 -- 'informativo' | 'urgente' | 'solicitacao' | 'resposta'
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Token de acesso do portal do síndico (link único por obra)
obs_portal_tokens (
  id UUID PK DEFAULT gen_random_uuid(),
  project_id UUID refs obs_projects NOT NULL,
  client_id UUID refs obs_clients,
  token TEXT UNIQUE NOT NULL,   -- UUID aleatório — compõe a URL do portal
  email_sindico TEXT,
  nome_sindico TEXT,
  ativo BOOLEAN DEFAULT true,
  expira_em TIMESTAMPTZ,        -- NULL = sem expiração
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Audit log (sem DELETE no RLS)
obs_audit_logs (
  id UUID PK DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  usuario_id UUID,
  usuario_nome TEXT,
  acao TEXT,        -- 'INSERT' | 'UPDATE' | 'DELETE' | 'PAGAR' | 'RECEBER' | 'APROVAR' | 'CANCELAR'
  tabela TEXT,
  registro_id TEXT,
  dados_antes JSONB,
  dados_depois JSONB,
  descricao TEXT    -- texto legível: "Pagou Conta a Pagar 'Cimento R$ 1.500' da obra Edifício Sol"
)
```

---

## 5. Módulos em Detalhe

### 5.1 Ecosistema (`ecosistema-obs.html`)

**Sidebar:**
- Dashboard (KPIs: obras ativas, receita a receber, clientes)
- Clientes (Condomínios)
- Usuários
- Configurações

**Funcionalidades:**
- Login / logout com refresh token
- Cadastro de clientes (condomínios): nome, síndico, administradora, endereço, tipo de serviço de interesse
- Gerenciamento de usuários: criar, editar, inativar, excluir (proprietário)
- SSO: ao logar no Ecossistema → acessa Engenharia e Financeiro sem novo login
- Link rápido para os outros módulos na sidebar

**Integração chave:** cliente cadastrado aqui → aparece no select de obra da Engenharia e no select de cliente do Financeiro.

---

### 5.2 Engenharia (`engenharia-obs.html`)

**Sidebar:**
- Dashboard
- Kanban de Obras
- Diário de Campo
- Configurações (tipos de obra, etapas padrão)

**Kanban de obras:**

Colunas de status adaptadas para Obrasul:
```
Prospecção → Orçamento → Aprovado → Mobilização → Em Execução → Vistoria Final → Entregue → Em Garantia
```

**Ficha da obra (modal com abas):**
- **Geral:** cliente, tipo de serviço, valores, datas, endereço, responsável, encarregado
- **Etapas:** checklist de etapas (carregadas do template do tipo de obra); marcar como concluída, bloqueante
- **Diário:** registro diário (data, clima, nº trabalhadores, atividades, ocorrências, materiais usados)
- **Financeiro:** resumo dos gastos da obra (puxa de `obs_payables` filtrado por `project_id`) e recebimentos
- **Fotos:** galeria por etapa (upload via Supabase Storage ou URL)
- **Histórico:** log de mudanças

**Templates de etapas por tipo de serviço:**

| Tipo | Etapas típicas |
|---|---|
| Fachada | Montagem andaime → Limpeza/hidrojateamento → Selagem trincas → Pintura 1ª demão → Pintura 2ª demão → Retirada andaime → Vistoria |
| Impermeabilização Pelotis | Demolição piso → Tratamento estrutural → Impermeabilização → Contrapiso → Acabamento → Vistoria |
| Impermeabilização Reservatório | Esvaziamento → Limpeza → Tratamento fissuras → Impermeabilização → Teste estanqueidade → Enchimento |
| Telhado | Retirada telhas → Tratamento estrutura → Instalação manta/calha → Assentamento telhas → Arremates → Vistoria |
| Pintura Hall/Área Comum | Proteção mobiliário → Preparação superfície → Massa corrida → Pintura 1ª demão → Pintura 2ª demão → Limpeza → Vistoria |

**Dashboard:**
- KPIs: obras ativas, valor em execução, obras atrasadas, pendências críticas
- Funil de obras por status
- Obras com vencimento próximo
- Link direto para o Financeiro da obra

---

### 5.3 Financeiro (`financeiro-obs.html`)

Reutiliza 90% da estrutura do `financeiro.html` do Sombrear. Adaptações:

**Sidebar (módulos):**
- Dashboard
- Contas a Pagar ← **filtro por obra** nativo
- Contas a Receber ← filtro por obra + tipo (parcela/medição/final)
- Compras (solicitação → aprovação)
- NF & Impostos
- RH (funcionários + folha)
- Relatórios
  - DRE (por empresa, por obra, comparativo)
  - Fluxo de Caixa
  - Custo por Obra ← relatório exclusivo Obrasul
  - Comissões
  - Impostos
  - Curva S de Fornecedores

**Diferencial exclusivo — Relatório "Custo por Obra":**
- Seleciona uma obra → mostra todos os gastos (CP) vinculados a ela, agrupados por categoria (material, mão de obra, equipamento, administrativo)
- Compara com o valor de contrato → mostra margem real
- Exporta PDF e Excel

**Integração com Engenharia:** ao abrir uma obra na Engenharia (aba Financeiro), os dados vêm deste módulo filtrados por `project_id`.

---

### 5.4 Portal do Síndico (`portal-sindico-obs.html`)

**Propósito:** dar ao síndico (cliente externo) visibilidade total da obra **sem acesso aos sistemas internos** da Obrasul. É a "janela" do cliente — transparência que gera confiança e reduz ligações de cobrança de informação.

**Acesso via link único:**

O síndico **não cria usuário nem senha**. O gestor da Obrasul gera um link único na ficha da obra na Engenharia:
```
https://[dominio]/portal-sindico-obs.html?token=a1b2c3d4-...
```
O token é salvo em `obs_portal_tokens` vinculado ao `project_id`. O portal lê o token da URL, valida no Supabase e exibe apenas os dados daquela obra. RLS garante que a ANON key só leia os dados do projeto autorizado pelo token.

Opcionalmente, o síndico pode "salvar" o acesso no dispositivo (localStorage) para não precisar do link toda vez.

---

**Seções do portal (tela única com abas):**

#### Aba 1 — Visão Geral
- Nome e tipo da obra, endereço
- Status atual (badge colorido): Mobilização / Em Execução / Vistoria / Entregue
- Barra de progresso físico (% de etapas concluídas)
- Datas: início previsto, previsão de entrega, data atual
- Responsável da Obrasul (nome + telefone de contato)
- KPI financeiro simplificado: Valor contratado / Total pago até hoje / Saldo a pagar

#### Aba 2 — Cronograma da Obra
Timeline visual das etapas da obra:
- Lista de etapas em ordem, com status (pendente / em andamento / concluída)
- Data prevista e data real de conclusão de cada etapa
- Etapas concluídas em verde, atrasadas em vermelho, em andamento em azul
- Progresso em barra por etapa

```
Etapa                    Prev.       Real        Status
─────────────────────────────────────────────────────
Montagem andaime         10/03       10/03       ✅ Concluída
Hidrojateamento          15/03       18/03       ✅ Concluída (+3 dias)
Selagem de trincas       20/03       —           🔵 Em andamento
Pintura 1ª demão         28/03       —           ⏳ Pendente
...
```

#### Aba 3 — Cronograma Físico-Financeiro
Tabela de avanço físico x financeiro por período:

```
Período      Físico Prev.   Físico Real   Valor Prev.    Valor Recebido
─────────────────────────────────────────────────────────────────────────
Mês 1        20%            18%           R$ 30.000      R$ 30.000  ✅
Mês 2        50%            45%           R$ 40.000      R$ 40.000  ✅
Mês 3        80%            —             R$ 30.000      —          ⏳
Mês 4        100%           —             R$ 20.000      —          ⏳
─────────────────────────────────────────────────────────────────────────
TOTAL                                     R$ 120.000     R$ 70.000
```
- Barra dupla visual: planejado (cinza) vs realizado (cor da marca)
- Exportável em PDF pelo síndico

#### Aba 4 — Diário de Obra
- Lista dos registros de diário em ordem cronológica decrescente
- Cada entrada mostra: data, clima, nº de trabalhadores presentes, atividades do dia, ocorrências
- Síndico não edita — apenas lê
- Filtro por mês

#### Aba 5 — Fotos
Galeria organizada por etapa e por tipo (Antes / Durante / Depois):
- Miniaturas clicáveis com legenda
- Filtro por etapa ou tipo
- Permite o síndico baixar as fotos
- Fotos marcadas como `visivel_sindico = false` não aparecem

#### Aba 6 — Documentos e Contratos
Lista de documentos disponibilizados pela Obrasul:
- Contrato assinado
- ART (Anotação de Responsabilidade Técnica)
- Orçamento aprovado
- Laudos técnicos
- As-built (ao final)
- Outros
- Cada documento é um link clicável para download (Supabase Storage ou URL)
- Somente documentos com `visivel_sindico = true` aparecem

#### Aba 7 — Comunicados
Canal de comunicação direto:

**Obrasul → Síndico:**
- Avisos de início de etapa
- Alertas de atraso com justificativa
- Solicitações (acesso ao condomínio, etc.)
- Notificações de entrega de etapa

**Síndico → Obrasul:**
- Campo de texto simples para enviar mensagem
- Tipo: Dúvida / Solicitação / Reclamação / Outros
- Mensagem aparece para o gestor na Engenharia (aba "Comunicados" da ficha da obra)
- Síndico vê histórico de todas as trocas de mensagem

---

**Geração do link no sistema interno:**

Na ficha da obra (Engenharia), aba "Portal Síndico":
- Botão **"Gerar Link de Acesso"** → cria token em `obs_portal_tokens`, exibe o link completo
- Botão **"Copiar link"** + **"Enviar por WhatsApp"** (abre `wa.me` com a mensagem pré-formatada)
- Botão **"Revogar acesso"** → desativa o token
- Visualização de último acesso e quantas vezes o síndico abriu o portal

---

**Design do portal:**

- Interface **limpa e profissional** — diferente do sistema interno (sem sidebar dark)
- Header com logo da Obrasul + nome da obra + nome do síndico
- Paleta clara (branco/cinza claro), cor primária da Obrasul nos destaques
- Mobile-first (síndico acessa pelo celular)
- Sem menus técnicos — só o que importa para o cliente
- Rodapé: contato do responsável pela obra (nome, telefone, email)

---

**Segurança:**

- Token é UUID v4 (praticamente impossível de adivinhar)
- RLS no Supabase: a policy verifica se o token passado corresponde ao `project_id` antes de retornar qualquer dado
- Dados financeiros internos (CP, CR com fornecedores, margem) **nunca** aparecem — só o resumo simplificado
- Portal é somente leitura para todas as tabelas exceto `obs_comunicados` (síndico pode inserir mensagem)

---

### 5.5 Orçamentos (pasta separada — já existe)

O módulo de orçamentos já foi criado em outra pasta. Ele precisa:
- Ler a lista de clientes de `obs_clients` (ou receber o `client_id` como parâmetro de URL)
- Ao aprovar um orçamento, criar automaticamente um registro em `obs_projects` com status `'aprovado'`
- Ao criar o projeto, já pré-preencher o `valor_contrato` e `tipo_servico`
- Ter um campo `orcamento_id` em `obs_projects` para rastreabilidade

Quando for integrar, a IA da pasta de orçamentos precisará saber:
- URL do Supabase da Obrasul
- Estrutura de `obs_clients` e `obs_projects`
- Como escrever na `obs_session` para manter o SSO

---

## 6. Integração entre Módulos

```
Ecossistema          Engenharia                 Financeiro          Portal Síndico
─────────────        ──────────                 ──────────          ──────────────
Cadastra cliente ──→ Obra com client_id ──────→ CR com client_id   —
                     Obra muda status ─────────────────────────────→ Status atualiza
                     Aba Financeiro ───────────→ Filtra CP/CR       —
Usuário logado ────→ SSO compartilhado ────────→ SSO compartilhado  (token separado)
                     Solicitação compra ────────→ Fila de aprovação  —
                     Diário preenchido ─────────────────────────────→ Síndico lê
                     Foto adicionada ───────────────────────────────→ Galeria síndico
                     Comunicado enviado ────────────────────────────→ Síndico recebe
                     Síndico responde ←─────────────────────────────→ Aparece na ficha
                     Gerar token ──────────────────────────────────→ Link de acesso
                     Cronograma preenchido ─────────────────────────→ Síndico visualiza
                     Documento publicado ───────────────────────────→ Síndico baixa
```

**Como funciona na prática:**
1. Síndico fecha negócio → cadastra no **Ecossistema** como cliente
2. Engenheiro cria a **obra** na Engenharia, escolhendo o cliente
3. Financeiro já vê a obra no filtro de CP/CR e pode lançar custos vinculados
4. Encarregado preenche **diário** no campo
5. Encarregado solicita **compra de material** na Engenharia → vai para aprovação no Financeiro
6. Financeiro aprova e lança o CP vinculado à obra
7. Gestor gera o **link do Portal do Síndico** e envia via WhatsApp — síndico acompanha tudo em tempo real
8. Síndico envia mensagem pelo portal → aparece na ficha da obra para o responsável responder
9. **Relatório "Custo por Obra"** mostra margem real em tempo real (internamente — síndico não vê)

---

## 7. Fases de Implementação

### Fase 1 — Fundação (Prioridade Alta)
- [ ] Criar projeto Supabase da Obrasul
- [ ] Aplicar migration com todas as tabelas `obs_`
- [ ] Criar `ecosistema-obs.html` (auth + clientes + usuários)
- [ ] Criar `engenharia-obs.html` (kanban + ficha de obra + etapas padrão por tipo)
- [ ] SSO entre Ecossistema e Engenharia

### Fase 2 — Financeiro Base
- [ ] Criar `financeiro-obs.html` (CP, CR, compras)
- [ ] SSO com Ecossistema e Engenharia
- [ ] Filtro "por obra" nativo em CP e CR
- [ ] Dashboard financeiro por obra

### Fase 3 — Relatórios e RH
- [ ] DRE por empresa e por obra
- [ ] Relatório "Custo por Obra" com margem
- [ ] RH: funcionários + folha
- [ ] Exportação PDF e Excel

### Fase 4 — Integração Orçamentos
- [ ] Orçamento aprovado → cria obs_project
- [ ] Client_id compartilhado entre orçamento e ecossistema
- [ ] Rastreabilidade orcamento → obra → financeiro

### Fase 5 — Portal do Síndico
- [ ] Criar `portal-sindico-obs.html` (layout mobile-first, interface limpa)
- [ ] Tabelas: `obs_portal_tokens`, `obs_comunicados`, `obs_documents`, `obs_cronograma`
- [ ] RLS: policy de acesso por token no Supabase
- [ ] Aba Visão Geral (status, progresso, KPI financeiro simplificado)
- [ ] Aba Cronograma da Obra (etapas com datas e status visual)
- [ ] Aba Cronograma Físico-Financeiro (tabela + barra de progresso)
- [ ] Aba Diário (leitura dos registros diários)
- [ ] Aba Fotos (galeria por etapa com download)
- [ ] Aba Documentos (lista de contratos e laudos para download)
- [ ] Aba Comunicados (síndico envia e recebe mensagens)
- [ ] Geração de link na ficha da obra (Engenharia) + botão WhatsApp
- [ ] Exibição de comunicados na ficha da obra para o gestor responder

### Fase 6 — Campo e Mobile
- [ ] Diário de obra mobile-first
- [ ] Upload de fotos (Supabase Storage)
- [ ] Checklists NR18 e qualidade
- [ ] Modo offline básico (localStorage cache)

---

## 8. Diferenças Estruturais em relação ao Sombrear

| Aspecto | Sombrear | Obrasul |
|---|---|---|
| Cliente principal | Condomínio (cliente de produto) | Condomínio (cliente de serviço) |
| Projeto | Instalação de sombreamento | Obra civil (fachada, impermeabilização, etc.) |
| Etapas | Genéricas | Templates por tipo de serviço |
| Financeiro | Geral | Custo por obra como KPI central |
| RH | Básico | Inclui diária de campo, produção por obra |
| Fotos | Não tem | Essencial (antes/durante/depois) |
| Diário | Não tem | Registro diário obrigatório (responsabilidade civil) |
| Portal cliente | Não tem | Portal do síndico com link único — transparência total |
| Comunicação | Não tem | Canal direto Obrasul ↔ Síndico dentro do sistema |
| Cronograma | Básico (datas) | Físico-financeiro com % executado vs planejado |
| Orçamento | Não integrado | Integrado (gera obs_project ao aprovar) |

---

## 9. Variáveis de Configuração Iniciais

Quando for criar os arquivos, substituir:

```javascript
// Supabase da Obrasul (criar projeto novo em supabase.com)
var SUPA_URL  = 'https://[PROJETO-OBRASUL].supabase.co';
var SUPA_ANON = '[ANON-KEY-OBRASUL]';

// Sessões (não conflitar com Sombrear)
localStorage.getItem('obs_session')      // Ecossistema
localStorage.getItem('obs_fin_session')  // Financeiro
localStorage.getItem('obs_eng_session')  // Engenharia

// Prefixo de tabelas
// obs_clients, obs_projects, obs_payables, obs_receivables, etc.

// Cor primária da marca Obrasul (definir com cliente)
--primary: #[COR-OBRASUL];
```

---

## 10. Próximos Passos

1. **Criar projeto Supabase** para Obrasul → obter URL e ANON key
2. **Aplicar migration SQL** (arquivo a ser gerado pela IA ao iniciar desenvolvimento)
3. **Começar pelo Ecossistema** — auth + clientes é o ponto de entrada de tudo
4. **Definir cor/identidade visual** da Obrasul para personalizar o CSS
5. **Mapear tipos de obra** reais com suas etapas detalhadas com a equipe da Obrasul

---

*Documento gerado em 2026-05-16. Arquitetura baseada no Ecossistema Sombrear.*
