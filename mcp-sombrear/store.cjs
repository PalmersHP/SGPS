'use strict';
const Estoque = require('../estoque-core.js');

function createStore({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  const base = supabaseUrl.replace(/\/$/, '') + '/rest/v1/sgps_store';
  const headers = { apikey: supabaseAnonKey, Authorization: 'Bearer ' + supabaseAnonKey };
  async function request(url, options = {}) {
    let response;
    try { response = await fetchImpl(url, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(15000) }); }
    catch { throw new Error('Supabase indisponível. Consulte a operação pelo mesmo operation_id antes de repetir.'); }
    if (!response.ok) throw new Error('Não foi possível acessar os dados do sistema (HTTP ' + response.status + ').');
    return response.json();
  }
  return {
    async read() {
      const query = new URLSearchParams({ select: 'key,value,updated_at', key: 'in.(pastas_estoques,filiais,catalogo,usuarios)' });
      const rows = await request(base + '?' + query);
      const get = key => {
        const row = rows.find(row => row.key === key);
        if (!row || !Array.isArray(row.value)) throw new Error('Base incompleta: ' + key + '. Abra o aplicativo e confira a configuração.');
        return row;
      };
      const canonical = get('pastas_estoques'), filiais = get('filiais').value, catalogo = get('catalogo').value, usuarios = get('usuarios').value;
      if (!canonical.updated_at) throw new Error('A base está sem versão de gravação.');
      return { state: Estoque.fromRecords(canonical.value, filiais, catalogo), version: canonical.updated_at, filiais, catalogo, usuarios };
    },
    async write(state, version) {
      const updatedAt = new Date(Math.max(Date.now(), Date.parse(version) + 1)).toISOString();
      const query = new URLSearchParams({ key: 'eq.pastas_estoques', updated_at: 'eq.' + version, select: 'key,updated_at' });
      const rows = await request(base + '?' + query, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ value: Estoque.toRecords(state), updated_at: updatedAt })
      });
      if (!Array.isArray(rows) || rows.length !== 1) {
        const error = new Error('Os dados foram alterados por outro operador.'); error.code = 'CONFLICT'; throw error;
      }
      return rows[0].updated_at;
    }
  };
}
module.exports = { createStore };
