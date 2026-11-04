#!/usr/bin/env node
'use strict';

// Dry-run: node scripts/reset-pedidos.cjs
// Apply: --apply --keep-catalog|--clear-catalog --backup-dir /private/path/outside/repo
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {isDeepStrictEqual} = require('node:util');
const Estoque = require('../estoque-core.js');
const ROOT = path.resolve(__dirname, '..');
const KEYS = ['pedidos', 'pastas_estoques', 'catalogo', 'usuarios', 'filiais'];
const same = isDeepStrictEqual;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function parseArgs(argv) {
  const options = {apply: false, catalog: null, backupDir: null};
  let explicitDry = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--apply') options.apply = true;
    else if (arg === '--dry-run') explicitDry = true;
    else if (arg === '--keep-catalog' || arg === '--clear-catalog') {
      const catalog = arg === '--keep-catalog' ? 'keep' : 'clear';
      if (options.catalog && options.catalog !== catalog) throw new Error('Escolha somente uma opção de catálogo.');
      options.catalog = catalog;
    } else if (arg === '--backup-dir') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('--backup-dir exige um caminho fora do repositório.');
      options.backupDir = argv[++i];
    } else throw new Error('Argumento desconhecido. Use --help para consultar as opções.');
  }
  if (options.apply && explicitDry) throw new Error('--apply e --dry-run não podem ser usados juntos.');
  if (options.apply && !options.help && (!options.catalog || !options.backupDir)) {
    throw new Error('--apply exige --keep-catalog ou --clear-catalog e --backup-dir fora do repositório.');
  }
  return options;
}

function loadConfig(env, appPath) {
  let url = env.SUPABASE_URL, key = env.SUPABASE_ANON_KEY;
  if (!!url !== !!key) throw new Error('Informe SUPABASE_URL e SUPABASE_ANON_KEY juntos.');
  if (!url) {
    const html = fs.readFileSync(appPath, 'utf8');
    url = html.match(/\bvar\s+SUPA_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
    key = html.match(/\bvar\s+SUPA_KEY\s*=\s*['"]([^'"]+)['"]/)?.[1];
  }
  if (!url || !key) throw new Error('Configuração pública do Supabase não encontrada.');
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('SUPABASE_URL inválida.'); }
  if (parsed.username || parsed.password || parsed.search || parsed.hash ||
      (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname)))) {
    throw new Error('Use uma URL HTTPS do Supabase, sem credenciais ou parâmetros.');
  }
  let role;
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch {}
  if (!(key.startsWith('sb_publishable_') || role === 'anon') || key.startsWith('sb_secret_')) {
    throw new Error('O script aceita somente a chave pública anon/publishable; service_role e secret não são permitidas.');
  }
  return {url: parsed.href.replace(/\/$/, ''), key};
}

function client(config, fetchImpl) {
  const headers = {apikey: config.key, Authorization: 'Bearer ' + config.key, 'Content-Type': 'application/json'};
  async function request(suffix, init = {}) {
    try {
      return await fetchImpl(config.url + '/rest/v1/sgps_store' + suffix, {
        cache: 'no-store', signal: AbortSignal.timeout(20000), ...init,
        headers: {...headers, ...init.headers}
      });
    } catch { throw new Error('Falha de conexão com o Supabase; confira o estado antes de repetir uma gravação.'); }
  }
  async function read(key) {
    const response = await request('?key=eq.' + encodeURIComponent(key) + '&select=key,value,updated_at');
    if (!response.ok) throw new Error('Falha ao consultar ' + key + ': HTTP ' + response.status + '.');
    let rows;
    try { rows = await response.json(); } catch { throw new Error('Resposta inválida ao consultar ' + key + '.'); }
    if (Array.isArray(rows) && rows.length === 0 && key === 'pastas_estoques') return null;
    if (!Array.isArray(rows) || rows.length !== 1 || rows[0].key !== key || !Array.isArray(rows[0].value) ||
        typeof rows[0].updated_at !== 'string' || !Number.isFinite(Date.parse(rows[0].updated_at))) {
      throw new Error('A linha ' + key + ' deve existir com value em array e updated_at válido. Nenhum dado de exemplo será criado.');
    }
    return {key, value: rows[0].value, updated_at: rows[0].updated_at};
  }
  async function readAll() {
    const rows = await Promise.all(KEYS.map(async key => [key, await read(key)]));
    return Object.fromEntries(rows);
  }
  async function write(key, value, previous, updatedAt) {
    const query = previous ? '?key=eq.' + encodeURIComponent(key) + '&updated_at=eq.' + encodeURIComponent(previous.updated_at) + '&select=key' : '?select=key';
    const payload = {value, updated_at: updatedAt};
    if (!previous) payload.key = key;
    const response = await request(query, {method: previous ? 'PATCH' : 'POST', headers: {Prefer: 'return=representation'}, body: JSON.stringify(payload)});
    if (response.status === 409) throw new Error('Conflito em ' + key + ': outra operação criou ou alterou a linha.');
    if (!response.ok) throw new Error('Falha ao gravar ' + key + ': HTTP ' + response.status + '.');
    let changed;
    try { changed = await response.json(); } catch { throw new Error('Resposta inválida após gravar ' + key + '; confira o estado no servidor.'); }
    if (!Array.isArray(changed) || changed.length !== 1 || changed[0].key !== key) {
      throw new Error('Conflito em ' + key + ': a versão consultada não está mais disponível.');
    }
  }
  return {read, readAll, write};
}

function inventory(rows) {
  const canonical = rows.pastas_estoques;
  const state = Estoque.fromRecords((canonical || rows.pedidos).value, rows.filiais.value, rows.catalogo.value);
  return {
    pedidos_arquivados: rows.pedidos.value.filter(r => r.tipo_registro !== 'controle_estoque').length,
    registro_canonico_presente: !!canonical,
    pastas: state.pastas.length,
    obras_finalizadas: state.pastas.filter(p => p.status_obra === 'finalizada').length,
    depositos: state.estoques.length,
    movimentos: state.movimentos.length,
    remanejamentos_pendentes: Estoque.pendingTransfers(state).length,
    solicitacoes_pendentes: Estoque.requests(state).filter(r => r.ativo && r.itens.some(it => it.pendente > 0)).length,
    itens_catalogo: rows.catalogo.value.length,
    usuarios: rows.usuarios.value.length,
    filiais: rows.filiais.value.length
  };
}

function buildPlan(rows, catalog) {
  const empty = Estoque.toRecords(Estoque.fromRecords([], rows.filiais.value, catalog === 'clear' ? [] : rows.catalogo.value));
  const plan = [{key: 'pastas_estoques', value: empty}, {key: 'pedidos', value: []}];
  if (catalog === 'clear') plan.push({key: 'catalogo', value: []});
  return plan;
}

function inside(target, parent) {
  const relative = path.relative(parent, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveExistingParent(target) {
  let parent = path.resolve(target), suffix = [];
  while (!fs.existsSync(parent)) {
    suffix.unshift(path.basename(parent));
    const next = path.dirname(parent);
    if (next === parent) throw new Error('Diretório de backup inválido.');
    parent = next;
  }
  return path.join(fs.realpathSync(parent), ...suffix);
}

function writePrivate(file, bytes) {
  const fd = fs.openSync(file, 'wx', 0o600);
  try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

function createBackup(rows, options, config, repoRoot, now) {
  const root = fs.realpathSync(repoRoot), destination = resolveExistingParent(options.backupDir);
  if (inside(path.resolve(options.backupDir), path.resolve(repoRoot)) || inside(destination, root)) throw new Error('O backup deve ficar fora do repositório publicado, inclusive quando o caminho usa um link simbólico.');
  fs.mkdirSync(destination, {recursive: true, mode: 0o700});
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(destination), 'sgps-reset-'));
  fs.chmodSync(directory, 0o700);
  const data = {format: 'sombrear-sgps-reset', version: 1, created_at: now().toISOString(), origin: config.url,
    catalog: options.catalog, rows};
  const bytes = Buffer.from(JSON.stringify(data, null, 2) + '\n');
  const checksum = digest(bytes), file = path.join(directory, 'backup.json');
  writePrivate(file, bytes);
  writePrivate(path.join(directory, 'backup.sha256'), checksum + '  backup.json\n');
  return {directory, file, checksum};
}

function verifyBackup(backup, rows) {
  for (const [file, mode] of [[backup.directory, 0o700], [backup.file, 0o600], [path.join(backup.directory, 'backup.sha256'), 0o600]]) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || (stat.mode & 0o777) !== mode) throw new Error('O backup não está com as permissões privadas esperadas.');
  }
  const bytes = fs.readFileSync(backup.file);
  const hashFile = fs.readFileSync(path.join(backup.directory, 'backup.sha256'), 'utf8').trim().split(/\s+/)[0];
  if (digest(bytes) !== backup.checksum || hashFile !== backup.checksum) throw new Error('A integridade do backup não foi confirmada.');
  let data;
  try { data = JSON.parse(bytes); } catch { throw new Error('O backup não contém JSON válido.'); }
  if (data.format !== 'sombrear-sgps-reset' || data.version !== 1 || !same(data.rows, rows)) throw new Error('O backup não corresponde aos registros consultados.');
  return true;
}

async function run(argv, dependencies = {}) {
  const options = parseArgs(argv), log = dependencies.log || console.log;
  if (options.help) {
    log('Uso: node scripts/reset-pedidos.cjs [--dry-run] [--keep-catalog|--clear-catalog]\nAplicar: --apply (--keep-catalog|--clear-catalog) --backup-dir /caminho/privado/fora/do/repositorio\nCredenciais públicas: SUPABASE_URL + SUPABASE_ANON_KEY, ou configuração de app.html.');
    return {mode: 'help'};
  }
  const repoRoot = dependencies.repoRoot || ROOT;
  const config = loadConfig(dependencies.env || process.env, dependencies.appPath || path.join(repoRoot, 'app.html'));
  const api = client(config, dependencies.fetchImpl || globalThis.fetch), now = dependencies.now || (() => new Date());
  const rows = await api.readAll(), counts = inventory(rows), plan = buildPlan(rows, options.catalog);
  log('Destino: ' + new URL(config.url).host);
  log('Inventário (contagens): ' + JSON.stringify(counts));
  log('Plano: zerar pedidos e pastas/estoques/histórico; preservar usuários e filiais; ' + (options.catalog === 'clear' ? 'zerar catálogo.' : 'preservar catálogo.'));
  if (!options.apply) {
    log('DRY-RUN: nenhuma gravação e nenhum backup criado. --apply exige uma escolha explícita de catálogo e diretório privado de backup.');
    return {mode: 'dry-run', inventory: counts, keys: plan.map(p => p.key)};
  }
  let backup, attempted = null;
  const completed = [];
  try {
    backup = createBackup(rows, options, config, repoRoot, now);
    verifyBackup(backup, rows);
    log('Backup privado verificado: ' + backup.file);
    const preflight = await api.readAll();
    for (const key of KEYS) if (!same(preflight[key], rows[key])) throw new Error('Conflito antes do reset: ' + key + ' mudou depois do backup.');
    for (const step of plan) {
      const previous = rows[step.key];
      const updatedAt = new Date(Math.max(now().getTime(), previous ? Date.parse(previous.updated_at) + 1 : 0)).toISOString();
      attempted = step.key;
      await api.write(step.key, step.value, previous, updatedAt);
      const checked = await api.read(step.key);
      if (!checked || !same(checked.value, step.value) || Date.parse(checked.updated_at) !== Date.parse(updatedAt)) {
        throw new Error('A releitura de ' + step.key + ' divergiu do reset; a operação foi interrompida.');
      }
      completed.push(step.key);attempted = null;
    }
    const finalRows = await api.readAll();
    for (const key of KEYS) {
      const expected = plan.find(p => p.key === key)?.value || rows[key]?.value;
      if (!finalRows[key] || !same(finalRows[key].value, expected)) throw new Error('A verificação final encontrou alteração concorrente em ' + key + '.');
    }
    log('Reset confirmado por releitura. Inventário final: ' + JSON.stringify(inventory(finalRows)));
    return {mode: 'apply', backup: backup.file, completed, inventory: inventory(finalRows)};
  } catch (error) {
    error.backup = backup?.file;error.completed = completed;error.attempted = attempted;
    throw error;
  }
}

module.exports = {run, parseArgs, loadConfig, inventory, buildPlan, createBackup, verifyBackup};
if (require.main === module) run(process.argv.slice(2)).catch(error => {
  console.error('Erro: ' + error.message);
  if (error.backup) console.error('Backup privado disponível: ' + error.backup);
  if (error.completed?.length) console.error('Etapas já confirmadas: ' + error.completed.join(', ') + '.');
  if (error.attempted) console.error('Confira a etapa iniciada: ' + error.attempted + '.');
  if (error.backup) console.error('Nenhum conflito foi sobrescrito e não houve restauração automática. A operação pode estar parcial; confira os registros antes de repetir.');
  process.exitCode = 1;
});
