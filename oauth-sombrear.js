(function () {
  'use strict';

  var client = null;
  var config = null;
  var authorizationId = '';
  var signedUser = null;
  var authorization = null;
  var previousRedirect = null;
  var busy = false;
  var stage = 'loading';
  var retryAction = null;
  var panels = ['loadingPanel', 'loginPanel', 'consentPanel', 'existingPanel', 'completePanel'];
  var scopeLabels = {
    openid: 'Identificar sua conta.',
    email: 'Acessar o endereço de e-mail da sua conta.',
    profile: 'Acessar as informações básicas do seu perfil.',
    offline_access: 'Manter a conexão autorizada quando você não estiver nesta página.'
  };

  function el(id) { return document.getElementById(id); }
  function text(id, value) { el(id).textContent = value == null ? '' : String(value); }
  function show(panel, title, intro) {
    panels.forEach(function (id) { el(id).hidden = id !== panel; });
    if (title) text('pageTitle', title);
    if (intro !== undefined) text('pageIntro', intro);
    var loggedIn = !!signedUser;
    el('stepLogin').toggleAttribute('aria-current', !loggedIn);
    el('stepConsent').toggleAttribute('aria-current', loggedIn);
    if (loggedIn) el('stepConsent').setAttribute('aria-current', 'step');
    else el('stepLogin').setAttribute('aria-current', 'step');
  }
  function setBusy(value, message) {
    busy = value;
    el('oauthCard').setAttribute('aria-busy', String(value));
    document.querySelectorAll('button, #loginForm input').forEach(function (control) { control.disabled = value; });
    if (message) text('loadingText', message);
    text('loginButton', value && stage === 'login' ? 'Entrando…' : 'Entrar para continuar');
  }
  function clearError() {
    text('oauthError', '');
    el('oauthError').hidden = true;
    el('retryButton').hidden = true;
    retryAction = null;
  }
  function explainError(error) {
    var code = String(error && error.code || '');
    var message = String(error && error.message || '');
    if (/oauth.*(?:disabled|not.enabled)|(?:disabled|not.enabled).*oauth/i.test(code + ' ' + message)) {
      return 'A conexão OAuth ainda não está habilitada. Peça ao administrador Sombrear para ativar o servidor OAuth no Supabase e configurar esta página de autorização.';
    }
    if (code === 'invalid_credentials' || /invalid.login.credentials/i.test(message)) return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
    if (code === 'email_not_confirmed' || /email.not.confirmed/i.test(message)) return 'Seu e-mail ainda precisa ser confirmado. Peça ao administrador Sombrear para verificar sua conta.';
    if (error && error.status === 429 || /rate.limit|too.many/i.test(code + ' ' + message)) return 'Houve muitas tentativas. Aguarde alguns instantes e tente novamente.';
    if (/authorization.*(?:expired|not.found)|(?:expired|not.found).*authorization/i.test(code + ' ' + message)) return 'Esta solicitação expirou ou não está disponível. Inicie a conexão novamente no aplicativo.';
    if (code === 'session_not_found' || code === 'session_expired') return 'Sua sessão expirou. Entre novamente para revisar o acesso.';
    if (/fetch|network|connection/i.test(message)) return 'Não foi possível acessar o serviço. Verifique sua conexão e tente novamente.';
    return message || 'Não foi possível concluir a conexão. Tente novamente.';
  }
  function showError(error, retry) {
    text('oauthError', explainError(error));
    el('oauthError').hidden = false;
    retryAction = retry || null;
    el('retryButton').hidden = !retryAction;
  }
  function isLoopback(host) { return ['localhost', '127.0.0.1', '[::1]'].indexOf(host) !== -1; }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/.test(value)) throw new Error('O serviço retornou um endereço de conexão inválido. Peça ao administrador para revisar a configuração.');
    var url;
    try { url = new URL(value); } catch (_) { throw new Error('O serviço retornou um endereço de conexão inválido.'); }
    var localDevelopment = isLoopback(window.location.hostname) && isLoopback(url.hostname) && url.protocol === 'http:';
    if ((url.protocol !== 'https:' && !localDevelopment) || url.username || url.password) throw new Error('O endereço de retorno precisa usar HTTPS. Peça ao administrador para revisar a configuração do aplicativo.');
    return url;
  }
  function publicKey(value) {
    if (typeof value !== 'string' || !value) return false;
    if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
    try {
      var parts = value.split('.');
      if (parts.length !== 3) return false;
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      payload += '='.repeat((4 - payload.length % 4) % 4);
      return JSON.parse(atob(payload)).role === 'anon';
    } catch (_) { return false; }
  }
  function createAuthClient() {
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'sombrear-oauth-consent-memory' }
    });
  }
  async function initialize() {
    if (busy) return;
    clearError();
    stage = 'loading';
    setBusy(true, 'Preparando a conexão…');
    show('loadingPanel');
    try {
      var ids = new URLSearchParams(window.location.search).getAll('authorization_id');
      if (ids.length !== 1 || !/^[A-Za-z0-9_-]{1,256}$/.test(ids[0])) throw new Error('Esta página precisa de uma solicitação de autorização válida. Inicie a conexão pelo aplicativo que deseja acessar a Sombrear.');
      authorizationId = ids[0];
      if (!window.supabase || typeof window.supabase.createClient !== 'function') throw new Error('Não foi possível carregar o serviço de autenticação. Recarregue esta página e tente novamente.');
      var response = await fetch('/api/mcp-config', { method: 'GET', cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('A conexão Sombrear ainda não está disponível. Peça ao administrador para verificar a configuração do serviço.');
      var received = await response.json();
      if (!received || !publicKey(received.supabaseAnonKey)) throw new Error('A configuração pública da conexão está incompleta. Peça ao administrador Sombrear para revisá-la.');
      var supabaseUrl = safeUrl(received.supabaseUrl);
      if (supabaseUrl.search || supabaseUrl.hash) throw new Error('O endereço de autenticação está configurado incorretamente. Contate o administrador Sombrear.');
      safeUrl(received.resourceUrl);
      config = { supabaseUrl: supabaseUrl.href.replace(/\/$/, ''), supabaseAnonKey: received.supabaseAnonKey, resourceUrl: received.resourceUrl };
      client = createAuthClient();
      if (!client.auth.oauth || typeof client.auth.oauth.getAuthorizationDetails !== 'function') throw new Error('O serviço de autorização está indisponível. Peça ao administrador para atualizar a configuração OAuth.');
      stage = 'login';
      show('loginPanel', 'Entre na sua conta', 'Depois de entrar, você poderá revisar e decidir sobre o acesso do aplicativo.');
    } catch (error) {
      show(null, 'Conexão indisponível', 'A solicitação não pôde ser preparada.');
      showError(error, authorizationId ? initialize : null);
    } finally { setBusy(false); }
  }
  async function loadAuthorization() {
    stage = 'details';
    show('loadingPanel', 'Revise a conexão', 'Consultando o aplicativo que solicitou acesso.');
    text('loadingText', 'Carregando a solicitação…');
    var result = await client.auth.oauth.getAuthorizationDetails(authorizationId);
    if (result.error) throw result.error;
    var data = result.data;
    if (!data || typeof data !== 'object') throw new Error('A solicitação de acesso não foi encontrada. Inicie a conexão novamente no aplicativo.');
    if (!data.authorization_id && data.redirect_url) {
      previousRedirect = safeUrl(data.redirect_url).href;
      authorization = null;
      stage = 'existing';
      text('existingHost', new URL(previousRedirect).host);
      show('existingPanel', 'Conexão já autorizada', 'Escolha se deseja voltar ao aplicativo para continuar.');
      return;
    }
    if (data.authorization_id !== authorizationId || !data.client || !data.client.name || !data.user || data.user.id !== signedUser.id) throw new Error('Os dados desta autorização não correspondem à conta conectada. Inicie a conexão novamente no aplicativo.');
    safeUrl(data.redirect_uri);
    authorization = data;
    previousRedirect = null;
    text('accountEmail', signedUser.email || data.user.email);
    text('clientName', data.client.name);
    text('clientUri', data.client.uri || 'Site do aplicativo não informado.');
    text('clientId', data.client.id || 'Não informado');
    text('redirectUri', data.redirect_uri);
    text('resourceUri', config.resourceUrl);
    var scopes = Array.from(new Set(String(data.scope || '').split(/\s+/).filter(Boolean)));
    var list = el('scopeList');
    list.replaceChildren();
    scopes.forEach(function (scope) {
      var item = document.createElement('li');
      var code = document.createElement('code');
      code.textContent = scope;
      item.appendChild(document.createTextNode((scopeLabels[scope] || 'Permissão solicitada pelo aplicativo.') + ' '));
      item.appendChild(code);
      list.appendChild(item);
    });
    el('scopeHeading').hidden = !scopes.length;
    list.hidden = !scopes.length;
    stage = 'consent';
    show('consentPanel', 'Autorizar este aplicativo?', 'Confira quem está solicitando acesso e as permissões abaixo.');
  }
  async function login(event) {
    event.preventDefault();
    if (busy || !client || stage !== 'login' || !el('loginForm').reportValidity()) return;
    clearError();
    setBusy(true);
    try {
      var result = await client.auth.signInWithPassword({ email: el('oauthEmail').value.trim(), password: el('oauthPassword').value });
      text('completeMessage', '');
      el('oauthPassword').value = '';
      if (result.error) throw result.error;
      if (!result.data || !result.data.session || !result.data.user) throw new Error('Não foi possível iniciar a sessão. Peça ao administrador Sombrear para verificar sua conta.');
      signedUser = result.data.user;
      await loadAuthorization();
    } catch (error) {
      el('oauthPassword').value = '';
      if (signedUser) { show(null, 'Não foi possível revisar o acesso', 'Tente carregar a solicitação novamente.'); showError(error, retryDetails); }
      else { stage = 'login'; show('loginPanel'); showError(error); }
    } finally { setBusy(false); }
  }
  async function retryDetails() {
    if (busy || !client || !signedUser) return;
    clearError(); setBusy(true);
    try { await loadAuthorization(); }
    catch (error) { show(null, 'Não foi possível revisar o acesso', 'Tente novamente ou reinicie a conexão no aplicativo.'); showError(error, retryDetails); }
    finally { setBusy(false); }
  }
  function redirect(value) {
    var target = safeUrl(value);
    stage = 'complete';
    show('completePanel', 'Voltando ao aplicativo', 'Sua decisão foi registrada.');
    text('completeMessage', 'Aguarde o retorno ao aplicativo para concluir esta etapa.');
    window.location.assign(target.href);
  }
  async function decide(approve) {
    if (busy || stage !== 'consent' || !authorization) return;
    clearError(); setBusy(true);
    try {
      var result = approve
        ? await client.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
        : await client.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
      if (result.error) throw result.error;
      if (!result.data || !result.data.redirect_url) throw new Error('O serviço não retornou o endereço do aplicativo. Reinicie a conexão para conferir o resultado.');
      redirect(result.data.redirect_url);
    } catch (error) { showError(error); }
    finally { if (stage !== 'complete') setBusy(false); }
  }
  async function switchAccount() {
    if (busy) return;
    clearError(); setBusy(true);
    try {
      await client.auth.signOut({ scope: 'local' });
      client = createAuthClient();
      signedUser = null; authorization = null; previousRedirect = null;
      stage = 'login';
      el('oauthPassword').value = '';
      show('loginPanel', 'Entre na sua conta', 'Use a conta com a qual deseja autorizar esta conexão.');
      el('oauthEmail').focus();
    } catch (error) { showError(error); }
    finally { setBusy(false); }
  }
  el('loginForm').addEventListener('submit', login);
  el('approveButton').addEventListener('click', function () { decide(true); });
  el('denyButton').addEventListener('click', function () { decide(false); });
  el('switchAccountButton').addEventListener('click', switchAccount);
  el('retryButton').addEventListener('click', function () { if (!busy && retryAction) retryAction(); });
  el('continueButton').addEventListener('click', function () {
    if (busy || stage !== 'existing' || !previousRedirect) return;
    clearError();
    try { setBusy(true); redirect(previousRedirect); } catch (error) { setBusy(false); showError(error); }
  });
  el('stopButton').addEventListener('click', function () {
    if (busy) return;
    previousRedirect = null; stage = 'complete';
    show('completePanel', 'Retorno interrompido', 'Você pode fechar esta página.');
    text('completeMessage', 'O aplicativo não recebeu o retorno desta tentativa. Uma autorização concedida anteriormente continua válida.');
  });
  initialize();
})();
