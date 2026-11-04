'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function target(hash) {
  let destination;
  vm.runInNewContext(code, {URLSearchParams, window: {location: {hash, replace(value) {destination = value;}}}});
  return destination;
}
test('Site URL forwards recovery session to the password screen without losing its fragment', () => {
  const fragment = '#access_token=test-token&refresh_token=test-refresh&type=recovery';
  assert.equal(target(fragment), '/recuperar-acesso.html' + fragment);
  assert.equal(target('#error=access_denied&error_code=otp_expired'), '/recuperar-acesso.html#error=access_denied&error_code=otp_expired');
});
test('normal landing remains ecosystem and recovery parameters cannot choose an external redirect', () => {
  assert.equal(target(''), 'ecosistema.html');
  assert.equal(target('#type=signup'), 'ecosistema.html');
  assert.equal(target('#type=recovery&redirect_to=https://attacker.example'), '/recuperar-acesso.html#type=recovery&redirect_to=https://attacker.example');
  assert.equal(html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '').includes('http-equiv="refresh"'), false);
});
