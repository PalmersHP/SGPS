'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {run, parseArgs, loadConfig, validRedirect} = require('../scripts/configurar-mcp.cjs');
const clone = value => JSON.parse(JSON.stringify(value));
const token = role => 'header.' + Buffer.from(JSON.stringify({role})).toString('base64url') + '.fake_signature';
const AUTH_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_ID = '22222222-2222-4222-8222-222222222222';
const CLIENT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const RESOURCE = 'https://mcp.example.invalid/api/mcp';
const env = {SUPABASE_URL: 'https://supabase.example.invalid', SUPABASE_SERVICE_ROLE_KEY: token('service_role'), SUPABASE_ANON_KEY: token('anon')};
const defaults = {supabaseUrl: env.SUPABASE_URL, supabaseAnonKey: env.SUPABASE_ANON_KEY, resourceUrl: RESOURCE};
const grantArgs = ['--email', 'OPERADOR@example.invalid', '--usuario-id', 'u1', '--client-id', CLIENT_ID, '--perfil-atual'];
const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers});

function fixture(hooks = {}) {
  const state = {
    auth: {id: AUTH_ID, email: 'operador@example.invalid', updated_at: '2026-11-04T12:00:00Z', app_metadata: {provider: 'email', providers: ['email'], unrelated: {private: 'metadata-nao-imprimir'}}, user_metadata: {display_name: 'Nome privado'}, encrypted_password: 'hash-nao-imprimir'},
    sgps: [{id: 'u1', nome: 'Operador DF', email: 'sgps@example.invalid', senha: 'senha-nao-imprimir', role: 'filial', filial_id: 'df', ativo: true}],
    oauth: {client_id: CLIENT_ID, client_name: 'ChatGPT Sombrear', redirect_uris: ['https://chatgpt.com/connector/oauth/test_connector-123'], client_secret: 'client-secret-nao-imprimir'},
    writes: 0, userReads: 0, sgpsReads: 0, clientReads: 0
  };
  const requests = [], logs = [];
  const fetchImpl = async (url, init) => {
    const target = new URL(url), route = target.pathname, method = init.method || 'GET';
    const req = {route, method, query: target.searchParams, headers: clone(init.headers), body: init.body && JSON.parse(init.body)};
    requests.push(req);
    assert.equal(target.origin, env.SUPABASE_URL);
    assert.equal(init.redirect, 'error');
    assert.ok(init.signal instanceof AbortSignal);
    const intercepted = hooks.request?.({req, state});
    if (intercepted) return intercepted;
    if (route === '/auth/v1/admin/users' && method === 'GET') return response({users: [clone(state.auth)]}, 200, {'x-total-count': '1'});
    if (route === '/auth/v1/admin/oauth/clients' && method === 'GET') return response({clients: [clone(state.oauth)]}, 200, {'x-total-count': '1'});
    if (route === '/auth/v1/admin/oauth/clients/' + CLIENT_ID && method === 'GET') {
      state.clientReads++;hooks.clientRead?.(state);return response(clone(state.oauth));
    }
    if (route === '/rest/v1/sgps_store' && method === 'GET') {
      assert.equal(req.query.get('key'), 'eq.usuarios');
      assert.equal(req.query.get('select'), 'value');
      assert.equal(init.headers.apikey, env.SUPABASE_ANON_KEY);
      state.sgpsReads++;hooks.sgpsRead?.(state);return response([{value: clone(state.sgps)}]);
    }
    assert.equal(init.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
    if (route === '/auth/v1/admin/users/' + AUTH_ID && method === 'GET') {
      state.userReads++;hooks.userRead?.(state);return response(clone(state.auth));
    }
    if (route === '/auth/v1/admin/users/' + AUTH_ID && method === 'PUT') {
      state.writes++;
      assert.deepEqual(Object.keys(req.body), ['app_metadata']);
      assert.deepEqual(Object.keys(req.body.app_metadata), ['sombrear_mcp']);
      // GoTrue merges top-level app_metadata; it does not replace the object.
      state.auth.app_metadata = {...state.auth.app_metadata, ...clone(req.body.app_metadata)};
      state.auth.updated_at = '2026-11-04T13:00:00Z';
      hooks.afterWrite?.(state);
      return response(clone(state.auth));
    }
    throw new Error('Unexpected mock route');
  };
  return {state, requests, logs, deps: {env, defaults, fetchImpl, log: line => logs.push(line)}};
}

function assertPrivate(f) {
  const output = f.logs.join('\n');
  for (const hidden of ['metadata-nao-imprimir', 'senha-nao-imprimir', 'hash-nao-imprimir', 'client-secret-nao-imprimir', 'Nome privado', env.SUPABASE_SERVICE_ROLE_KEY, env.SUPABASE_ANON_KEY]) assert.equal(output.includes(hidden), false);
}

test('sem argumentos lista clientes somente leitura e nunca retorna client_secret', async () => {
  const f = fixture(), result = await run([], f.deps);
  assert.equal(result.mode, 'read-only');
  assert.deepEqual(result.clients, [{client_id: CLIENT_ID, client_name: 'ChatGPT Sombrear', redirect_uris: f.state.oauth.redirect_uris}]);
  assert.ok(f.requests.every(r => r.method === 'GET'));
  assert.equal(f.requests.length, 1);assertPrivate(f);
});

test('paginação lista todos os clientes, inclusive páginas menores que per_page', async () => {
  const f = fixture({request({req, state}) {
    if (req.route === '/auth/v1/admin/oauth/clients') {
      const page = Number(req.query.get('page'));
      return response({clients: [{...state.oauth, client_id: page === 1 ? CLIENT_ID : OTHER_ID}]}, 200, {'x-total-count': '2'});
    }
  }});
  const result = await run(['--list-clients'], f.deps);
  assert.equal(result.clients.length, 2);assert.equal(f.requests.length, 2);assertPrivate(f);
});

test('listagem OAuth vazia aceita campo clients omitido, sem aceitar outras respostas inválidas', async () => {
  const empty = fixture({request({req}) {
    if (req.route === '/auth/v1/admin/oauth/clients') return response({});
  }});
  const result = await run(['--list-clients'], empty.deps);
  assert.deepEqual(result.clients, []);
  assert.equal(empty.state.writes, 0);assert.equal(empty.requests.length, 1);assertPrivate(empty);
  for (const data of [{unexpected: true}, {clients: null}, {clients: {}}]) {
    const invalid = fixture({request({req}) {
      if (req.route === '/auth/v1/admin/oauth/clients') return response(data);
    }});
    await assert.rejects(run(['--list-clients'], invalid.deps), /listagem inválida/);
    assert.equal(invalid.state.writes, 0);
  }
  const users = fixture({request({req}) {
    if (req.route === '/auth/v1/admin/users') return response({});
  }});
  await assert.rejects(run(grantArgs, users.deps), /listagem inválida/);
  assert.equal(users.state.writes, 0);
});

test('OAuth Server desabilitado produz instrução clara sem ecoar resposta ou chave', async () => {
  const f = fixture({request() {return response({code: 'oauth_server_disabled', msg: 'server disabled ' + env.SUPABASE_SERVICE_ROLE_KEY}, 400);}});
  await assert.rejects(run(['--list-clients'], f.deps), error => {
    assert.match(error.message, /OAuth.*desabilitado/);assert.match(error.message, /Authentication/);
    assert.equal(error.message.includes(env.SUPABASE_SERVICE_ROLE_KEY), false);return true;
  });
  assertPrivate(f);
});

test('dry-run valida usuário Auth, usuário SGPS e callback sem qualquer escrita', async () => {
  const f = fixture(), initial = clone(f.state.auth), result = await run(grantArgs, f.deps);
  assert.equal(result.mode, 'dry-run');assert.equal(result.auth_user_id, AUTH_ID);
  assert.deepEqual(result.app_metadata.sombrear_mcp, {enabled: true, usuario_id: 'u1', nome: 'Operador DF', role: 'filial', filial_id: 'df', gerenciar_todas_filiais: false, client_ids: [CLIENT_ID], resource_url: RESOURCE});
  assert.deepEqual(f.state.auth, initial);assert.equal(f.state.writes, 0);
  assert.ok(f.requests.every(r => r.method === 'GET'));assertPrivate(f);
});

test('apply concede todas as filiais explicitamente e preserva perfil Auth, senha e metadados alheios', async () => {
  const f = fixture(), initial = clone(f.state.auth);
  const args = [...grantArgs.slice(0, -1), '--all-filiais', '--apply'];
  const result = await run(args, {...f.deps, env: {...env, MCP_RESOURCE_URL: 'https://other.example.invalid/api/mcp'}});
  const grant = f.state.auth.app_metadata.sombrear_mcp;
  assert.equal(result.verified, true);assert.equal(f.state.writes, 1);assert.equal(f.state.userReads, 3);
  assert.equal(grant.role, 'sede');assert.equal(grant.filial_id, null);assert.equal(grant.gerenciar_todas_filiais, true);
  assert.equal(grant.resource_url, 'https://other.example.invalid/api/mcp');
  for (const key of Object.keys(initial.app_metadata)) assert.deepEqual(f.state.auth.app_metadata[key], initial.app_metadata[key]);
  assert.deepEqual(f.state.auth.user_metadata, initial.user_metadata);
  assert.equal(f.state.auth.encrypted_password, initial.encrypted_password);assert.equal(f.state.auth.email, initial.email);
  assert.equal(f.state.sgps[0].role, 'filial');assertPrivate(f);
});

test('perfil atual da sede não concede operação como filial implicitamente', async () => {
  const f = fixture();f.state.sgps[0].role = 'sede';
  const result = await run([...grantArgs, '--apply'], f.deps);
  assert.equal(result.app_metadata.sombrear_mcp.role, 'sede');
  assert.equal(result.app_metadata.sombrear_mcp.gerenciar_todas_filiais, false);
  assert.equal(result.app_metadata.sombrear_mcp.filial_id, null);
});

test('rejeita identidades Auth inexistentes ou duplicadas em páginas diferentes', async () => {
  for (const duplicate of [false, true]) {
    const f = fixture({request({req, state}) {
      if (req.route !== '/auth/v1/admin/users') return;
      if (!duplicate) return response({users: []}, 200, {'x-total-count': '0'});
      const page = Number(req.query.get('page'));
      return response({users: [{...state.auth, id: page === 1 ? AUTH_ID : OTHER_ID}]}, 200, {'x-total-count': '2'});
    }});
    await assert.rejects(run([...grantArgs, '--apply'], f.deps), duplicate ? /Mais de uma conta Auth/ : /Não existe conta/);
    assert.equal(f.state.writes, 0);
  }
});

test('rejeita usuário SGPS inativo, ausente, duplicado ou com filial inválida', async () => {
  for (const edit of [f => {f.state.sgps[0].ativo = false;}, f => {delete f.state.sgps[0].ativo;}, f => {f.state.sgps = [];}, f => {f.state.sgps.push(clone(f.state.sgps[0]));}, f => {f.state.sgps[0].filial_id = '';}, f => {f.state.sgps[0].role = 'admin';}]) {
    const f = fixture();edit(f);
    await assert.rejects(run([...grantArgs, '--apply'], f.deps), /SGPS/);assert.equal(f.state.writes, 0);
  }
});

test('somente callbacks exatos do ChatGPT são aceitos, sem curingas nem destinos adicionais inseguros', async () => {
  const valid = ['https://chatgpt.com/connector/oauth/connector_123-abc', 'https://chatgpt.com/connector_platform_oauth_redirect'];
  for (const uri of valid) assert.equal(validRedirect(uri), true);
  const invalid = ['https://chatgpt.com', 'https://chatgpt.com/', 'https://chatgpt.com/connector/oauth/', 'https://chatgpt.com/connector/oauth/*', 'https://chatgpt.com/connector/oauth/%2e%2e', 'https://chatgpt.com/connector/oauth/abc/../xyz', 'https://chatgpt.com/connector/oauth/abc/more', 'https://chatgpt.com/connector/oauth/abc?next=evil', 'https://chatgpt.com/connector/oauth/abc#token', 'http://chatgpt.com/connector/oauth/abc', 'https://sub.chatgpt.com/connector/oauth/abc', 'https://chatgpt.com.evil.invalid/connector/oauth/abc', 'https://user@chatgpt.com/connector/oauth/abc', 'https://chatgpt.com:443/connector/oauth/abc', 'https://chatgpt.com/connector_platform_oauth_redirect/', 'https://chatgpt.com/connector/oauth/abc\n'];
  for (const uri of invalid) {
    assert.equal(validRedirect(uri), false, uri);
    const f = fixture();f.state.oauth.redirect_uris = [valid[0], uri];
    await assert.rejects(run([...grantArgs, '--apply'], f.deps), /callbacks HTTPS exatos/);
    assert.equal(f.state.writes, 0);
  }
});

test('releitura detecta mudança Auth e aborta sem regravar metadados', async () => {
  const f = fixture({userRead(state) {if (state.userReads === 2) state.auth.app_metadata.concurrent = 'alterado';}});
  await assert.rejects(run([...grantArgs, '--apply'], f.deps), /conta Auth foi alterada/);
  assert.equal(f.state.writes, 0);assert.equal(f.state.auth.app_metadata.concurrent, 'alterado');
  assert.equal(f.state.auth.app_metadata.sombrear_mcp, undefined);
});

test('releitura detecta mudança de cadastro SGPS ou de cliente antes da concessão', async () => {
  for (const hooks of [
    {sgpsRead(state) {if (state.sgpsReads === 2) state.sgps[0].nome = 'Outro nome';}},
    {clientRead(state) {if (state.clientReads === 2) state.oauth.client_name = 'Outro aplicativo';}}
  ]) {
    const f = fixture(hooks);
    await assert.rejects(run([...grantArgs, '--apply'], f.deps), /mudou durante/);assert.equal(f.state.writes, 0);
  }
});

test('falha na escrita e divergência na confirmação nunca repetem o PUT automaticamente', async () => {
  const failed = fixture({request({req}) {if (req.method === 'PUT') return response({message: env.SUPABASE_SERVICE_ROLE_KEY}, 503);}});
  await assert.rejects(run([...grantArgs, '--apply'], failed.deps), error => {
    assert.match(error.message, /escrita foi tentada/);assert.equal(error.message.includes(env.SUPABASE_SERVICE_ROLE_KEY), false);return true;
  });
  assert.equal(failed.requests.filter(r => r.method === 'PUT').length, 1);
  const divergent = fixture({afterWrite(state) {state.auth.app_metadata.sombrear_mcp.enabled = false;}});
  await assert.rejects(run([...grantArgs, '--apply'], divergent.deps), /releitura não confirmou/);
  assert.equal(divergent.state.writes, 1);
});

test('revoke mantém concessão e metadados, altera somente enabled e omite campos privados do plano', async () => {
  const f = fixture();
  const existing = {enabled: true, usuario_id: 'u1', role: 'sede', client_ids: [CLIENT_ID], resource_url: RESOURCE, extension_private: 'metadata-nao-imprimir'};
  f.state.auth.app_metadata.sombrear_mcp = clone(existing);
  const dry = await run(['--revoke', '--email', 'operador@example.invalid'], f.deps);
  assert.equal(dry.app_metadata.sombrear_mcp.enabled, false);assert.equal(f.state.writes, 0);
  const result = await run(['--revoke', '--email', 'operador@example.invalid', '--apply'], f.deps);
  assert.equal(result.verified, true);assert.deepEqual(f.state.auth.app_metadata.sombrear_mcp, {...existing, enabled: false});
  assert.equal(f.requests.some(r => r.route === '/rest/v1/sgps_store'), false);assert.equal(f.state.clientReads, 0);
  assertPrivate(f);
});

test('opções ambíguas e credenciais trocadas falham antes de chamar a rede', async () => {
  const f = fixture();
  const badArgs = [
    [...grantArgs, '--all-filiais'], grantArgs.slice(0, -1), [...grantArgs, '--apply', '--dry-run'],
    ['--list-clients', '--apply'], [...grantArgs, '--list-clients'], [...grantArgs, '--client-id', CLIENT_ID],
    ['--email', 'operador@example.invalid', '--usuario-id', 'u1', '--client-id', '*', '--perfil-atual']
  ];
  for (const args of badArgs) await assert.rejects(run(args, f.deps));
  for (const badEnv of [{...env, SUPABASE_SERVICE_ROLE_KEY: ''}, {...env, SUPABASE_SERVICE_ROLE_KEY: token('anon')}, {...env, SUPABASE_ANON_KEY: token('service_role')}, {...env, SUPABASE_URL: 'https://user:pass@example.invalid'}, {...env, MCP_RESOURCE_URL: 'https://example.invalid/api/mcp?secret=abc'}]) {
    await assert.rejects(run(grantArgs, {...f.deps, env: badEnv}));
  }
  assert.equal(f.requests.length, 0);
  assert.throws(() => loadConfig({...env, SUPABASE_ANON_KEY: ''}, {...defaults, supabaseUrl: 'https://other.invalid'}), /outro projeto/);
  assert.equal(loadConfig({...env, SUPABASE_ANON_KEY: ''}, defaults).anonKey, env.SUPABASE_ANON_KEY);
  assert.equal(parseArgs(['--help']).help, true);
});
