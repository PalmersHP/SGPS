'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { authenticate, resourceMetadata, challenge } = require('../mcp-sombrear/auth.cjs');
const config = { supabaseUrl: 'https://project.supabase.co', supabaseAnonKey: 'anon', resourceUrl: 'https://app.example/api/mcp' };
const claims = { iss: config.supabaseUrl + '/auth/v1', aud: 'authenticated', role: 'authenticated', sub: 'auth-user', exp: Math.floor(Date.now()/1000) + 3600, client_id: 'chatgpt-client' };
const token = values => 'Bearer ' + ['header', Buffer.from(JSON.stringify({ ...claims, ...values })).toString('base64url'), 'signature'].join('.');
const grant = { enabled: true, resource_url: config.resourceUrl, usuario_id: 'u1', nome: 'Operador', role: 'sede', gerenciar_todas_filiais: true, client_ids: ['chatgpt-client'] };
const response = (metadata, extras = {}) => async () => ({ ok: true, json: async () => ({ id: 'auth-user', app_metadata: { sombrear_mcp: metadata }, ...extras }) });

test('OAuth verifies token online and derives identity only from live app_metadata', async () => {
  let calls = 0;
  const principal = await authenticate(token(), config, async (url, options) => {
    calls++; assert.equal(url, config.supabaseUrl + '/auth/v1/user');
    assert.equal(options.headers.apikey, 'anon');
    return response(grant, { user_metadata: { role: 'intruder' } })();
  });
  assert.equal(calls, 1); assert.equal(principal.id, 'u1'); assert.equal(principal.role, 'sede'); assert.equal(principal.gerenciar_todas_filiais, true);
});
test('rejects missing, expired, foreign and non-OAuth credentials before access', async () => {
  for (const header of [undefined, 'Bearer broken', 'Bearer h.bnVsbA.s', token({ exp: 1 }), token({ iss: 'https://attacker' }), token({ aud: 'other' }), token({ client_id: undefined }), token({ role: 'service_role' })]) {
    await assert.rejects(authenticate(header, config, () => { throw new Error('Must not call'); }), error => error.status === 401);
  }
});
test('rejects forged signatures, self-assigned permissions and unapproved OAuth clients', async () => {
  await assert.rejects(authenticate(token(), config, async () => ({ ok: false, status: 401 })), error => error.status === 401);
  await assert.rejects(authenticate(token(), config, response(undefined, { user_metadata: { sombrear_mcp: grant } })), error => error.status === 403);
  for (const change of [{ enabled: false }, { resource_url: 'https://another.example/api/mcp' }, { client_ids: ['different-client'] }, { role: 'admin' }, { role: 'filial', filial_id: null }]) {
    await assert.rejects(authenticate(token(), config, response({ ...grant, ...change })), error => error.status === 403);
  }
  await assert.rejects(authenticate(token(), config, response(grant, { id: 'different-user' })), error => error.status === 403);
});
test('revocation uses fresh authorization and branch identity cannot claim administrator', async () => {
  const principal = await authenticate(token(), config, response({ ...grant, role: 'filial', filial_id: 'df', gerenciar_todas_filiais: true }));
  assert.equal(principal.gerenciar_todas_filiais, false); assert.equal(principal.filial_id, 'df');
  await assert.rejects(authenticate(token(), config, response({ ...grant, enabled: false })), error => error.status === 403);
});
test('resource discovery binds the public endpoint to the project issuer', () => {
  assert.equal(resourceMetadata(config).resource, config.resourceUrl);
  assert.deepEqual(resourceMetadata(config).authorization_servers, [config.supabaseUrl + '/auth/v1']);
  assert.match(challenge(config), /https:\/\/app.example\/\.well-known\/oauth-protected-resource\/api\/mcp/);
});
test('public configuration never publishes a privileged Supabase environment key', () => {
  const { config: settings } = require('../mcp-sombrear/config.cjs');
  assert.ok(settings({}).supabaseAnonKey);
  const secret = 'h.' + Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url') + '.s';
  assert.throws(() => settings({ SUPABASE_ANON_KEY: secret }), /somente chave anon/);
  assert.throws(() => settings({ MCP_RESOURCE_URL: 'https://user:password@example.com/mcp' }), /HTTPS válidos/);
});
