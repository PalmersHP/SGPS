#!/usr/bin/env node
'use strict';

// Administrative tool; never bundle this file or the service key in the web app.
// Endpoints: supabase-js/packages/core/auth-js/src/GoTrueAdminApi.ts.
// Auth merges top-level app_metadata keys (auth/internal/models/user.go).
const {isDeepStrictEqual: same} = require('node:util');
const publicConfig = require('../sombrear.config.cjs');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const emailKey = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

function parseArgs(argv) {
  const result = {apply: false, list: false, revoke: false};
  const flags = new Set();
  const values = {'--email': 'email', '--usuario-id': 'usuarioId', '--client-id': 'clientId'};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (flags.has(arg)) throw new Error('Há uma opção repetida. Use --help.');
    flags.add(arg);
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--apply') result.apply = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--list-clients') result.list = true;
    else if (arg === '--revoke') result.revoke = true;
    else if (arg === '--all-filiais') result.allFiliais = true;
    else if (arg === '--perfil-atual') result.perfilAtual = true;
    else if (values[arg]) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('Uma opção está sem valor. Use --help.');
      result[values[arg]] = argv[++i].trim();
    } else throw new Error('Argumento desconhecido. Use --help.');
  }
  if (result.help) return result;
  if (!argv.length || (argv.length === 1 && result.dryRun)) result.list = true;
  if (result.apply && result.dryRun) throw new Error('--apply e --dry-run não podem ser usados juntos.');
  if (result.list) {
    if (result.apply || result.revoke || result.email || result.usuarioId || result.clientId || result.allFiliais || result.perfilAtual) {
      throw new Error('--list-clients é somente leitura e não pode ser combinado com uma concessão ou revogação.');
    }
    return result;
  }
  if (!result.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) throw new Error('Informe --email de uma conta Supabase Auth já existente.');
  result.email = emailKey(result.email);
  if (result.revoke) {
    if (result.usuarioId || result.clientId || result.allFiliais || result.perfilAtual) throw new Error('--revoke aceita somente --email e, opcionalmente, --apply.');
    return result;
  }
  if (!result.usuarioId || !result.clientId) throw new Error('A concessão exige --usuario-id e --client-id.');
  if (!UUID.test(result.clientId)) throw new Error('--client-id deve ser o UUID exato do cliente OAuth.');
  result.clientId = result.clientId.toLowerCase();
  if (!!result.allFiliais === !!result.perfilAtual) throw new Error('Escolha exatamente uma opção: --all-filiais ou --perfil-atual.');
  return result;
}

function loadConfig(env = process.env, defaults = publicConfig) {
  const url = env.SUPABASE_URL, serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do processo administrativo.');
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error('SUPABASE_URL inválida.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if ((parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error('SUPABASE_URL deve ser a origem HTTPS do projeto, sem caminho, credenciais ou parâmetros.');
  }
  const normalizedUrl = parsed.origin;
  let serviceRole;
  try { serviceRole = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64url')).role; } catch {}
  if (!/^sb_secret_[A-Za-z0-9_-]+$/.test(serviceKey) && serviceRole !== 'service_role') throw new Error('SUPABASE_SERVICE_ROLE_KEY deve conter uma credencial administrativa válida.');
  if (!env.SUPABASE_ANON_KEY && normalizedUrl !== String(defaults.supabaseUrl || '').replace(/\/$/, '')) {
    throw new Error('Para outro projeto, informe também SUPABASE_ANON_KEY correspondente.');
  }
  const anonKey = env.SUPABASE_ANON_KEY || defaults.supabaseAnonKey;
  let anonRole;
  try { anonRole = JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64url')).role; } catch {}
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(anonKey || '') && anonRole !== 'anon') throw new Error('SUPABASE_ANON_KEY deve conter somente uma chave pública anon ou publishable.');
  const resourceUrl = env.MCP_RESOURCE_URL || defaults.resourceUrl;
  let resource;
  try { resource = new URL(resourceUrl); } catch { throw new Error('Defina a URL do recurso MCP em sombrear.config.cjs ou MCP_RESOURCE_URL.'); }
  if (typeof resourceUrl !== 'string' || resourceUrl.trim() !== resourceUrl || resource.username || resource.password || resource.search || resource.hash || (resource.protocol !== 'https:' && !(resource.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(resource.hostname)))) throw new Error('MCP_RESOURCE_URL deve ser uma URL HTTPS válida, sem credenciais ou parâmetros.');
  return {url: normalizedUrl, serviceKey, anonKey, resourceUrl};
}

function validRedirect(uri) {
  // Check the original text too: URL normalization must not turn a broad or
  // encoded callback, userinfo, port, query or subdomain into an accepted URI.
  return typeof uri === 'string' && /^https:\/\/chatgpt\.com\/(?:connector\/oauth\/[A-Za-z0-9_-]+|connector_platform_oauth_redirect)$/.test(uri);
}

function validateClient(client, expectedId) {
  if (!object(client) || !UUID.test(client.client_id || '') || client.client_id.toLowerCase() !== expectedId) throw new Error('O cliente OAuth retornado não corresponde ao UUID solicitado.');
  if (!Array.isArray(client.redirect_uris) || !client.redirect_uris.length || !client.redirect_uris.every(validRedirect)) {
    throw new Error('O cliente OAuth deve conter somente callbacks HTTPS exatos do ChatGPT: /connector/oauth/<id> ou /connector_platform_oauth_redirect, sem subdomínios, curingas ou parâmetros.');
  }
  return client;
}

function api(config, fetchImpl) {
  async function request(route, {method = 'GET', body, publicRead = false} = {}) {
    const key = publicRead ? config.anonKey : config.serviceKey;
    const headers = {apikey: key, 'Content-Type': 'application/json'};
    if (!key.startsWith('sb_')) headers.Authorization = 'Bearer ' + key;
    let response;
    try {
      response = await fetchImpl(config.url + route, {method, headers, redirect: 'error', signal: AbortSignal.timeout(15000), ...(body === undefined ? {} : {body: JSON.stringify(body)})});
    } catch { throw new Error('Não foi possível comunicar com o Supabase. Nenhuma repetição automática será feita.'); }
    let data;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok) {
      if (route.startsWith('/auth/v1/admin/oauth/') && (response.status === 404 || response.status === 501 || /oauth.*(?:disabled|not.enabled)|(?:disabled|not.enabled).*oauth/i.test(String(data?.code || data?.error_code || '') + ' ' + String(data?.msg || data?.message || data?.error_description || '')))) {
        throw new Error('O servidor OAuth do Supabase está desabilitado ou indisponível. Ative Authentication → OAuth Server no painel e confira o cliente cadastrado.');
      }
      throw new Error('O Supabase recusou a operação administrativa (HTTP ' + response.status + '). Confira a configuração e as permissões.');
    }
    if (data === null) throw new Error('O Supabase retornou uma resposta inválida; operação interrompida.');
    return {data, headers: response.headers};
  }
  async function list(route, field) {
    const result = [], seen = new Set(), perPage = 100;
    for (let page = 1; page <= 10000; page++) {
      const {data, headers} = await request(route + '?page=' + page + '&per_page=' + perPage);
      const items = data[field];
      if (!Array.isArray(items)) throw new Error('Resposta de listagem inválida; nenhuma conta foi alterada.');
      for (const item of items) {
        const id = item?.id || item?.client_id;
        if (typeof id !== 'string' || seen.has(id)) throw new Error('A paginação mudou durante a consulta. Execute novamente para obter uma lista consistente.');
        seen.add(id);result.push(item);
      }
      const link = headers.get('link') || '';
      const next = /;\s*rel\s*=\s*"?next"?/i.test(link);
      const totalHeader = headers.get('x-total-count');
      const total = totalHeader === null ? NaN : Number(totalHeader);
      if (!next && (Number.isFinite(total) ? result.length >= total : items.length < perPage)) return result;
      if (!items.length) throw new Error('A paginação não foi concluída; nenhuma conta foi alterada.');
    }
    throw new Error('A consulta excedeu o limite de páginas; nenhuma conta foi alterada.');
  }
  return {
    request,
    listClients: () => list('/auth/v1/admin/oauth/clients', 'clients'),
    listUsers: () => list('/auth/v1/admin/users', 'users'),
    getClient: async id => validateClient((await request('/auth/v1/admin/oauth/clients/' + id)).data, id),
    getUser: async id => (await request('/auth/v1/admin/users/' + id)).data,
    getSgpsUser: async id => {
      const {data} = await request('/rest/v1/sgps_store?key=eq.usuarios&select=value', {publicRead: true});
      if (!Array.isArray(data) || data.length !== 1 || !Array.isArray(data[0].value)) throw new Error('O cadastro de usuários SGPS não está disponível.');
      const matches = data[0].value.filter(user => user.id === id);
      if (matches.length !== 1) throw new Error('O --usuario-id não identifica exatamente um usuário SGPS.');
      const user = matches[0];
      if (user.ativo !== true) throw new Error('O usuário SGPS precisa estar ativo para receber a concessão.');
      if (!['sede', 'filial'].includes(user.role) || (user.role === 'filial' && (typeof user.filial_id !== 'string' || !user.filial_id.trim())) || typeof user.nome !== 'string' || !user.nome.trim()) throw new Error('O usuário SGPS tem nome, perfil ou filial inválidos. Corrija o cadastro antes da concessão.');
      // Discard unrelated private account fields immediately.
      return {id: user.id, nome: user.nome, role: user.role, filial_id: user.role === 'filial' ? user.filial_id : null};
    }
  };
}

function authSnapshot(user) {
  return {id: user.id, email: emailKey(user.email), updated_at: user.updated_at || null, app_metadata: user.app_metadata || {}};
}

function safeGrant(grant) {
  const result = {enabled: grant.enabled === true};
  for (const key of ['usuario_id', 'nome', 'role', 'filial_id', 'resource_url']) if (typeof grant[key] === 'string' || grant[key] === null) result[key] = grant[key];
  if (typeof grant.gerenciar_todas_filiais === 'boolean') result.gerenciar_todas_filiais = grant.gerenciar_todas_filiais;
  if (Array.isArray(grant.client_ids)) result.client_ids = grant.client_ids.filter(id => typeof id === 'string' && UUID.test(id));
  return result;
}

const HELP = `Configurar acesso OAuth ao MCP Sombrear (dry-run por padrão).

  node scripts/configurar-mcp.cjs --list-clients
  node scripts/configurar-mcp.cjs --email pessoa@exemplo.com --usuario-id u1 --client-id UUID --perfil-atual
  node scripts/configurar-mcp.cjs --email pessoa@exemplo.com --usuario-id u1 --client-id UUID --all-filiais --apply
  node scripts/configurar-mcp.cjs --revoke --email pessoa@exemplo.com [--apply]

Ambiente: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY obrigatórios.
SUPABASE_ANON_KEY pode vir de sombrear.config.cjs para o mesmo projeto.
MCP_RESOURCE_URL pode substituir resourceUrl da configuração pública; deve ser idêntica à URL configurada no servidor MCP.
O arquivo .env não é carregado pelo script. Nunca coloque a chave administrativa em argumentos, logs ou arquivos públicos.
--all-filiais concede operação de sede e das filiais ao MCP; --perfil-atual mantém o escopo do cadastro SGPS.
Somente --apply altera app_metadata.sombrear_mcp de uma conta Auth existente.
E-mail, senha, user_metadata e demais app_metadata são preservados. Nenhuma mensagem é enviada.
A API Auth Admin não oferece CAS: a releitura detecta alterações anteriores à escrita, mas não elimina a janela concorrente entre GET e PUT.\n`;

async function run(argv = process.argv.slice(2), {env = process.env, defaults = publicConfig, fetchImpl = fetch, log = console.log} = {}) {
  const options = parseArgs(argv);
  if (options.help) { log(HELP);return {mode: 'help'}; }
  const config = loadConfig(env, defaults), client = api(config, fetchImpl);
  if (options.list) {
    // Never spread a client response: it may include client_secret.
    const clients = (await client.listClients()).map(item => ({client_id: item.client_id, client_name: typeof item.client_name === 'string' ? item.client_name : '', redirect_uris: Array.isArray(item.redirect_uris) ? item.redirect_uris.filter(uri => typeof uri === 'string') : []}));
    const result = {mode: 'read-only', clients};log(JSON.stringify(result, null, 2));return result;
  }
  const matches = (await client.listUsers()).filter(user => emailKey(user.email) === options.email);
  if (matches.length !== 1) throw new Error(matches.length ? 'Mais de uma conta Auth corresponde ao e-mail. Resolva a duplicidade antes de continuar.' : 'Não existe conta Supabase Auth com esse e-mail. O script não cria contas nem envia convites.');
  if (!UUID.test(matches[0].id || '')) throw new Error('A conta Auth retornou um identificador inválido.');
  const auth = await client.getUser(matches[0].id);
  if (auth.id !== matches[0].id || emailKey(auth.email) !== options.email || !object(auth.app_metadata || {})) throw new Error('A conta Auth mudou durante a consulta ou contém metadados inválidos. Execute novamente.');
  const snapshot = authSnapshot(auth);
  let grant, sgps, oauth;
  if (options.revoke) {
    const current = auth.app_metadata?.sombrear_mcp;
    if (current !== undefined && !object(current)) throw new Error('A concessão existente não é um objeto válido. Revise os metadados no painel.');
    grant = {...current, enabled: false};
  } else {
    sgps = await client.getSgpsUser(options.usuarioId);
    oauth = await client.getClient(options.clientId);
    grant = {enabled: true, usuario_id: sgps.id, nome: sgps.nome, role: options.allFiliais ? 'sede' : sgps.role, filial_id: options.allFiliais ? null : sgps.filial_id, gerenciar_todas_filiais: !!options.allFiliais, client_ids: [options.clientId], resource_url: config.resourceUrl};
  }
  const plan = {mode: options.apply ? 'apply' : 'dry-run', action: options.revoke ? 'revoke' : 'grant', auth_user_id: auth.id, email: options.email, app_metadata: {sombrear_mcp: safeGrant(grant)}};
  log(JSON.stringify(plan, null, 2));
  if (!options.apply) return plan;
  // Recheck permissions and OAuth registration before the final Auth snapshot.
  if (!options.revoke && (!same(sgps, await client.getSgpsUser(options.usuarioId)) || !same(oauth, await client.getClient(options.clientId)))) throw new Error('O cadastro SGPS ou o cliente OAuth mudou durante a operação. Nada foi gravado; revise um novo dry-run.');
  const fresh = await client.getUser(auth.id);
  if (!same(snapshot, authSnapshot(fresh))) throw new Error('A conta Auth foi alterada desde a leitura inicial. Nada foi gravado; revise um novo dry-run.');
  // Auth merges these top-level keys. Sending only sombrear_mcp avoids rewriting
  // unrelated metadata. There is no CAS in this API; never retry a failed PUT.
  try {
    await client.request('/auth/v1/admin/users/' + auth.id, {method: 'PUT', body: {app_metadata: {sombrear_mcp: grant}}});
    const saved = await client.getUser(auth.id);
    const expectedMetadata = {...fresh.app_metadata, sombrear_mcp: grant};
    if (saved.id !== auth.id || emailKey(saved.email) !== options.email || !same(saved.app_metadata, expectedMetadata)) throw new Error('A releitura não confirmou os metadados esperados.');
  } catch (error) {
    throw new Error('A escrita foi tentada. Confira o estado atual no Auth antes de repetir; o resultado pode ser parcial. ' + error.message);
  }
  log('Concessão MCP ' + (options.revoke ? 'revogada' : 'aplicada') + ' e confirmada por releitura.');
  return {...plan, verified: true};
}

module.exports = {run, parseArgs, loadConfig, validRedirect, validateClient};
if (require.main === module) run().catch(error => {console.error(error.message);process.exitCode = 1;});
