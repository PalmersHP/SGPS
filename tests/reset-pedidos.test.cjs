'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {run, loadConfig, verifyBackup} = require('../scripts/reset-pedidos.cjs');
const Core = require('../estoque-core.js');
const copy = value => JSON.parse(JSON.stringify(value));
const token = role => 'header.' + Buffer.from(JSON.stringify({role})).toString('base64url') + '.signature';
const env = {SUPABASE_URL: 'https://test.invalid', SUPABASE_ANON_KEY: token('anon')};
const fixedTime = () => new Date('2026-11-04T15:00:00.000Z');

function setup(t, hooks = {}) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sombrear-reset-test-'));
  t.after(() => fs.rmSync(temp, {recursive: true, force: true}));
  const repoRoot = path.join(temp, 'repo'), backupDir = path.join(temp, 'private-backups');
  fs.mkdirSync(repoRoot);
  const filiais = [{id: 'df', nome: 'Sombrear DF', ativo: true}];
  const folder = {id: 'old', filial_id: 'df', cliente: 'Cliente privado', cor_estrutura: 'Branca', cor_tela: 'Prata', itens: [{id: 'it1', desc: 'Pilar', un: 'PÇ', qtd: 20}]};
  const data = {
    pedidos: [copy(folder)],
    pastas_estoques: Core.toRecords(Core.fromRecords([copy(folder)], filiais, [])),
    catalogo: [{id: 'c1', desc: 'Pilar', un: 'PÇ', preco: 50}],
    usuarios: [{id: 'u1', nome: 'Pessoa privada', email: 'privado@example.invalid', senha: 'segredo-nao-imprimir', role: 'sede'}],
    filiais
  };
  const rows = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, {key, value, updated_at: '2026-11-03T10:00:00.000Z'}]));
  const initial = copy(rows), requests = [], logs = [], reads = {};
  // JSONB can change object key order: verification must compare data, not serialization order.
  function jsonb(value) {
    if (Array.isArray(value)) return value.map(jsonb);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, jsonb(value[key])]));
    return value;
  }
  const fetchImpl = async (url, init) => {
    const target = new URL(url), method = init.method || 'GET';
    const key = method === 'POST' ? JSON.parse(init.body).key : target.searchParams.get('key')?.slice(3);
    requests.push({method, key, body: init.body ? JSON.parse(init.body) : null, prefer: init.headers.Prefer});
    if (method === 'GET') {
      reads[key] = (reads[key] || 0) + 1;
      hooks.onRead?.({key, count: reads[key], rows});
      return new Response(JSON.stringify(rows[key] ? [rows[key]] : []), {status: 200});
    }
    hooks.onWrite?.({key, method, rows, init});
    if (method === 'PATCH') {
      if (!rows[key] || target.searchParams.get('updated_at') !== 'eq.' + rows[key].updated_at) return new Response('[]');
      rows[key] = jsonb({...rows[key], ...JSON.parse(init.body)});
    } else if (method === 'POST') {
      assert.equal(init.headers.Prefer, 'return=representation');
      if (rows[key]) return new Response('{}', {status: 409});
      rows[key] = jsonb(JSON.parse(init.body));
    } else throw new Error('Método inesperado: ' + method);
    return new Response(JSON.stringify([{key}]));
  };
  const deps = {env, repoRoot, fetchImpl, now: fixedTime, log: line => logs.push(line)};
  return {temp, repoRoot, backupDir, rows, initial, requests, logs, deps};
}

test('dry-run padrão consulta contagens sem gravar, criar backup ou revelar cadastros', async t => {
  const f = setup(t), result = await run([], f.deps);
  assert.equal(result.mode, 'dry-run');assert.equal(result.inventory.pastas, 1);
  assert.ok(f.requests.every(r => r.method === 'GET'));assert.deepEqual(f.rows, f.initial);
  assert.equal(fs.existsSync(f.backupDir), false);
  assert.doesNotMatch(f.logs.join('\n'), /segredo-nao-imprimir|privado@example|Pessoa privada|Cliente privado|signature/);
});

test('apply exige escopo explícito, backup externo e somente chave pública', async t => {
  const f = setup(t);
  await assert.rejects(run(['--apply'], f.deps), /exige/);
  await assert.rejects(run(['--apply', '--keep-catalog', '--clear-catalog', '--backup-dir', f.backupDir], f.deps), /somente uma/);
  await assert.rejects(run([], {...f.deps, env: {...env, SUPABASE_ANON_KEY: token('service_role')}}), /somente a chave pública/);
  await assert.rejects(run([], {...f.deps, env: {...env, SUPABASE_ANON_KEY: 'sb_secret_private'}}), /somente a chave pública/);
  assert.equal(f.requests.length, 0);
});

test('reset preserva usuários, filiais e catálogo e verifica backup privado e releitura JSONB', async t => {
  const f = setup(t);
  const result = await run(['--apply', '--keep-catalog', '--backup-dir', f.backupDir], f.deps);
  assert.deepEqual(result.completed, ['pastas_estoques', 'pedidos']);
  assert.deepEqual(f.rows.pedidos.value, []);
  const state = Core.fromRecords(f.rows.pastas_estoques.value, f.rows.filiais.value, f.rows.catalogo.value);
  assert.deepEqual(state.pastas, []);assert.deepEqual(state.movimentos, []);assert.equal(state.estoques.length, 2);
  assert.equal(f.rows.pastas_estoques.value[0].tipo_registro, 'controle_estoque');
  for (const key of ['usuarios', 'filiais', 'catalogo']) assert.deepEqual(f.rows[key], f.initial[key]);
  assert.equal(fs.statSync(path.dirname(result.backup)).mode & 0o777, 0o700);
  assert.equal(fs.statSync(result.backup).mode & 0o777, 0o600);
  assert.equal(fs.statSync(path.join(path.dirname(result.backup), 'backup.sha256')).mode & 0o777, 0o600);
  const backup = JSON.parse(fs.readFileSync(result.backup));assert.deepEqual(backup.rows, f.initial);
  assert.equal(JSON.stringify(backup).includes(env.SUPABASE_ANON_KEY), false);
  assert.equal(result.inventory.pastas, 0);assert.equal(result.inventory.movimentos, 0);
});

test('clear-catalog limpa catálogo somente com a flag e preserva demais cadastros', async t => {
  const f = setup(t);
  const result = await run(['--apply', '--clear-catalog', '--backup-dir', f.backupDir], f.deps);
  assert.deepEqual(result.completed, ['pastas_estoques', 'pedidos', 'catalogo']);assert.deepEqual(f.rows.catalogo.value, []);
  for (const key of ['usuarios', 'filiais']) assert.deepEqual(f.rows[key], f.initial[key]);
});

test('linha canônica ausente é criada sem upsert e não reimporta pedidos antigos', async t => {
  const f = setup(t);delete f.rows.pastas_estoques;
  await run(['--apply', '--keep-catalog', '--backup-dir', f.backupDir], f.deps);
  assert.equal(f.requests.filter(r => r.method === 'POST').length, 1);
  assert.deepEqual(Core.fromRecords(f.rows.pastas_estoques.value, f.rows.filiais.value, []).pastas, []);
});

test('conflito na primeira gravação aborta sem sobrescrever a atualização concorrente', async t => {
  const f = setup(t, {onWrite({key, rows}) { if (key === 'pastas_estoques') rows[key].updated_at = '2026-11-04T16:00:00.000Z'; }});
  let failure;
  try { await run(['--apply', '--clear-catalog', '--backup-dir', f.backupDir], f.deps); } catch (error) { failure = error; }
  assert.match(failure.message, /Conflito/);assert.deepEqual(failure.completed, []);assert.ok(fs.existsSync(failure.backup));
  assert.deepEqual(f.rows.pedidos, f.initial.pedidos);assert.deepEqual(f.rows.catalogo, f.initial.catalogo);
  assert.deepEqual(f.rows.pastas_estoques.value, f.initial.pastas_estoques.value);
  assert.equal(f.requests.filter(r => r.method !== 'GET').length, 1);
});

test('conflito posterior informa reset parcial e não executa catálogo ou rollback', async t => {
  const f = setup(t, {onWrite({key, rows}) { if (key === 'pedidos') rows[key].updated_at = '2026-11-04T16:00:00.000Z'; }});
  let failure;
  try { await run(['--apply', '--clear-catalog', '--backup-dir', f.backupDir], f.deps); } catch (error) { failure = error; }
  assert.match(failure.message, /Conflito/);assert.deepEqual(failure.completed, ['pastas_estoques']);assert.equal(failure.attempted, 'pedidos');
  assert.deepEqual(f.rows.catalogo, f.initial.catalogo);assert.deepEqual(f.rows.pedidos.value, f.initial.pedidos.value);
  assert.deepEqual(f.requests.filter(r => r.method !== 'GET').map(r => r.key), ['pastas_estoques', 'pedidos']);
});

test('mudança depois do backup é detectada antes da primeira gravação', async t => {
  const f = setup(t, {onRead({key, count, rows}) { if (key === 'usuarios' && count === 2) rows[key].updated_at = '2026-11-04T14:00:00.000Z'; }});
  await assert.rejects(run(['--apply', '--keep-catalog', '--backup-dir', f.backupDir], f.deps), /mudou depois do backup/);
  assert.ok(f.requests.every(r => r.method === 'GET'));
});

test('backup dentro do repositório, inclusive via symlink, bloqueia todas as gravações', async t => {
  const f = setup(t);
  await assert.rejects(run(['--apply', '--keep-catalog', '--backup-dir', path.join(f.repoRoot, 'backup')], f.deps), /fora do repositório/);
  const link = path.join(f.temp, 'atalho');fs.symlinkSync(f.repoRoot, link);
  await assert.rejects(run(['--apply', '--keep-catalog', '--backup-dir', path.join(link, 'backup')], f.deps), /fora do repositório/);
  assert.ok(f.requests.every(r => r.method === 'GET'));assert.equal(fs.existsSync(path.join(f.repoRoot, 'backup')), false);
});

test('verificação detecta backup alterado', async t => {
  const f = setup(t), result = await run(['--apply', '--keep-catalog', '--backup-dir', f.backupDir], f.deps);
  const directory = path.dirname(result.backup), checksum = fs.readFileSync(path.join(directory, 'backup.sha256'), 'utf8').split(' ')[0];
  fs.appendFileSync(result.backup, '\ncorrompido');
  assert.throws(() => verifyBackup({directory, file: result.backup, checksum}, f.initial), /integridade/);
});

test('configuração pública pode vir do app, sem executar seu JavaScript', t => {
  const f = setup(t), app = path.join(f.repoRoot, 'app.html');
  fs.writeFileSync(app, "var SUPA_URL='https://test.invalid';var SUPA_KEY='" + token('anon') + "';throw new Error('Não executar');");
  assert.equal(loadConfig({}, app).key, token('anon'));
});
