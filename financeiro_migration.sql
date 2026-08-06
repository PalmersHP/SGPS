-- ================================================================
-- MIGRAÇÃO — SISTEMA FINANCEIRO SOMBREAR
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ================================================================

-- Enable UUID extension (already enabled on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── EMPRESAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name      TEXT NOT NULL,
  trade_name      TEXT NOT NULL,
  cnpj            TEXT,
  state_reg       TEXT,
  municipal_reg   TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip_code        TEXT,
  email           TEXT,
  phone           TEXT,
  tax_regime      TEXT,
  status          TEXT NOT NULL DEFAULT 'ativo',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTAS BANCÁRIAS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES fin_companies(id),
  bank_name       TEXT NOT NULL,
  agency          TEXT,
  account_number  TEXT,
  account_type    TEXT,
  holder_name     TEXT,
  holder_document TEXT,
  pix_key         TEXT,
  initial_balance NUMERIC(15,2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'ativo',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  document    TEXT,
  type        TEXT DEFAULT 'pf',   -- pf | pj
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── MORADORES (vinculados a projeto) ─────────────────────────
CREATE TABLE IF NOT EXISTS fin_residents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID,
  name          TEXT NOT NULL,
  cpf           TEXT,
  phone         TEXT,
  email         TEXT,
  apartment     TEXT,
  block         TEXT,
  parking_space TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── FORNECEDORES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  document     TEXT,
  type         TEXT DEFAULT 'pj',
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  city         TEXT,
  state        TEXT,
  bank_name    TEXT,
  bank_agency  TEXT,
  bank_account TEXT,
  bank_pix     TEXT,
  status       TEXT NOT NULL DEFAULT 'ativo',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── VENDEDORES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_sellers (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        TEXT NOT NULL,
  document                    TEXT,
  type                        TEXT DEFAULT 'interno',
  phone                       TEXT,
  email                       TEXT,
  bank_name                   TEXT,
  bank_agency                 TEXT,
  bank_account                TEXT,
  bank_pix                    TEXT,
  default_commission_pct      NUMERIC(5,2) DEFAULT 0,
  status                      TEXT NOT NULL DEFAULT 'ativo',
  notes                       TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CATEGORIAS FINANCEIRAS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES fin_categories(id),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'despesa',  -- receita | despesa
  status      TEXT NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CENTROS DE CUSTO ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_cost_centers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJETOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                UUID REFERENCES fin_companies(id),
  name                      TEXT NOT NULL,
  project_type              TEXT,
  client_id                 UUID REFERENCES fin_clients(id),
  seller_id                 UUID REFERENCES fin_sellers(id),
  commission_pct            NUMERIC(5,2) DEFAULT 0,
  contract_value            NUMERIC(15,2) DEFAULT 0,
  received_from_shift       NUMERIC(15,2) DEFAULT 0,
  main_payment_method       TEXT,
  start_date                DATE,
  expected_end_date         DATE,
  status                    TEXT NOT NULL DEFAULT 'pre_cadastro',
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTAS A RECEBER ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_receivables (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID REFERENCES fin_companies(id),
  project_id            UUID REFERENCES fin_projects(id),
  client_id             UUID REFERENCES fin_clients(id),
  resident_id           UUID REFERENCES fin_residents(id),
  seller_id             UUID REFERENCES fin_sellers(id),
  origin                TEXT DEFAULT 'outros',
  gross_amount          NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount       NUMERIC(15,2) DEFAULT 0,
  net_expected_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_method        TEXT,
  due_date              DATE,
  expected_receipt_date DATE,
  actual_receipt_date   DATE,
  bank_account_id       UUID REFERENCES fin_bank_accounts(id),
  status                TEXT NOT NULL DEFAULT 'em_aberto',
  notes                 TEXT,
  created_by            TEXT,
  validated_by          TEXT,
  validated_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTAS A PAGAR ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_payables (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID REFERENCES fin_companies(id),
  project_id         UUID REFERENCES fin_projects(id),
  cost_center_id     UUID REFERENCES fin_cost_centers(id),
  supplier_id        UUID REFERENCES fin_suppliers(id),
  category_id        UUID REFERENCES fin_categories(id),
  description        TEXT NOT NULL,
  amount             NUMERIC(15,2) NOT NULL DEFAULT 0,
  competence_date    DATE,
  due_date           DATE NOT NULL,
  payment_method     TEXT,
  bank_account_id    UUID REFERENCES fin_bank_accounts(id),
  status             TEXT NOT NULL DEFAULT 'em_aberto',
  installment_number INT DEFAULT 1,
  total_installments INT DEFAULT 1,
  payment_order_id   UUID,
  paid_by            TEXT,
  paid_at            TIMESTAMPTZ,
  notes              TEXT,
  created_by         TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDENS DE PAGAMENTO ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_payment_orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  op_number      TEXT NOT NULL UNIQUE,
  payable_id     UUID REFERENCES fin_payables(id),
  company_id     UUID REFERENCES fin_companies(id),
  bank_account_id UUID REFERENCES fin_bank_accounts(id),
  supplier_id    UUID REFERENCES fin_suppliers(id),
  project_id     UUID REFERENCES fin_projects(id),
  category_id    UUID REFERENCES fin_categories(id),
  description    TEXT,
  amount         NUMERIC(15,2),
  due_date       DATE,
  payment_method TEXT,
  status         TEXT NOT NULL DEFAULT 'gerada',
  generated_by   TEXT,
  generated_at   TIMESTAMPTZ DEFAULT NOW(),
  paid_at        TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── LOGS DE AUDITORIA ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fin_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email    TEXT,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  old_value     JSONB,
  new_value     JSONB,
  justification TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── ÍNDICES ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fin_payables_status        ON fin_payables(status);
CREATE INDEX IF NOT EXISTS idx_fin_payables_due_date      ON fin_payables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_payables_company       ON fin_payables(company_id);
CREATE INDEX IF NOT EXISTS idx_fin_payables_project       ON fin_payables(project_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_status     ON fin_receivables(status);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_due_date   ON fin_receivables(due_date);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_company    ON fin_receivables(company_id);
CREATE INDEX IF NOT EXISTS idx_fin_receivables_project    ON fin_receivables(project_id);
CREATE INDEX IF NOT EXISTS idx_fin_projects_status        ON fin_projects(status);
CREATE INDEX IF NOT EXISTS idx_fin_payment_orders_status  ON fin_payment_orders(status);

-- ── RLS (desativado para uso interno — ativar em produção) ────
ALTER TABLE fin_companies        DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_bank_accounts    DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_clients          DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_suppliers        DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_sellers          DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_categories       DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_cost_centers     DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_projects         DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_residents        DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_receivables      DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_payables         DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_payment_orders   DISABLE ROW LEVEL SECURITY;
ALTER TABLE fin_audit_logs       DISABLE ROW LEVEL SECURITY;

-- ── DADOS INICIAIS ────────────────────────────────────────────

-- Empresas
INSERT INTO fin_companies (legal_name, trade_name, cnpj, status) VALUES
  ('Sombrear Coberturas Ltda', 'Sombrear', '', 'ativo'),
  ('Manzzano Estruturas Ltda', 'Manzzano', '', 'ativo')
ON CONFLICT DO NOTHING;

-- Categorias — Mãe
INSERT INTO fin_categories (id, name, type) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Custos Financeiros', 'despesa'),
  ('a0000001-0000-0000-0000-000000000002', 'Impostos', 'despesa'),
  ('a0000001-0000-0000-0000-000000000003', 'Gastos com Produção', 'despesa'),
  ('a0000001-0000-0000-0000-000000000004', 'Gastos com Pessoal', 'despesa'),
  ('a0000001-0000-0000-0000-000000000005', 'Gastos Fixos', 'despesa'),
  ('a0000001-0000-0000-0000-000000000006', 'Pintura', 'despesa'),
  ('a0000001-0000-0000-0000-000000000007', 'Veículos', 'despesa'),
  ('a0000001-0000-0000-0000-000000000008', 'Serviços Terceirizados', 'despesa'),
  ('a0000001-0000-0000-0000-000000000009', 'Ações de Marketing', 'despesa'),
  ('a0000001-0000-0000-0000-000000000010', 'Investimento / Mobilizado', 'despesa'),
  ('a0000001-0000-0000-0000-000000000011', 'Retirada dos Sócios', 'despesa'),
  ('a0000001-0000-0000-0000-000000000012', 'Receitas de Contratos', 'receita'),
  ('a0000001-0000-0000-0000-000000000013', 'Receitas de Varejo', 'receita')
ON CONFLICT DO NOTHING;

-- Categorias — Filhas
INSERT INTO fin_categories (name, type, parent_id) VALUES
  ('Boletos FK',             'despesa', 'a0000001-0000-0000-0000-000000000001'),
  ('Empréstimos',            'despesa', 'a0000001-0000-0000-0000-000000000001'),
  ('Juros',                  'despesa', 'a0000001-0000-0000-0000-000000000001'),
  ('Sombrear 01',            'despesa', 'a0000001-0000-0000-0000-000000000002'),
  ('Manzzano',               'despesa', 'a0000001-0000-0000-0000-000000000002'),
  ('Parcelamentos S01',      'despesa', 'a0000001-0000-0000-0000-000000000002'),
  ('Parcelamento Manzzano',  'despesa', 'a0000001-0000-0000-0000-000000000002'),
  ('Matéria-prima',          'despesa', 'a0000001-0000-0000-0000-000000000003'),
  ('Material de consumo',    'despesa', 'a0000001-0000-0000-0000-000000000003'),
  ('Adiantamento',           'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Sombrear Folha',         'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Manzzano Folha',         'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('PJ',                     'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Diaristas',              'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Representante Comercial','despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Rescisões',              'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('FGTS',                   'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('INSS',                   'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Vale Transporte',        'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Vale Alimentação',       'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Vale Refeição',          'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Uniformes / EPIs',       'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Premiações',             'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Gratificações',          'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Horas Extras',           'despesa', 'a0000001-0000-0000-0000-000000000004'),
  ('Terceirização de Serviços','despesa','a0000001-0000-0000-0000-000000000004'),
  ('Outros Gastos com Pessoal','despesa','a0000001-0000-0000-0000-000000000004'),
  ('Aluguel Matriz',         'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Aluguel Lote',           'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Assessoria Jurídica',    'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Contabilidade',          'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Energia',                'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Internet',               'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('IPTU',                   'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Informática',            'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Monitoramento',          'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Seguros',                'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Sistemas',               'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Taxas',                  'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('Outros Gastos Fixos',    'despesa', 'a0000001-0000-0000-0000-000000000005'),
  ('IPVA',                   'despesa', 'a0000001-0000-0000-0000-000000000007'),
  ('Combustíveis',           'despesa', 'a0000001-0000-0000-0000-000000000007'),
  ('Manutenção Veicular',    'despesa', 'a0000001-0000-0000-0000-000000000007'),
  ('Lava-jato',              'despesa', 'a0000001-0000-0000-0000-000000000007'),
  ('Fretes',                 'despesa', 'a0000001-0000-0000-0000-000000000008'),
  ('Locações',               'despesa', 'a0000001-0000-0000-0000-000000000008'),
  ('Retirada de Entulho',    'despesa', 'a0000001-0000-0000-0000-000000000008'),
  ('Ferramentas',            'despesa', 'a0000001-0000-0000-0000-000000000010'),
  ('Máquinas e Equipamentos','despesa', 'a0000001-0000-0000-0000-000000000010'),
  ('Mobiliário',             'despesa', 'a0000001-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

-- Centros de Custo
INSERT INTO fin_cost_centers (name) VALUES
  ('Administrativo'),('Comercial'),('Produção'),('Montagem'),
  ('Engenharia'),('Financeiro'),('Compras'),('RH'),
  ('Frota'),('Marketing'),('Diretoria'),('Impostos')
ON CONFLICT DO NOTHING;
