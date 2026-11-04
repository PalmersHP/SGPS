'use strict';
const defaults = require('../sombrear.config.cjs');
function config(env = process.env) {
  const result = {
    supabaseUrl: env.SUPABASE_URL || defaults.supabaseUrl,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || defaults.supabaseAnonKey,
    resourceUrl: env.MCP_RESOURCE_URL || defaults.resourceUrl
  };
  let role;
  try { role = JSON.parse(Buffer.from(result.supabaseAnonKey.split('.')[1], 'base64url')).role; } catch {}
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(result.supabaseAnonKey) && role !== 'anon') {
    throw new Error('A configuração pública aceita somente chave anon ou publishable.');
  }
  for (const field of ['supabaseUrl', 'resourceUrl']) {
    const url = new URL(result[field]);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) || url.username || url.password || url.search || url.hash) {
      throw new Error('Use endereços HTTPS válidos na configuração MCP.');
    }
  }
  return result;
}
module.exports = { config };
