#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const SUPA_URL = 'https://gwcgcvgowoqyhthdbear.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Y2djdmdvd29xeWh0aGRiZWFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIyNDU3NSwiZXhwIjoyMDkxODAwNTc1fQ.eNDohZVqE9p2YOiSVMUnTEuiZmorxqOwwl4I-uWUgOA';

const H = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPA_KEY}`,
  'apikey': SUPA_KEY,
  'Prefer': 'return=representation',
};

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function dbGet(table, params = '') {
  const url = `${SUPA_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
  const r = await fetch(url, { headers: H });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || d.hint || JSON.stringify(d));
  return d;
}

async function dbPost(table, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST', headers: H, body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || d.hint || JSON.stringify(d));
  return Array.isArray(d) ? d[0] : d;
}

async function dbPatch(table, filter, body) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH', headers: H, body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || d.hint || JSON.stringify(d));
  return Array.isArray(d) ? d[0] : d;
}

async function findByName(table, nome, col = 'nome') {
  const rows = await dbGet(table, `${col}=ilike.*${encodeURIComponent(nome)}*&limit=5`);
  return rows;
}

function today() { return new Date().toISOString().substring(0, 10); }
function brl(v)  { return 'R$ ' + (parseFloat(v)||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function ok(text) { return { content: [{ type: 'text', text: String(text) }] }; }
function err(e)   { return { content: [{ type: 'text', text: `Erro: ${e.message || e}` }], isError: true }; }

// ── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'resumo_dashboard',
    description: 'Retorna um resumo financeiro completo: totais de contas a pagar, contas a receber, saldo bancário e projetos ativos. Use isso para ter uma visão geral do financeiro.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'listar_contas_pagar',
    description: 'Lista contas a pagar. Pode filtrar por status (em_aberto, pago, vencido, cancelado) e por prazo de vencimento.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['em_aberto','pago','vencido','cancelado'], description: 'Filtrar por status. Se omitido, retorna em_aberto.' },
        vencendo_em_dias: { type: 'number', description: 'Contas vencendo nos próximos N dias' },
        limit: { type: 'number', description: 'Quantidade máxima (padrão 30)' },
      },
    },
  },
  {
    name: 'criar_conta_pagar',
    description: 'Cria uma nova conta a pagar no sistema.',
    inputSchema: {
      type: 'object',
      required: ['descricao', 'valor', 'data_vencimento'],
      properties: {
        descricao:       { type: 'string', description: 'Descrição da conta' },
        valor:           { type: 'number', description: 'Valor em reais' },
        data_vencimento: { type: 'string', description: 'Data de vencimento (AAAA-MM-DD)' },
        fornecedor_nome: { type: 'string', description: 'Nome do fornecedor (busca aproximada)' },
        categoria_nome:  { type: 'string', description: 'Nome da categoria (busca aproximada)' },
        projeto_nome:    { type: 'string', description: 'Nome do projeto (busca aproximada)' },
        observacoes:     { type: 'string', description: 'Observações adicionais' },
      },
    },
  },
  {
    name: 'pagar_conta',
    description: 'Marca uma conta a pagar como PAGA, registrando a data de pagamento.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id:              { type: 'string', description: 'ID da conta a pagar' },
        data_pagamento:  { type: 'string', description: 'Data do pagamento (AAAA-MM-DD). Padrão: hoje.' },
        observacoes:     { type: 'string', description: 'Observações do pagamento' },
      },
    },
  },
  {
    name: 'listar_contas_receber',
    description: 'Lista contas a receber. Pode filtrar por status (em_aberto, recebido, vencido, cancelado).',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['em_aberto','recebido','vencido','cancelado'], description: 'Status (padrão: em_aberto)' },
        limit:  { type: 'number', description: 'Quantidade máxima (padrão 30)' },
      },
    },
  },
  {
    name: 'criar_conta_receber',
    description: 'Cria uma nova conta a receber no sistema.',
    inputSchema: {
      type: 'object',
      required: ['descricao', 'valor', 'data_vencimento'],
      properties: {
        descricao:       { type: 'string', description: 'Descrição' },
        valor:           { type: 'number', description: 'Valor em reais' },
        data_vencimento: { type: 'string', description: 'Data de vencimento (AAAA-MM-DD)' },
        cliente_nome:    { type: 'string', description: 'Nome do cliente (busca aproximada)' },
        projeto_nome:    { type: 'string', description: 'Nome do projeto (busca aproximada)' },
        origem:          { type: 'string', description: 'Origem da receita (ex: Projeto, Venda, Serviço)' },
        observacoes:     { type: 'string', description: 'Observações' },
      },
    },
  },
  {
    name: 'receber_conta',
    description: 'Marca uma conta a receber como RECEBIDA, registrando a data de recebimento.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id:                 { type: 'string', description: 'ID da conta a receber' },
        data_recebimento:   { type: 'string', description: 'Data do recebimento (AAAA-MM-DD). Padrão: hoje.' },
        observacoes:        { type: 'string', description: 'Observações' },
      },
    },
  },
  {
    name: 'listar_projetos',
    description: 'Lista projetos financeiros com valores de contrato, recebido, custo e margem.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['prospeccao','aguardando_inicio','em_andamento','pausado','em_garantia','concluido','cancelado'], description: 'Filtrar por status' },
        limit:  { type: 'number', description: 'Quantidade máxima (padrão 20)' },
      },
    },
  },
  {
    name: 'criar_projeto',
    description: 'Cria um novo projeto financeiro.',
    inputSchema: {
      type: 'object',
      required: ['nome'],
      properties: {
        nome:            { type: 'string', description: 'Nome do projeto' },
        cliente_nome:    { type: 'string', description: 'Nome do cliente' },
        valor_contrato:  { type: 'number', description: 'Valor total do contrato' },
        status:          { type: 'string', enum: ['prospeccao','aguardando_inicio','em_andamento'], description: 'Status inicial (padrão: aguardando_inicio)' },
        data_inicio:     { type: 'string', description: 'Data de início (AAAA-MM-DD)' },
        data_fim_prev:   { type: 'string', description: 'Data prevista de conclusão (AAAA-MM-DD)' },
        observacoes:     { type: 'string', description: 'Observações' },
      },
    },
  },
  {
    name: 'atualizar_projeto',
    description: 'Atualiza status ou valores de um projeto existente.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id:              { type: 'string', description: 'ID do projeto' },
        status:          { type: 'string', enum: ['prospeccao','aguardando_inicio','em_andamento','pausado','em_garantia','concluido','cancelado'] },
        valor_recebido:  { type: 'number', description: 'Valor já recebido' },
        valor_custo:     { type: 'number', description: 'Custo realizado' },
        margem_lucro:    { type: 'number', description: 'Margem de lucro (%)' },
        observacoes:     { type: 'string' },
      },
    },
  },
  {
    name: 'listar_compras',
    description: 'Lista solicitações de compra. Mostra solicitante, fornecedor, valor, status e prioridade.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['solicitado','aprovado','recusado','comprado','entregue','cancelado'], description: 'Filtrar por status (padrão: solicitado)' },
        limit:  { type: 'number', description: 'Quantidade máxima (padrão 20)' },
      },
    },
  },
  {
    name: 'aprovar_compra',
    description: 'Aprova uma solicitação de compra, definindo o valor aprovado.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id:              { type: 'string', description: 'ID da solicitação de compra' },
        valor_aprovado:  { type: 'number', description: 'Valor aprovado (se omitido, usa o valor estimado)' },
        observacoes:     { type: 'string', description: 'Observações da aprovação' },
      },
    },
  },
  {
    name: 'recusar_compra',
    description: 'Recusa uma solicitação de compra com motivo obrigatório.',
    inputSchema: {
      type: 'object',
      required: ['id', 'motivo'],
      properties: {
        id:     { type: 'string', description: 'ID da solicitação' },
        motivo: { type: 'string', description: 'Motivo da recusa' },
      },
    },
  },
  {
    name: 'gerar_dre',
    description: 'Gera a Demonstração de Resultado do Exercício (DRE) para um período, com receitas, despesas e resultado líquido por categoria.',
    inputSchema: {
      type: 'object',
      required: ['ano'],
      properties: {
        ano: { type: 'number', description: 'Ano (ex: 2025)' },
        mes: { type: 'string', description: 'Mês no formato MM (ex: "05"). Se omitido, retorna o ano todo.' },
      },
    },
  },
  {
    name: 'gerar_fluxo_caixa',
    description: 'Gera o fluxo de caixa mensal do ano: entradas realizadas, saídas realizadas, projeção de meses futuros e saldo acumulado.',
    inputSchema: {
      type: 'object',
      required: ['ano'],
      properties: {
        ano: { type: 'number', description: 'Ano (ex: 2025)' },
      },
    },
  },
  {
    name: 'relatorio_categorias',
    description: 'Relatório de despesas agrupadas por categoria, com valor total e percentual de participação.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'listar_funcionarios',
    description: 'Lista funcionários cadastrados com cargo, tipo de vínculo e salário base.',
    inputSchema: {
      type: 'object',
      properties: {
        ativo: { type: 'boolean', description: 'Filtrar apenas ativos (padrão: true)' },
      },
    },
  },
  {
    name: 'buscar_cliente',
    description: 'Busca um cliente pelo nome (busca parcial). Retorna ID, nome e contato.',
    inputSchema: {
      type: 'object',
      required: ['nome'],
      properties: {
        nome: { type: 'string', description: 'Nome ou parte do nome do cliente' },
      },
    },
  },
  {
    name: 'buscar_fornecedor',
    description: 'Busca um fornecedor pelo nome (busca parcial). Retorna ID, nome e contato.',
    inputSchema: {
      type: 'object',
      required: ['nome'],
      properties: {
        nome: { type: 'string', description: 'Nome ou parte do nome do fornecedor' },
      },
    },
  },
  {
    name: 'listar_categorias',
    description: 'Lista todas as categorias financeiras (receita e despesa) com hierarquia pai/filho.',
    inputSchema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['receita','despesa'], description: 'Filtrar por tipo' },
      },
    },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function handle(name, args) {
  switch (name) {

    case 'resumo_dashboard': {
      const [cp, cr, proj, comp] = await Promise.all([
        dbGet('fin_payables', 'status=eq.em_aberto&select=valor'),
        dbGet('fin_receivables', 'status=eq.em_aberto&select=valor'),
        dbGet('fin_projects', 'status=in.(em_andamento,aguardando_inicio)&select=nome,valor_contrato,valor_recebido,valor_custo'),
        dbGet('fin_purchase_requests', 'status=eq.solicitado&select=descricao,valor_estimado'),
      ]);
      const totalCP  = cp.reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
      const totalCR  = cr.reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
      const saldo    = totalCR - totalCP;
      const lines = [
        '═══ RESUMO FINANCEIRO SOMBREAR ═══',
        '',
        `📥 Contas a Receber (em aberto): ${brl(totalCR)} — ${cr.length} títulos`,
        `📤 Contas a Pagar (em aberto):   ${brl(totalCP)} — ${cp.length} títulos`,
        `💰 Saldo Projetado:               ${brl(saldo)}`,
        '',
        `🏗️  Projetos Ativos: ${proj.length}`,
        ...proj.map(p=>`   • ${p.nome}: contrato ${brl(p.valor_contrato)} | recebido ${brl(p.valor_recebido)} | custo ${brl(p.valor_custo)}`),
        '',
        `🛒 Compras Aguardando Aprovação: ${comp.length}`,
        ...comp.slice(0,5).map(c=>`   • ${c.descricao} — ${brl(c.valor_estimado)}`),
      ];
      return ok(lines.join('\n'));
    }

    case 'listar_contas_pagar': {
      const status = args.status || 'em_aberto';
      const limit  = args.limit  || 30;
      let params   = `status=eq.${status}&order=data_vencimento.asc&limit=${limit}`;
      if (args.vencendo_em_dias) {
        const ate = new Date(); ate.setDate(ate.getDate() + args.vencendo_em_dias);
        params = `status=eq.em_aberto&data_vencimento=lte.${ate.toISOString().substring(0,10)}&order=data_vencimento.asc&limit=${limit}`;
      }
      const [rows, fors] = await Promise.all([
        dbGet('fin_payables', params),
        dbGet('fin_suppliers', 'select=id,nome'),
      ]);
      const forMap = Object.fromEntries(fors.map(f=>[f.id, f.nome]));
      if (!rows.length) return ok(`Nenhuma conta a pagar com status "${status}".`);
      const lines = [`📤 CONTAS A PAGAR — ${status.toUpperCase()} (${rows.length})`, ''];
      rows.forEach(r => {
        const venc = r.data_vencimento || '—';
        const forn = r.fornecedor_id ? (forMap[r.fornecedor_id] || r.fornecedor_id) : '—';
        lines.push(`ID: ${r.id}`);
        lines.push(`  ${r.descricao} | ${brl(r.valor)} | Venc: ${venc} | Fornecedor: ${forn} | Status: ${r.status}`);
        if (r.observacoes) lines.push(`  Obs: ${r.observacoes}`);
        lines.push('');
      });
      return ok(lines.join('\n'));
    }

    case 'criar_conta_pagar': {
      const body = {
        descricao: args.descricao,
        valor: args.valor,
        data_vencimento: args.data_vencimento,
        status: 'em_aberto',
        observacoes: args.observacoes || null,
      };
      if (args.fornecedor_nome) {
        const fors = await findByName('fin_suppliers', args.fornecedor_nome);
        if (!fors.length) return ok(`Fornecedor "${args.fornecedor_nome}" não encontrado. Cadastre-o primeiro.`);
        if (fors.length > 1) return ok(`Múltiplos fornecedores encontrados para "${args.fornecedor_nome}":\n${fors.map(f=>`  • ${f.nome} (${f.id})`).join('\n')}\nEspecifique melhor o nome.`);
        body.fornecedor_id = fors[0].id;
      }
      if (args.categoria_nome) {
        const cats = await findByName('fin_categories', args.categoria_nome);
        if (cats.length) body.categoria_id = cats[0].id;
      }
      if (args.projeto_nome) {
        const projs = await findByName('fin_projects', args.projeto_nome);
        if (projs.length) body.projeto_id = projs[0].id;
      }
      const row = await dbPost('fin_payables', body);
      return ok(`✅ Conta a pagar criada!\nID: ${row.id}\nDescrição: ${row.descricao}\nValor: ${brl(row.valor)}\nVencimento: ${row.data_vencimento}`);
    }

    case 'pagar_conta': {
      const conta = (await dbGet('fin_payables', `id=eq.${args.id}`))[0];
      if (!conta) return ok(`Conta ID "${args.id}" não encontrada.`);
      if (conta.status === 'pago') return ok(`Conta "${conta.descricao}" já está paga.`);
      const dataPag = args.data_pagamento || today();
      await dbPatch('fin_payables', `id=eq.${args.id}`, {
        status: 'pago',
        data_pagamento: dataPag,
        observacoes: args.observacoes || conta.observacoes,
      });
      return ok(`✅ Conta PAGA!\n"${conta.descricao}" — ${brl(conta.valor)}\nData: ${dataPag}`);
    }

    case 'listar_contas_receber': {
      const status = args.status || 'em_aberto';
      const limit  = args.limit  || 30;
      const [rows, clts] = await Promise.all([
        dbGet('fin_receivables', `status=eq.${status}&order=data_vencimento.asc&limit=${limit}`),
        dbGet('fin_clients', 'select=id,nome'),
      ]);
      const cltMap = Object.fromEntries(clts.map(c=>[c.id, c.nome]));
      if (!rows.length) return ok(`Nenhuma conta a receber com status "${status}".`);
      const lines = [`📥 CONTAS A RECEBER — ${status.toUpperCase()} (${rows.length})`, ''];
      rows.forEach(r => {
        const cli = r.cliente_id ? (cltMap[r.cliente_id] || r.cliente_id) : '—';
        lines.push(`ID: ${r.id}`);
        lines.push(`  ${r.descricao} | ${brl(r.valor)} | Venc: ${r.data_vencimento||'—'} | Cliente: ${cli} | Status: ${r.status}`);
        lines.push('');
      });
      return ok(lines.join('\n'));
    }

    case 'criar_conta_receber': {
      const body = {
        descricao: args.descricao,
        valor: args.valor,
        data_vencimento: args.data_vencimento,
        status: 'em_aberto',
        origem: args.origem || null,
        observacoes: args.observacoes || null,
      };
      if (args.cliente_nome) {
        const clts = await findByName('fin_clients', args.cliente_nome);
        if (!clts.length) return ok(`Cliente "${args.cliente_nome}" não encontrado.`);
        if (clts.length > 1) return ok(`Múltiplos clientes para "${args.cliente_nome}":\n${clts.map(c=>`  • ${c.nome} (${c.id})`).join('\n')}`);
        body.cliente_id = clts[0].id;
      }
      if (args.projeto_nome) {
        const projs = await findByName('fin_projects', args.projeto_nome);
        if (projs.length) body.projeto_id = projs[0].id;
      }
      const row = await dbPost('fin_receivables', body);
      return ok(`✅ Conta a receber criada!\nID: ${row.id}\nDescrição: ${row.descricao}\nValor: ${brl(row.valor)}\nVencimento: ${row.data_vencimento}`);
    }

    case 'receber_conta': {
      const conta = (await dbGet('fin_receivables', `id=eq.${args.id}`))[0];
      if (!conta) return ok(`Conta ID "${args.id}" não encontrada.`);
      if (conta.status === 'recebido') return ok(`Conta "${conta.descricao}" já foi recebida.`);
      const dataRec = args.data_recebimento || today();
      await dbPatch('fin_receivables', `id=eq.${args.id}`, {
        status: 'recebido',
        data_recebimento: dataRec,
        observacoes: args.observacoes || conta.observacoes,
      });
      return ok(`✅ Conta RECEBIDA!\n"${conta.descricao}" — ${brl(conta.valor)}\nData: ${dataRec}`);
    }

    case 'listar_projetos': {
      const limit = args.limit || 20;
      let params = `order=created_at.desc&limit=${limit}`;
      if (args.status) params = `status=eq.${args.status}&${params}`;
      const [projs, clts] = await Promise.all([
        dbGet('fin_projects', params),
        dbGet('fin_clients', 'select=id,nome'),
      ]);
      const cltMap = Object.fromEntries(clts.map(c=>[c.id, c.nome]));
      const stLabel = {prospeccao:'Prospecção',aguardando_inicio:'Aguardando Início',em_andamento:'Em Andamento',pausado:'Pausado',em_garantia:'Garantia',concluido:'Concluído',cancelado:'Cancelado'};
      if (!projs.length) return ok('Nenhum projeto encontrado.');
      const lines = [`🏗️  PROJETOS (${projs.length})`, ''];
      projs.forEach(p => {
        const res = (parseFloat(p.valor_recebido)||0) - (parseFloat(p.valor_custo)||0);
        lines.push(`ID: ${p.id} | ${p.nome}`);
        lines.push(`  Status: ${stLabel[p.status]||p.status} | Cliente: ${p.cliente_id?cltMap[p.cliente_id]||'—':'—'}`);
        lines.push(`  Contrato: ${brl(p.valor_contrato)} | Recebido: ${brl(p.valor_recebido)} | Custo: ${brl(p.valor_custo)} | Resultado: ${brl(res)}`);
        if (p.margem_lucro != null) lines.push(`  Margem: ${p.margem_lucro}%`);
        lines.push('');
      });
      return ok(lines.join('\n'));
    }

    case 'criar_projeto': {
      const body = {
        nome: args.nome,
        valor_contrato: args.valor_contrato || 0,
        status: args.status || 'aguardando_inicio',
        data_inicio: args.data_inicio || null,
        data_fim_prev: args.data_fim_prev || null,
        observacoes: args.observacoes || null,
        valor_recebido: 0,
        valor_custo: 0,
      };
      if (args.cliente_nome) {
        const clts = await findByName('fin_clients', args.cliente_nome);
        if (clts.length) body.cliente_id = clts[0].id;
      }
      const row = await dbPost('fin_projects', body);
      return ok(`✅ Projeto criado!\nID: ${row.id}\nNome: ${row.nome}\nContrato: ${brl(row.valor_contrato)}\nStatus: ${row.status}`);
    }

    case 'atualizar_projeto': {
      const proj = (await dbGet('fin_projects', `id=eq.${args.id}`))[0];
      if (!proj) return ok(`Projeto ID "${args.id}" não encontrado.`);
      const patch = {};
      if (args.status        != null) patch.status = args.status;
      if (args.valor_recebido != null) patch.valor_recebido = args.valor_recebido;
      if (args.valor_custo    != null) patch.valor_custo = args.valor_custo;
      if (args.margem_lucro   != null) patch.margem_lucro = args.margem_lucro;
      if (args.observacoes    != null) patch.observacoes = args.observacoes;
      if (!Object.keys(patch).length) return ok('Nenhum campo para atualizar informado.');
      await dbPatch('fin_projects', `id=eq.${args.id}`, patch);
      return ok(`✅ Projeto "${proj.nome}" atualizado.\n${JSON.stringify(patch, null, 2)}`);
    }

    case 'listar_compras': {
      const status = args.status || 'solicitado';
      const limit  = args.limit  || 20;
      const [rows, fors, projs] = await Promise.all([
        dbGet('fin_purchase_requests', `status=eq.${status}&order=created_at.desc&limit=${limit}`),
        dbGet('fin_suppliers', 'select=id,nome'),
        dbGet('fin_projects', 'select=id,nome'),
      ]);
      const forMap  = Object.fromEntries(fors.map(f=>[f.id, f.nome]));
      const projMap = Object.fromEntries(projs.map(p=>[p.id, p.nome]));
      if (!rows.length) return ok(`Nenhuma compra com status "${status}".`);
      const lines = [`🛒 COMPRAS — ${status.toUpperCase()} (${rows.length})`, ''];
      rows.forEach(r => {
        lines.push(`ID: ${r.id}`);
        lines.push(`  ${r.descricao} | Qtd: ${r.quantidade||1} ${r.unidade||''}`);
        lines.push(`  Solicitante: ${r.solicitante||'—'} | Fornecedor: ${r.fornecedor_id?forMap[r.fornecedor_id]||'—':'—'}`);
        lines.push(`  Projeto: ${r.projeto_id?projMap[r.projeto_id]||'—':'—'} | Prioridade: ${r.prioridade||'normal'}`);
        lines.push(`  Valor Estimado: ${brl(r.valor_estimado)} | Valor Aprovado: ${r.valor_aprovado!=null?brl(r.valor_aprovado):'—'}`);
        if (r.motivo_recusa) lines.push(`  Motivo Recusa: ${r.motivo_recusa}`);
        lines.push('');
      });
      return ok(lines.join('\n'));
    }

    case 'aprovar_compra': {
      const comp = (await dbGet('fin_purchase_requests', `id=eq.${args.id}`))[0];
      if (!comp) return ok(`Compra ID "${args.id}" não encontrada.`);
      if (comp.status === 'aprovado') return ok(`Compra "${comp.descricao}" já está aprovada.`);
      const valorAprov = args.valor_aprovado ?? comp.valor_estimado;
      await dbPatch('fin_purchase_requests', `id=eq.${args.id}`, {
        status: 'aprovado',
        valor_aprovado: valorAprov,
        aprovado_em: new Date().toISOString(),
        observacoes: args.observacoes || comp.observacoes,
      });
      return ok(`✅ Compra APROVADA!\n"${comp.descricao}"\nValor aprovado: ${brl(valorAprov)}`);
    }

    case 'recusar_compra': {
      const comp = (await dbGet('fin_purchase_requests', `id=eq.${args.id}`))[0];
      if (!comp) return ok(`Compra ID "${args.id}" não encontrada.`);
      await dbPatch('fin_purchase_requests', `id=eq.${args.id}`, {
        status: 'recusado',
        motivo_recusa: args.motivo,
      });
      return ok(`❌ Compra RECUSADA.\n"${comp.descricao}"\nMotivo: ${args.motivo}`);
    }

    case 'gerar_dre': {
      const ano = args.ano;
      const mes = args.mes || null;
      let paramsP = mes
        ? `status=eq.pago&data_pagamento=gte.${ano}-${mes}-01&data_pagamento=lte.${ano}-${mes}-31`
        : `status=eq.pago&data_pagamento=gte.${ano}-01-01&data_pagamento=lte.${ano}-12-31`;
      let paramsR = mes
        ? `status=eq.recebido&data_recebimento=gte.${ano}-${mes}-01&data_recebimento=lte.${ano}-${mes}-31`
        : `status=eq.recebido&data_recebimento=gte.${ano}-01-01&data_recebimento=lte.${ano}-12-31`;
      const [pagos, recebidos, cats] = await Promise.all([
        dbGet('fin_payables',  paramsP + '&select=valor,categoria_id'),
        dbGet('fin_receivables', paramsR + '&select=valor,categoria_id'),
        dbGet('fin_categories', 'select=id,nome,pai_id'),
      ]);
      const catMap = Object.fromEntries(cats.map(c=>[c.id,c]));
      const recMap = {}; const despMap = {};
      recebidos.forEach(r => {
        const cat = r.categoria_id ? catMap[r.categoria_id] : null;
        const pai = cat?.pai_id ? catMap[cat.pai_id]?.nome : cat?.nome;
        const k = pai || 'Sem Categoria';
        recMap[k] = (recMap[k]||0) + (parseFloat(r.valor)||0);
      });
      pagos.forEach(p => {
        const cat = p.categoria_id ? catMap[p.categoria_id] : null;
        const pai = cat?.pai_id ? catMap[cat.pai_id]?.nome : cat?.nome;
        const k = pai || 'Sem Categoria';
        despMap[k] = (despMap[k]||0) + (parseFloat(p.valor)||0);
      });
      const totalRec  = Object.values(recMap).reduce((s,v)=>s+v,0);
      const totalDesp = Object.values(despMap).reduce((s,v)=>s+v,0);
      const resultado = totalRec - totalDesp;
      const periodo = mes ? `${ano}/${mes}` : String(ano);
      const lines = [
        `📊 DRE — ${periodo}`,
        '═'.repeat(50),
        '',
        '── RECEITAS ──────────────────────────────────',
        ...Object.entries(recMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`  ${k.padEnd(35)} ${brl(v)}`),
        `${'  TOTAL RECEITAS'.padEnd(36)} ${brl(totalRec)}`,
        '',
        '── DESPESAS ──────────────────────────────────',
        ...Object.entries(despMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`  ${k.padEnd(35)} ${brl(v)}`),
        `${'  TOTAL DESPESAS'.padEnd(36)} ${brl(totalDesp)}`,
        '',
        '═'.repeat(50),
        `  ${resultado>=0?'LUCRO LÍQUIDO':'PREJUÍZO LÍQUIDO'}`.padEnd(36) + ` ${brl(Math.abs(resultado))}`,
        resultado>=0 ? `  Margem: ${totalRec>0?((resultado/totalRec)*100).toFixed(1):'—'}%` : '',
      ];
      return ok(lines.join('\n'));
    }

    case 'gerar_fluxo_caixa': {
      const ano = args.ano;
      const [pagos, recebidos, abCP, abCR] = await Promise.all([
        dbGet('fin_payables',   `status=eq.pago&data_pagamento=gte.${ano}-01-01&data_pagamento=lte.${ano}-12-31&select=valor,data_pagamento`),
        dbGet('fin_receivables',`status=eq.recebido&data_recebimento=gte.${ano}-01-01&data_recebimento=lte.${ano}-12-31&select=valor,data_recebimento`),
        dbGet('fin_payables',   `status=eq.em_aberto&data_vencimento=gte.${ano}-01-01&data_vencimento=lte.${ano}-12-31&select=valor,data_vencimento`),
        dbGet('fin_receivables',`status=eq.em_aberto&data_vencimento=gte.${ano}-01-01&data_vencimento=lte.${ano}-12-31&select=valor,data_vencimento`),
      ]);
      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const tdN = today().substring(5,7);
      const lines = [`📈 FLUXO DE CAIXA — ${ano}`, '═'.repeat(62), ''];
      const hdr = 'Mês    Tipo        Entradas         Saídas          Saldo';
      lines.push(hdr);
      lines.push('─'.repeat(62));
      let saldoAcum = 0;
      meses.forEach((nm, i) => {
        const m = String(i+1).padStart(2,'0');
        const isFuture = m > tdN;
        const ent  = isFuture ? abCR.filter(r=>r.data_vencimento?.substring(5,7)===m).reduce((s,r)=>s+(parseFloat(r.valor)||0),0)
                              : recebidos.filter(r=>r.data_recebimento?.substring(5,7)===m).reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
        const sai  = isFuture ? abCP.filter(r=>r.data_vencimento?.substring(5,7)===m).reduce((s,r)=>s+(parseFloat(r.valor)||0),0)
                              : pagos.filter(r=>r.data_pagamento?.substring(5,7)===m).reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
        const saldo = ent - sai;
        saldoAcum += saldo;
        const tipo = isFuture ? 'Projeção  ' : 'Realizado ';
        lines.push(`${nm}    ${tipo}  ${brl(ent).padStart(14)}   ${brl(sai).padStart(14)}   ${brl(saldo).padStart(14)}`);
      });
      const totEnt = recebidos.reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
      const totSai = pagos.reduce((s,r)=>s+(parseFloat(r.valor)||0),0);
      lines.push('─'.repeat(62));
      lines.push(`TOTAL  Realizado  ${brl(totEnt).padStart(14)}   ${brl(totSai).padStart(14)}   ${brl(totEnt-totSai).padStart(14)}`);
      return ok(lines.join('\n'));
    }

    case 'relatorio_categorias': {
      const [pagos, cats] = await Promise.all([
        dbGet('fin_payables', 'status=eq.pago&select=valor,categoria_id'),
        dbGet('fin_categories', 'select=id,nome,pai_id'),
      ]);
      const catMap = Object.fromEntries(cats.map(c=>[c.id,c]));
      const grupos = {};
      pagos.forEach(p => {
        const cat = p.categoria_id ? catMap[p.categoria_id] : null;
        const pai = cat?.pai_id ? catMap[cat.pai_id]?.nome : cat?.nome;
        const k = pai || 'Sem Categoria';
        grupos[k] = (grupos[k]||0) + (parseFloat(p.valor)||0);
      });
      const total = Object.values(grupos).reduce((s,v)=>s+v,0);
      const sorted = Object.entries(grupos).sort((a,b)=>b[1]-a[1]);
      const lines = [`📊 DESPESAS POR CATEGORIA — Total: ${brl(total)}`, ''];
      sorted.forEach(([k,v]) => {
        const pct = total > 0 ? ((v/total)*100).toFixed(1) : 0;
        const bar = '█'.repeat(Math.round(pct/5));
        lines.push(`${k.padEnd(30)} ${brl(v).padStart(16)}  ${String(pct+'%').padStart(5)}  ${bar}`);
      });
      return ok(lines.join('\n'));
    }

    case 'listar_funcionarios': {
      const ativo = args.ativo !== false;
      const rows = await dbGet('fin_employees', `ativo=eq.${ativo}&order=nome.asc`);
      if (!rows.length) return ok('Nenhum funcionário encontrado.');
      const lines = [`👥 FUNCIONÁRIOS ${ativo?'ATIVOS':'INATIVOS'} (${rows.length})`, ''];
      rows.forEach(r => {
        lines.push(`ID: ${r.id} | ${r.nome}`);
        lines.push(`  Cargo: ${r.funcao||'—'} | Vínculo: ${r.tipo_vinculo||'—'} | Salário: ${brl(r.salario_base)}`);
        if (r.email) lines.push(`  Email: ${r.email}`);
        lines.push('');
      });
      return ok(lines.join('\n'));
    }

    case 'buscar_cliente': {
      const rows = await findByName('fin_clients', args.nome);
      if (!rows.length) return ok(`Nenhum cliente encontrado para "${args.nome}".`);
      const lines = [`🔍 Clientes encontrados para "${args.nome}":`, ''];
      rows.forEach(r => lines.push(`ID: ${r.id} | ${r.nome} | Tel: ${r.telefone||'—'} | Email: ${r.email||'—'}`));
      return ok(lines.join('\n'));
    }

    case 'buscar_fornecedor': {
      const rows = await findByName('fin_suppliers', args.nome);
      if (!rows.length) return ok(`Nenhum fornecedor encontrado para "${args.nome}".`);
      const lines = [`🔍 Fornecedores encontrados para "${args.nome}":`, ''];
      rows.forEach(r => lines.push(`ID: ${r.id} | ${r.nome} | Tel: ${r.telefone||'—'} | Email: ${r.email||'—'}`));
      return ok(lines.join('\n'));
    }

    case 'listar_categorias': {
      let params = 'order=nome.asc';
      if (args.tipo) params += `&tipo=eq.${args.tipo}`;
      const cats = await dbGet('fin_categories', params);
      const pais = cats.filter(c=>!c.pai_id);
      const filhos = cats.filter(c=>c.pai_id);
      const lines = [`🏷️  CATEGORIAS (${cats.length})`, ''];
      pais.forEach(p => {
        lines.push(`[${p.tipo?.toUpperCase()||'—'}] ${p.nome}`);
        filhos.filter(f=>f.pai_id===p.id).forEach(f => lines.push(`  └─ ${f.nome}`));
      });
      return ok(lines.join('\n'));
    }

    default:
      return ok(`Tool "${name}" não reconhecida.`);
  }
}

// ── Server setup ──────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'sombrear-financeiro', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    return await handle(name, args || {});
  } catch (e) {
    return err(e);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
