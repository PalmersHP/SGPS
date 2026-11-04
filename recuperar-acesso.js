(function () {
  'use strict';

  // Capture the link in memory and remove its credentials before loading page resources.
  var fragment = new URLSearchParams(window.location.hash.slice(1));
  var hadFragment = !!window.location.hash;
  if (hadFragment) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  var tokens = null;
  var invalidLink = false;
  if (hadFragment) {
    var types = fragment.getAll('type');
    var access = fragment.getAll('access_token');
    var refresh = fragment.getAll('refresh_token');
    var validToken = function (value) { return typeof value === 'string' && value.length > 0 && value.length <= 16384 && !/[\s\u0000-\u001f\u007f]/.test(value); };
    if (!fragment.has('error') && !fragment.has('error_code') && types.length === 1 && types[0] === 'recovery' && access.length === 1 && refresh.length === 1 && validToken(access[0]) && validToken(refresh[0])) {
      tokens = { access_token: access[0], refresh_token: refresh[0] };
    } else invalidLink = true;
  }
  fragment = null;
  types = null; access = null; refresh = null;
  var client = null;
  var busy = false;
  var stage = 'loading';
  var passwordChanged = false;
  var verifiedUser = null;

  function el(id) { return document.getElementById(id); }
  function text(id, value) { el(id).textContent = value == null ? '' : String(value); }
  function show(panel, title, intro) {
    ['recoveryLoading', 'recoveryRequestPanel', 'passwordPanel', 'recoveryComplete'].forEach(function (id) { el(id).hidden = id !== panel; });
    text('recoveryTitle', title);
    text('recoveryIntro', intro);
  }
  function setBusy(value) {
    busy = value;
    el('recoveryCard').setAttribute('aria-busy', String(value));
    document.querySelectorAll('button, input').forEach(function (control) { control.disabled = value; });
    text('sendRecoveryButton', value && stage === 'request' ? 'Enviando link…' : 'Enviar link de recuperação');
    text('savePasswordButton', value && stage === 'password' ? 'Salvando senha…' : 'Salvar nova senha');
  }
  function clearMessages() {
    text('recoveryError', ''); el('recoveryError').hidden = true;
    text('recoveryNotice', ''); el('recoveryNotice').hidden = true;
  }
  function showError(message) { text('recoveryError', message); el('recoveryError').hidden = false; }
  function isLoopback(host) { return ['localhost', '127.0.0.1', '[::1]'].indexOf(host) !== -1; }
  function safeUrl(value) {
    if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/.test(value)) throw new Error('invalid_config');
    var url = new URL(value);
    var localDevelopment = isLoopback(window.location.hostname) && isLoopback(url.hostname) && url.protocol === 'http:';
    if ((url.protocol !== 'https:' && !localDevelopment) || url.username || url.password || url.search || url.hash) throw new Error('invalid_config');
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
      var data = JSON.parse(atob(payload));
      return !!data && data.role === 'anon';
    } catch (_) { return false; }
  }
  function requestScreen(message) {
    stage = 'request';
    show('recoveryRequestPanel', 'Recuperar acesso', 'Informe seu e-mail para receber um link e definir uma nova senha.');
    if (message) showError(message);
  }
  function isRateLimited(error) {
    return error && (error.status === 429 || /rate.limit|too.many/i.test(String(error.code || '') + ' ' + String(error.message || '')));
  }
  async function initialize() {
    setBusy(true);
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') throw new Error('missing_sdk');
      var response = await fetch('/api/mcp-config', { method: 'GET', cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('missing_config');
      var config = await response.json();
      if (!config || !publicKey(config.supabaseAnonKey)) throw new Error('invalid_config');
      var url = safeUrl(config.supabaseUrl);
      safeUrl(config.resourceUrl);
      client = window.supabase.createClient(url.href.replace(/\/$/, ''), config.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'implicit', storageKey: 'sombrear-password-recovery-memory' }
      });
      if (!tokens) { requestScreen(invalidLink ? 'Este link expirou ou não é válido. Solicite um novo link abaixo.' : ''); return; }
      try {
        var sessionResult = await client.auth.setSession(tokens);
        tokens = null;
        if (sessionResult.error || !sessionResult.data || !sessionResult.data.session || !sessionResult.data.user) throw new Error('invalid_session');
        var userResult = await client.auth.getUser();
        if (userResult.error || !userResult.data || !userResult.data.user || !userResult.data.user.id || !userResult.data.user.email || userResult.data.user.id !== sessionResult.data.user.id) throw new Error('invalid_user');
        verifiedUser = userResult.data.user;
        text('recoveryAccount', verifiedUser.email);
        stage = 'password';
        show('passwordPanel', 'Defina sua nova senha', 'Escolha uma senha para continuar a conexão com o ChatGPT.');
      } catch (_) {
        tokens = null;
        verifiedUser = null;
        requestScreen('Este link expirou ou não pôde ser validado. Solicite um novo link abaixo.');
      }
    } catch (_) {
      tokens = null;
      stage = 'unavailable';
      show(null, 'Recuperação indisponível', 'Não foi possível preparar a recuperação da conta.');
      showError('Recarregue a página e tente novamente. Se o problema continuar, peça ao administrador Sombrear para verificar o serviço.');
    } finally { setBusy(false); }
  }
  async function requestRecovery(event) {
    event.preventDefault();
    if (busy || !client || stage !== 'request') return;
    el('recoveryEmail').value = el('recoveryEmail').value.trim();
    if (!el('recoveryRequestForm').reportValidity()) return;
    clearMessages(); setBusy(true);
    try {
      var result = await client.auth.resetPasswordForEmail(el('recoveryEmail').value);
      if (result.error && !/user_not_found|email_not_found|user_banned/.test(String(result.error.code || ''))) throw result.error;
      text('recoveryNotice', 'Se houver uma conta para este e-mail, você receberá um link para definir uma nova senha. Confira também a caixa de spam.');
      el('recoveryNotice').hidden = false;
    } catch (error) {
      showError(isRateLimited(error) ? 'Aguarde alguns instantes antes de solicitar outro link.' : 'Não foi possível solicitar o link agora. Tente novamente em alguns instantes.');
    } finally { setBusy(false); }
  }
  async function savePassword(event) {
    event.preventDefault();
    if (busy || passwordChanged || !client || !verifiedUser || stage !== 'password') return;
    clearMessages();
    if (!el('passwordForm').reportValidity()) return;
    var password = el('newPassword').value;
    if (password.length < 12) { showError('Use uma senha com pelo menos 12 caracteres.'); return; }
    if (password !== el('confirmPassword').value) { showError('As senhas não coincidem. Digite a mesma senha nos dois campos.'); return; }
    setBusy(true);
    try {
      var result = await client.auth.updateUser({ password: password });
      password = '';
      if (result.error) throw result.error;
      passwordChanged = true;
      el('newPassword').value = ''; el('confirmPassword').value = '';
      stage = 'complete';
      show('recoveryComplete', 'Senha alterada', 'Você já pode usar sua nova senha.');
      text('recoveryCompleteMessage', 'Volte ao ChatGPT, reinicie a conexão com a Sombrear e entre com seu e-mail e a nova senha. Você pode fechar esta página.');
      try {
        var signOutResult = await client.auth.signOut({ scope: 'local' });
        if (signOutResult.error) throw signOutResult.error;
      } catch (_) {
        text('recoveryNotice', 'Sua senha já foi alterada. Não foi possível encerrar esta sessão de recuperação no serviço; feche esta página e reinicie a conexão no ChatGPT.');
        el('recoveryNotice').hidden = false;
      }
      client = null; verifiedUser = null;
    } catch (error) {
      password = '';
      var code = String(error && error.code || '');
      if (code === 'weak_password' || code === 'same_password') showError('Escolha uma senha diferente, com pelo menos 12 caracteres, incluindo letras, números e símbolos.');
      else if (isRateLimited(error)) showError('Aguarde alguns instantes e tente salvar novamente.');
      else if (/session_not_found|session_expired|refresh_token_not_found|refresh_token_already_used|bad_jwt|user_not_found/.test(code) || error && error.status === 401) {
        el('newPassword').value = ''; el('confirmPassword').value = ''; verifiedUser = null;
        requestScreen('Sua sessão de recuperação expirou. Solicite um novo link abaixo.');
      } else showError('Não foi possível salvar a nova senha agora. Tente novamente ou solicite um novo link de recuperação.');
    } finally { setBusy(false); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    el('recoveryRequestForm').addEventListener('submit', requestRecovery);
    el('passwordForm').addEventListener('submit', savePassword);
    initialize();
  }, { once: true });
})();
