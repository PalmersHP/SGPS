// Local browser regression: fake Supabase SDK and Auth API; no real emails,
// credentials, sessions or production writes. Requires Chrome and Node 22+.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sombrear-recovery-'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const clone = value => JSON.parse(JSON.stringify(value));
const fakeUser = {id: '11111111-1111-4111-8111-111111111111', email: 'operador@example.invalid'};
const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({sub: fakeUser.id, email: 'nao-confiar-no-token@example.invalid', exp: 4102444800})).toString('base64url') + '.test_signature_only';
const validFragment = '#access_token=' + fakeToken + '&refresh_token=fake_refresh_test_only&expires_in=3600&token_type=bearer&type=recovery';
let base, chrome, socket, timer, sequence = 0, behavior = {}, calls = [];
const pending = new Map(), pageErrors = [], requests = [];
const fakeSdk = `(() => {
  window.__sdkFragment = location.hash;
  window.__sdkStorage = {local: {...localStorage}, session: {...sessionStorage}};
  window.__sdkOptions = [];
  async function call(name, args) {
    const response = await fetch('/__auth/' + name, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(args)});
    const value = await response.json();
    if (value.__throw) throw new Error(value.__throw);
    return value;
  }
  window.supabase = {createClient(url, key, options) {
    window.__sdkOptions.push({url, key, options});
    const auth = {};
    for (const name of ['setSession', 'getSession', 'getUser', 'updateUser', 'signOut', 'resetPasswordForEmail', 'signInWithPassword']) {
      auth[name] = function(...args) { return call(name, args); };
    }
    auth.oauth = {};
    for (const name of ['getAuthorizationDetails', 'approveAuthorization', 'denyAuthorization']) {
      auth.oauth[name] = function(...args) { return call(name, args); };
    }
    return {auth};
  }};
})();`;

const server = http.createServer(async (req, res) => {
  const target = new URL(req.url, base), name = target.pathname.slice(1) || 'index.html';
  requests.push({method: req.method, path: target.pathname, query: target.search});
  res.setHeader('Cache-Control', 'no-store');
  if (target.pathname === '/api/mcp-config') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({supabaseUrl: base, supabaseAnonKey: 'sb_publishable_test_only', resourceUrl: base + '/api/mcp'}));return;
  }
  if (target.pathname.startsWith('/__auth/')) {
    let body = '';for await (const chunk of req) body += chunk;
    const method = target.pathname.slice('/__auth/'.length), args = JSON.parse(body);
    calls.push({method, args});
    await pause(behavior.delay || 60);
    const user = clone(behavior.verifiedUser || fakeUser), sessionUser = clone(behavior.sessionUser || fakeUser);
    const session = {access_token: fakeToken, refresh_token: 'fake_refresh_test_only', user: sessionUser};
    let value = {data: {}, error: null};
    if (method === 'setSession') value = behavior.sessionError ? {data: {session: null, user: null}, error: behavior.sessionError} : {data: {session, user: sessionUser}, error: null};
    else if (method === 'getSession') value = {data: {session}, error: null};
    else if (method === 'getUser') value = behavior.userError ? {data: {user: null}, error: behavior.userError} : {data: {user}, error: null};
    else if (method === 'updateUser') {
      if (behavior.updateFailures > 0) {behavior.updateFailures--;value = {data: {user: null}, error: {code: 'unexpected_failure', message: 'Falha simulada ao salvar a senha.'}};}
      else value = {data: {user}, error: null};
    } else if (method === 'signOut' && behavior.signOutFails) value = behavior.signOutThrows ? {__throw: 'Falha simulada ao sair.'} : {error: {message: 'Falha simulada ao sair.'}};
    else if (method === 'resetPasswordForEmail' && behavior.emailFailure) value = {data: null, error: {message: 'Falha simulada de envio.'}};
    else if (method === 'signInWithPassword') value = {data: {session, user}, error: null};
    else if (method === 'getAuthorizationDetails') value = {data: {authorization_id: 'test_authorization', client: {id: 'test-client', name: 'Aplicativo de teste'}, user, redirect_uri: base + '/ecosistema.html', scope: 'openid email'}, error: null};
    else if (method === 'approveAuthorization' || method === 'denyAuthorization') value = {data: {redirect_url: base + '/ecosistema.html'}, error: null};
    res.setHeader('Content-Type', 'application/json');res.end(JSON.stringify(value));return;
  }
  if (target.pathname === '/__fake-supabase.js') {res.setHeader('Content-Type', 'text/javascript');res.end(fakeSdk);return;}
  if (!['index.html', 'ecosistema.html', 'oauth-sombrear.html', 'oauth-sombrear.js', 'recuperar-acesso.html', 'recuperar-acesso.js', 'logo.png', 'Logo Sombrear.png'].includes(name)) {res.statusCode = 404;res.end();return;}
  if (!fs.existsSync(path.join(root, name))) {res.statusCode = 404;res.end();return;}
  if (name.endsWith('.png')) {res.setHeader('Content-Type', 'image/png');res.end(fs.readFileSync(path.join(root, name)));return;}
  let content = fs.readFileSync(path.join(root, name), 'utf8');
  if (name.endsWith('.html')) {
    content = content.replace(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js[^>]*><\/script>/g, '<script defer src="/__fake-supabase.js"></script>');
    content = content.replace(/<link[^>]*href="https:\/\/fonts\.[^>]*>/g, '');
  }
  res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : 'text/html');res.end(content);
});

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  chrome = spawn(process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, 'about:blank'], {stdio: ['ignore', 'ignore', 'pipe']});
  timer = setTimeout(() => chrome.kill('SIGKILL'), 180000);
  const endpoint = await new Promise((resolve, reject) => {
    let output = '';
    chrome.stderr.on('data', chunk => {output += chunk;const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if (match) resolve(match[1]);});
    chrome.on('error', reject);chrome.on('exit', code => reject(new Error('Chrome encerrou: ' + code)));
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {socket.addEventListener('open', resolve, {once: true});socket.addEventListener('error', reject, {once: true});});
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') pageErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    const waiting = pending.get(message.id);if (!waiting) return;pending.delete(message.id);
    if (message.error) waiting.reject(new Error(message.error.message));else waiting.resolve(message.result);
  });
  socket.addEventListener('close', () => {for (const waiting of pending.values()) waiting.reject(new Error('Chrome desconectado'));pending.clear();});
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {const id = ++sequence;pending.set(id, {resolve, reject});socket.send(JSON.stringify({id, method, params, sessionId}));});
  const {targetId} = await send('Target.createTarget', {url: 'about:blank'});
  const {sessionId} = await send('Target.attachToTarget', {targetId, flatten: true});
  for (const method of ['Page.enable', 'Runtime.enable', 'Network.enable']) await send(method, {}, sessionId);
  await send('Network.setBlockedURLs', {urls: ['https://*']}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', {width: 1365, height: 960, deviceScaleFactor: 1, mobile: false}, sessionId);
  const evaluate = async expression => {const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}, sessionId);if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);return result.result.value;};
  const waitFor = async (expression, label) => {
    const until = Date.now() + 8000;
    while (Date.now() < until) {try {if (await evaluate(expression)) return;} catch {}await pause(35);}
    throw new Error('Timeout: ' + label + '; ' + await evaluate("document.getElementById('recoveryError')?.textContent || document.getElementById('oauthError')?.textContent || location.href"));
  };
  const fill = (selector, value) => evaluate(`(() => {const el = document.querySelector(${JSON.stringify(selector)});el.value = ${JSON.stringify(value)};el.dispatchEvent(new Event('input', {bubbles:true}));})()`);
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const doubleClick = selector => evaluate(`(() => {const button = document.querySelector(${JSON.stringify(selector)});button.click();button.click();})()`);
  const count = method => calls.filter(call => call.method === method).length;
  const visible = id => `document.getElementById(${JSON.stringify(id)}) && !document.getElementById(${JSON.stringify(id)}).closest('[hidden]') && document.getElementById(${JSON.stringify(id)}).getClientRects().length > 0`;
  const complete = () => waitFor(visible('recoveryComplete') + " && document.getElementById('recoveryCard').getAttribute('aria-busy') === 'false'", 'senha alterada e sessão encerrada');
  async function navigate(route, config = {}) {
    // Independent scenarios represent opening a new email/page. Navigating only
    // the hash of an already-open recovery document would not rerun its scripts.
    await send('Page.navigate', {url: 'about:blank'}, sessionId);
    await waitFor("location.href === 'about:blank'", 'novo documento de teste');
    calls = [];behavior = {...config};
    await send('Page.navigate', {url: base + route}, sessionId);
  }
  async function passwordReady(config = {}) {
    await navigate('/recuperar-acesso.html' + validFragment, config);
    await waitFor(visible('passwordForm') + " && !document.getElementById('savePasswordButton').disabled", 'formulário de nova senha');
  }
  async function storageEmpty() {
    assert.deepEqual(await evaluate('({local: {...localStorage}, session: {...sessionStorage}})'), {local: {}, session: {}});
  }
  async function password(value, confirm = value) {await fill('#newPassword', value);await fill('#confirmPassword', confirm);}
  async function screenshot(name) {const result = await send('Page.captureScreenshot', {format: 'png'}, sessionId);const target = path.join(os.tmpdir(), 'sombrear-' + name + '.png');fs.writeFileSync(target, Buffer.from(result.data, 'base64'));console.log('Screenshot: ' + target);}

  // The requests below are intentionally completed by the UI: no script calls
  // an authentication method directly on behalf of the operator.
  await navigate('/oauth-sombrear.html?authorization_id=test_authorization');
  await waitFor(visible('loginPanel'), 'login OAuth disponível');
  assert.equal(calls.length, 0, 'abrir a página não autentica nem envia e-mail');
  await click('#forgotPasswordButton');await pause(100);
  assert.equal(count('resetPasswordForEmail'), 0, 'e-mail vazio não pode enviar recuperação');
  await fill('#oauthEmail', fakeUser.email);await doubleClick('#forgotPasswordButton');
  await waitFor(visible('recoveryNotice'), 'confirmação de envio no login');
  assert.equal(count('resetPasswordForEmail'), 1, 'clique duplo envia uma única solicitação');
  assert.deepEqual(calls.find(call => call.method === 'resetPasswordForEmail').args, [fakeUser.email], 'o e-mail usa a Site URL configurada, sem redirectTo');
  assert.equal(count('signInWithPassword'), 0);assert.equal(count('updateUser'), 0);
  assert.equal(await evaluate('window.__sdkOptions[0].options.auth.flowType'), 'implicit');
  await storageEmpty();

  await navigate('/recuperar-acesso.html');
  await waitFor(visible('recoveryRequestForm'), 'solicitar novo link');
  assert.equal(count('resetPasswordForEmail'), 0);
  await fill('#recoveryEmail', fakeUser.email);await doubleClick('#sendRecoveryButton');
  await waitFor(visible('recoveryNotice'), 'link solicitado');
  assert.equal(count('resetPasswordForEmail'), 1);
  assert.deepEqual(calls.find(call => call.method === 'resetPasswordForEmail').args, [fakeUser.email]);
  assert.equal(count('setSession'), 0);assert.equal(count('updateUser'), 0);

  await passwordReady();
  assert.equal(await evaluate('location.hash'), '', 'fragmento removido antes da interação');
  assert.equal(await evaluate('window.__sdkFragment'), '', 'fragmento removido antes de executar o SDK');
  assert.deepEqual(await evaluate('window.__sdkStorage'), {local: {}, session: {}});
  assert.equal(count('setSession'), 1);assert.equal(count('getUser'), 1);
  assert.deepEqual(calls.find(call => call.method === 'setSession').args, [{access_token: fakeToken, refresh_token: 'fake_refresh_test_only'}]);
  assert.match(await evaluate("document.getElementById('recoveryAccount').textContent"), /operador@example\.invalid/);
  assert.equal(await evaluate("document.getElementById('recoveryAccount').textContent.includes('nao-confiar-no-token')"), false);
  assert.equal(count('updateUser'), 0, 'validar o link não altera a senha');
  const authOptions = await evaluate('window.__sdkOptions[0].options.auth');
  assert.equal(authOptions.flowType, 'implicit');assert.equal(authOptions.persistSession, false);assert.equal(authOptions.autoRefreshToken, false);assert.equal(authOptions.detectSessionInUrl, false);
  await storageEmpty();
  await password('curta_123');await click('#savePasswordButton');await pause(100);assert.equal(count('updateUser'), 0, 'senha curta bloqueada');
  await password('Senha_ficticia_12345', 'Outra_ficticia_12345');await click('#savePasswordButton');await pause(100);assert.equal(count('updateUser'), 0, 'confirmação diferente bloqueada');
  await password('Senha_ficticia_12345');await doubleClick('#savePasswordButton');
  await complete();
  assert.equal(count('updateUser'), 1);assert.deepEqual(calls.find(call => call.method === 'updateUser').args, [{password: 'Senha_ficticia_12345'}]);
  assert.equal(await evaluate("document.getElementById('newPassword').value + document.getElementById('confirmPassword').value"), '');
  await storageEmpty();await screenshot('recuperacao-concluida');

  await passwordReady({updateFailures: 1});
  await password('Senha_ficticia_12345');await click('#savePasswordButton');
  await waitFor(visible('recoveryError') + " && !document.getElementById('savePasswordButton').disabled", 'falha permite tentar novamente');
  assert.equal(count('updateUser'), 1);assert.equal(count('signOut'), 0);
  await password('Senha_ficticia_12345');await click('#savePasswordButton');
  await complete();assert.equal(count('updateUser'), 2);

  for (const signOutThrows of [false, true]) {
    await passwordReady({signOutFails: true, signOutThrows});
    await password('Senha_ficticia_12345');await doubleClick('#savePasswordButton');
    await complete();
    assert.equal(count('updateUser'), 1);assert.equal(await evaluate("document.getElementById('recoveryError').hidden"), true, 'falha no signOut não informa que a senha falhou');
    assert.match(await evaluate("document.getElementById('recoveryNotice').textContent"), /senha já foi alterada/i);
    await evaluate("document.getElementById('passwordForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
    await pause(100);assert.equal(count('updateUser'), 1, 'resultado concluído não repete updateUser');await storageEmpty();
  }

  for (const route of [
    '/recuperar-acesso.html#error=access_denied&error_code=otp_expired&error_description=' + encodeURIComponent('<img src=x onerror="window.__recoveryXss=1">'),
    '/recuperar-acesso.html#type=recovery&access_token=' + encodeURIComponent('<svg onload="window.__recoveryXss=1">') + '&refresh_token=malicious',
    '/recuperar-acesso.html#type=recovery&access_token=' + fakeToken,
    '/recuperar-acesso.html#type=recovery&access_token=' + fakeToken + '&access_token=duplicate&refresh_token=fake'
  ]) {
    await navigate(route);
    await waitFor(visible('recoveryError'), 'link inválido bloqueado');
    assert.equal(await evaluate('location.hash'), '');
    assert.equal(await evaluate('window.__recoveryXss === undefined'), true);
    assert.equal(await evaluate("document.getElementById('passwordPanel').hidden"), true);
    assert.equal(count('updateUser'), 0);assert.equal(count('setSession'), 0);await storageEmpty();
  }

  for (const config of [
    {sessionError: {code: 'otp_expired', message: 'Link expirado no teste.'}},
    {userError: {code: 'session_not_found', message: 'Sessão inválida no teste.'}},
    {verifiedUser: {id: 'outro-usuario', email: 'outra-conta@example.invalid'}},
    {verifiedUser: {id: fakeUser.id}}
  ]) {
    await navigate('/recuperar-acesso.html' + validFragment, config);
    await waitFor(visible('recoveryError'), 'sessão recusada pelo Auth');
    assert.equal(await evaluate("document.getElementById('passwordPanel').hidden"), true);assert.equal(count('updateUser'), 0);await storageEmpty();
  }

  await navigate('/' + validFragment);
  await waitFor("location.pathname === '/recuperar-acesso.html' && " + visible('passwordForm'), 'raiz encaminha recuperação');
  assert.equal(count('setSession'), 1);assert.equal(await evaluate('location.hash'), '');
  await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true}, sessionId);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'tela de recuperação cabe no celular');
  await screenshot('recuperacao-mobile');
  await navigate('/#error=access_denied&error_code=otp_expired');
  await waitFor("location.pathname === '/recuperar-acesso.html' && " + visible('recoveryError'), 'raiz encaminha erro do e-mail expirado');
  await navigate('/');await waitFor("location.pathname === '/ecosistema.html'", 'raiz normal mantém o ecossistema');
  assert.equal(calls.length, 0);
  assert.equal(requests.some(request => request.path.includes('access_token') || request.query.includes('access_token')), false, 'tokens nunca trafegam na URL de requisição');
  assert.deepEqual(pageErrors, []);
  console.log('OK: recuperação OAuth e página de senha, envio único, validação de conta, URL sem fragmento, armazenamento vazio, erros/repetição e roteamento, com Auth inteiramente simulado.');
}

main().catch(error => {console.error(error.stack);process.exitCode = 1;}).finally(async () => {
  clearTimeout(timer);
  if (socket) socket.close();
  if (chrome) {chrome.kill();await pause(300);if (chrome.exitCode === null) chrome.kill('SIGKILL');}
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(profile, {recursive: true, force: true});
});
