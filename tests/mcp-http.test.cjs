'use strict';
const http = require('node:http');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CallToolResultSchema, ListToolsResultSchema } = require('@modelcontextprotocol/sdk/types.js');
const { createHandler } = require('../mcp-sombrear/handler.cjs');
const { createOperations } = require('../mcp-sombrear/operacoes.cjs');
const { createStore } = require('../mcp-sombrear/store.cjs');
const Estoque = require('../estoque-core.js');
const config = { supabaseUrl: 'https://project.supabase.co', supabaseAnonKey: 'anon', resourceUrl: 'https://app.example/api/mcp' };

test('Streamable HTTP discovery and tool-level OAuth errors preserve authorization', async t => {
  let calls = 0, authRequests = 0, authMode = 'valid';
  const definitions = createOperations({ store: { read: async () => { throw new Error('Discovery must not read business data'); }, write: async () => {} } }).listTools();
  const operations = {
    listTools: () => definitions,
    callTool: async (name, args, principal) => {
      calls++;
      assert.equal(name, 'contexto_operador'); assert.deepEqual(args, {});
      assert.equal(principal.id, 'u1'); assert.equal(principal.auth_id, 'auth-user'); assert.equal(principal.role, 'sede');
      return { content: [{ type: 'text', text: principal.nome }] };
    }
  };
  const fetchImpl = async () => {
    authRequests++;
    if (authMode === 'network_failure') throw new Error('Internal network details must stay private');
    if (authMode === 'rejected') return { ok: false, status: 401 };
    if (authMode === 'unavailable') return { ok: false, status: 503 };
    return { ok: true, json: async () => ({ id: 'auth-user', app_metadata: authMode === 'unapproved' ? {} : { sombrear_mcp: { enabled: true, resource_url: config.resourceUrl, usuario_id: 'u1', nome: 'Henrique', role: 'sede', client_ids: ['chatgpt'] } } }) };
  };
  const server = http.createServer(createHandler({ config, operations, fetchImpl }));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = 'http://127.0.0.1:' + server.address().port + '/api/mcp';
  const request = async (method, params = {}, headers = {}) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const authorization = (overrides = {}) => 'Bearer h.' + Buffer.from(JSON.stringify({ iss: config.supabaseUrl + '/auth/v1', aud: 'authenticated', role: 'authenticated', sub: 'auth-user', client_id: 'chatgpt', exp: Math.floor(Date.now()/1000)+300, ...overrides })).toString('base64url') + '.s';
  const toolCall = headers => request('tools/call', { name: 'contexto_operador', arguments: {} }, headers);
  async function authFailure(headers, expectedText, hasChallenge) {
    const res = await toolCall(headers);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('www-authenticate'), null);
    const message = await res.json();
    assert.equal(message.jsonrpc, '2.0'); assert.equal(message.id, 1); assert.equal(message.error, undefined);
    const result = CallToolResultSchema.parse(message.result);
    assert.equal(result.isError, true); assert.match(result.content[0].text, expectedText);
    if (hasChallenge) {
      assert.deepEqual(result._meta['mcp/www_authenticate'], ['Bearer resource_metadata="https://app.example/.well-known/oauth-protected-resource/api/mcp", error="invalid_token", error_description="Conecte sua conta Sombrear para continuar."']);
    } else {
      assert.equal(result._meta?.['mcp/www_authenticate'], undefined);
    }
    assert.equal(calls, 0);
  }
  await t.test('anonymous discovery preserves OAuth descriptors and never authenticates', async () => {
    let res = await request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
    assert.equal(res.status, 200); assert.equal((await res.json()).result.serverInfo.name, 'sombrear-pedidos-estoques');
    res = await request('tools/list'); assert.equal(res.status, 200);
    const listed = (await res.json()).result;
    assert.equal(listed.tools.length, definitions.length);
    for (const definition of listed.tools) assert.deepEqual(definition.securitySchemes, [{ type: 'oauth2', scopes: [] }]);
    for (const definition of ListToolsResultSchema.parse(listed).tools) assert.deepEqual(definition._meta.securitySchemes, [{ type: 'oauth2', scopes: [] }]);
    res = await request('ping'); assert.equal(res.status, 200); assert.deepEqual((await res.json()).result, {});
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) });
    assert.equal(res.status, 202); assert.equal(authRequests, 0); assert.equal(calls, 0);
  });
  for (const [name, headers] of [
    ['missing token', {}],
    ['malformed token', { Authorization: 'Bearer invalid' }],
    ['expired token', { Authorization: authorization({ exp: Math.floor(Date.now()/1000)-60 }) }]
  ]) await t.test(name + ' triggers tool-level OAuth without executing an operation', async () => {
    await authFailure(headers, /Conecte sua conta Sombrear/, true); assert.equal(authRequests, 0);
  });
  await t.test('token rejected by Supabase triggers OAuth without executing an operation', async () => {
    authMode = 'rejected'; await authFailure({ Authorization: authorization() }, /Conecte sua conta Sombrear/, true); assert.equal(authRequests, 1);
  });
  await t.test('an unapproved account returns a clear error without an OAuth loop', async () => {
    authMode = 'unapproved'; await authFailure({ Authorization: authorization() }, /não está autorizado.*administrador/, false);
  });
  for (const mode of ['unavailable', 'network_failure']) await t.test('Supabase ' + mode + ' returns a temporary error without an OAuth loop', async () => {
    authMode = mode; await authFailure({ Authorization: authorization() }, /autenticação está temporariamente indisponível/, false);
  });
  await t.test('other private methods retain transport authentication', async () => {
    const res = await request('resources/list'); assert.equal(res.status, 401); assert.match(res.headers.get('www-authenticate'), /oauth-protected-resource/); assert.equal(calls, 0);
  });
  await t.test('an approved OAuth account executes the operation exactly once', async () => {
    authMode = 'valid'; const before = authRequests;
    const res = await toolCall({ Authorization: authorization() });
    assert.equal(res.status, 200); assert.equal((await res.json()).result.content[0].text, 'Henrique'); assert.equal(calls, 1); assert.equal(authRequests, before+1);
  });
  await t.test('origin, malformed JSON and request size protections remain enforced', async () => {
    const before = authRequests;
    let res = await toolCall({ Authorization: authorization(), Origin: 'https://attacker.example' }); assert.equal(res.status, 403);
    res = await fetch(url); assert.equal(res.status, 405);
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }); assert.equal(res.status, 400);
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: ' '.repeat(262145) }); assert.equal(res.status, 413);
    assert.equal(authRequests, before); assert.equal(calls, 1);
  });
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
