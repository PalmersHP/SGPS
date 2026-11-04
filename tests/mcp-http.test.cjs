'use strict';
const http = require('node:http');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../mcp-sombrear/handler.cjs');
const { createStore } = require('../mcp-sombrear/store.cjs');
const Estoque = require('../estoque-core.js');
const config = { supabaseUrl: 'https://project.supabase.co', supabaseAnonKey: 'anon', resourceUrl: 'https://app.example/api/mcp' };

test('Streamable HTTP discovery is public; calls require approved OAuth and reject hostile origins', async t => {
  let calls = 0;
  const operations = {
    listTools: () => [{ name: 'contexto_operador', description: 'Contexto', inputSchema: { type: 'object', properties: {} }, securitySchemes: [{type:'oauth2',scopes:[]}] }],
    callTool: async (name, args, principal) => { calls++; return { content: [{ type: 'text', text: principal.nome }] }; }
  };
  const fetchImpl = async () => ({ ok: true, json: async () => ({ id: 'auth-user', app_metadata: { sombrear_mcp: { enabled: true, resource_url: config.resourceUrl, usuario_id: 'u1', nome: 'Henrique', role: 'sede', client_ids: ['chatgpt'] } } }) });
  const server = http.createServer(createHandler({ config, operations, fetchImpl }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = 'http://127.0.0.1:' + server.address().port + '/api/mcp';
  const request = async (method, params = {}, headers = {}) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  let res = await request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
  assert.equal(res.status, 200); assert.equal((await res.json()).result.serverInfo.name, 'sombrear-pedidos-estoques');
  res = await request('tools/list'); assert.equal(res.status, 200); assert.equal((await res.json()).result.tools.length, 1);
  res = await request('tools/call', { name: 'contexto_operador' }); assert.equal(res.status, 401); assert.match(res.headers.get('www-authenticate'), /oauth-protected-resource/); assert.equal(calls, 0);
  res = await request('tools/list', {}, { Origin: 'https://attacker.example' }); assert.equal(res.status, 403);
  const claims = { iss: config.supabaseUrl + '/auth/v1', aud: 'authenticated', role: 'authenticated', sub: 'auth-user', client_id: 'chatgpt', exp: Math.floor(Date.now()/1000)+300 };
  const authorization = 'Bearer h.' + Buffer.from(JSON.stringify(claims)).toString('base64url') + '.s';
  res = await request('tools/call', { name: 'contexto_operador' }, { Authorization: authorization });
  assert.equal(res.status, 200); assert.equal((await res.json()).result.content[0].text, 'Henrique'); assert.equal(calls, 1);
  res = await fetch(url); assert.equal(res.status, 405);
  res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); assert.equal(res.status, 400);
  res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(262145) }); assert.equal(res.status, 413);
});

test('Supabase store requires canonical data and writes the entire ledger with CAS', async () => {
  const state = Estoque.fromRecords([], [{ id: 'df', nome: 'Sombrear DF' }], []);
  const rows = [
    { key: 'pastas_estoques', value: Estoque.toRecords(state), updated_at: '2026-11-04T10:00:00.000Z' },
    { key: 'filiais', value: [{ id: 'df', nome: 'Sombrear DF' }] }, { key: 'catalogo', value: [] }, { key: 'usuarios', value: [] }
  ];
  let conflict = false;
  const store = createStore({ ...config, fetchImpl: async (url, options) => {
    if (options.method === 'PATCH') {
      const parsed = new URL(url); assert.equal(parsed.searchParams.get('key'), 'eq.pastas_estoques');
      assert.equal(parsed.searchParams.get('updated_at'), 'eq.' + rows[0].updated_at);
      assert.deepEqual(JSON.parse(options.body).value, Estoque.toRecords(state));
      assert.ok(Date.parse(JSON.parse(options.body).updated_at) > Date.parse(rows[0].updated_at));
      return { ok: true, json: async () => conflict ? [] : [{ key: 'pastas_estoques', updated_at: 'next' }] };
    }
    return { ok: true, json: async () => rows };
  } });
  const snapshot = await store.read(); assert.equal(snapshot.state.pastas.length, 0);
  assert.equal(await store.write(state, snapshot.version), 'next'); conflict = true;
  await assert.rejects(store.write(state, snapshot.version), error => error.code === 'CONFLICT');
  rows.shift(); await assert.rejects(store.read(), /Base incompleta: pastas_estoques/);
});
