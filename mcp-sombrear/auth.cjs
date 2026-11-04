'use strict';

class AuthError extends Error {
  constructor(message, status = 401) { super(message); this.status = status; }
}
function resourceMetadata(config) {
  return {
    resource: config.resourceUrl,
    authorization_servers: [config.supabaseUrl.replace(/\/$/, '') + '/auth/v1'],
    bearer_methods_supported: ['header'],
    resource_name: 'Sombrear — Pedidos e Estoques'
  };
}
function challenge(config) {
  const url = new URL('/.well-known/oauth-protected-resource/api/mcp', config.resourceUrl);
  return 'Bearer resource_metadata="' + url.href + '"';
}
async function authenticate(header, config, fetchImpl = fetch) {
  if (typeof header !== 'string' || !/^Bearer [A-Za-z0-9._~-]+$/i.test(header)) throw new AuthError('Conecte sua conta Sombrear para continuar.');
  const token = header.slice(7);
  let claims;
  try { claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')); }
  catch { throw new AuthError('Credencial inválida. Conecte sua conta novamente.'); }
  // Decoding does not authenticate the token. The Auth server verifies its
  // signature below, and the live administrator-owned app_metadata grants access.
  const issuer = config.supabaseUrl.replace(/\/$/, '') + '/auth/v1';
  if (!claims || typeof claims !== 'object' || Array.isArray(claims) || claims.iss !== issuer || claims.aud !== 'authenticated' || claims.role !== 'authenticated' ||
      typeof claims.sub !== 'string' || !claims.sub || typeof claims.client_id !== 'string' || !claims.client_id ||
      !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) {
    throw new AuthError('Use o acesso OAuth autorizado para este MCP.');
  }
  let response;
  try { response = await fetchImpl(issuer + '/user', { headers: { apikey: config.supabaseAnonKey, Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(10000) }); }
  catch { throw new AuthError('A autenticação está temporariamente indisponível.', 503); }
  if (!response.ok) throw new AuthError(response.status >= 500 ? 'A autenticação está temporariamente indisponível.' : 'A conexão expirou. Entre novamente.', response.status >= 500 ? 503 : 401);
  const user = await response.json();
  const grant = user.app_metadata && user.app_metadata.sombrear_mcp;
  // Supabase OAuth access tokens use aud=authenticated. A resource-specific,
  // administrator-owned grant plus an exact OAuth client allowlist further
  // limits this token to the MCP endpoint it was provisioned for.
  if (user.id !== claims.sub || !grant || grant.enabled !== true || grant.resource_url !== config.resourceUrl || !['sede', 'filial'].includes(grant.role) ||
      typeof grant.usuario_id !== 'string' || !grant.usuario_id ||
      !Array.isArray(grant.client_ids) || !grant.client_ids.includes(claims.client_id) ||
      (grant.role === 'filial' && !grant.filial_id)) {
    throw new AuthError('Esta conta ou aplicativo ainda não está autorizado a operar o Sombrear.', 403);
  }
  return {
    id: grant.usuario_id, auth_id: user.id, nome: String(grant.nome || 'Operador Sombrear'),
    role: grant.role, filial_id: grant.role === 'filial' ? grant.filial_id : null,
    gerenciar_todas_filiais: grant.role === 'sede' && grant.gerenciar_todas_filiais === true,
    oauth_client_id: claims.client_id
  };
}
module.exports = { authenticate, resourceMetadata, challenge, AuthError };
