// Run with: node tests/pedidos.browser.cjs (Chrome installed; no production writes).
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'sombrear-flow-'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const clone=o=>JSON.parse(JSON.stringify(o));
const catalog=[
  ['PILAR SOMBRITE MA','PÇ',100],['BRAÇO SOMBRITE SIMPLES','PÇ',110],
  ['ARCOS DE 2VG','PÇ',20],['ESTRELA 2VG','PÇ',25],['TELA COMPLETA SOMBRITE 2 VG','UNID',200]
].map(([desc,un,preco],i)=>({id:'c'+i,desc,un,preco,cat:'Sombrite'}));
const legacy={id:'legado',filial_id:'df',filial_nome:'Sombrear DF',cliente:'Condomínio anterior',status:'em_fabricacao',tipo:'Sombrite',vagas:10,cor_estrutura:'Branca',cor_tela:'Prata',criado:'2026-10-20',itens:[{desc:catalog[0].desc,ma:'2,40',mb:'0,00',mc:'0,00',un:'PÇ',qtd:20,item_status:'aprovado'}],log:[],prazos:[]};
const store={
  usuarios:[{id:'u1',email:'sede@sombrear.com.br',senha:'Sombrear2026',role:'sede',nome:'Teste Sede',ativo:true},{id:'u2',email:'df@sombrear.com.br',senha:'Sombrear2026',role:'filial',nome:'Teste Filial',filial_id:'df',filial_nome:'Sombrear DF',ativo:true}],
  filiais:[{id:'df',nome:'Sombrear DF',cidade:'Brasília',ativo:true}],catalogo:catalog,pedidos:[clone(legacy)]
};
let version=1,failNext=false,conflictNext=false,failRead=false,unexpectedWrites=0,base,chrome,socket,timer,seq=0;
const pending=new Map(),pageErrors=[];
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,base);
  if(url.pathname==='/rest/v1/sgps_store'){
    let body='';for await(const c of req)body+=c;
    const key=(url.searchParams.get('key')||'').replace('eq.','');
    res.setHeader('Content-Type','application/json');
    if(req.method==='GET'){
      if(failRead&&key==='pedidos'){res.statusCode=503;res.end('{}');return;}
      res.end(JSON.stringify([{key,value:store[key],updated_at:String(version)}]));return;
    }
    if(req.method==='PATCH'){
      if(failNext){failNext=false;res.statusCode=503;res.end('{}');return;}
      if(conflictNext){conflictNext=false;version++;res.end('[]');return;}
      if(url.searchParams.get('updated_at')!=='eq.'+version){res.end('[]');return;}
      assert.equal(key,'pedidos');store.pedidos=JSON.parse(body).value;version++;
      res.end(JSON.stringify([{key:'pedidos'}]));return;
    }
    unexpectedWrites++;res.statusCode=405;res.end('{}');return;
  }
  const name=url.pathname.slice(1)||'sistema.html';
  if(!['sistema.html','app.html','pedidos-core.js','pedidos-ui.js','pedidos.css'].includes(name)){res.statusCode=404;res.end();return;}
  let text=fs.readFileSync(path.join(root,name),'utf8');
  if(name.endsWith('.html')){
    text=text.replace(/var SUPA_URL='[^']+';/,"var SUPA_URL='"+base+"';");
    text=text.replace(/<script src="https:\/\/cdn.jsdelivr.net\/npm\/chart.js"><\/script>/,'<script>window.Chart=function(){this.destroy=function(){}};</script>');
    text=text.replace(/<link[^>]+fonts.googleapis.com[^>]*>/g,'');
  }
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(text);
});

async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  base='http://127.0.0.1:'+server.address().port;
  chrome=spawn(process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
    '--headless=new','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--user-data-dir='+profile,'about:blank'
  ],{stdio:['ignore','ignore','pipe']});
  timer=setTimeout(()=>chrome.kill('SIGKILL'),90000);
  const endpoint=await new Promise((resolve,reject)=>{
    let output='';chrome.stderr.on('data',c=>{output+=c;const m=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m)resolve(m[1]);});
    chrome.on('error',reject);chrome.on('exit',c=>reject(new Error('Chrome encerrou: '+c)));
  });
  socket=new WebSocket(endpoint);
  await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
  socket.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.method==='Runtime.exceptionThrown')pageErrors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);
  });
  socket.addEventListener('close',()=>{for(const p of pending.values())p.reject(new Error('Chrome desconectado'));pending.clear();});
  function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,sessionId}));});}
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
  await send('Page.enable',{},sessionId);await send('Runtime.enable',{},sessionId);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
  async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
  async function waitFor(expression,label){const end=Date.now()+8000;while(Date.now()<end){try{if(await evaluate(expression))return;}catch{}await pause(50);}throw new Error('Timeout: '+label+'; '+await evaluate("document.getElementById('pedidoError')?.textContent||document.getElementById('errBox')?.textContent||''"));}
  const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const action=name=>click('[data-p-action="'+name+'"]');
  const fill=(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
  async function login(role){
    await evaluate("try{localStorage.removeItem('sombrear_session')}catch{} ");
    await send('Page.navigate',{url:base+'/sistema.html'},sessionId);
    await waitFor("typeof demo==='function' && location.pathname==='/sistema.html'",'login carregado');
    await click('.demo-row:nth-of-type('+(role==='sede'?2:3)+')');
    await click('.btn-login');
    await waitFor("typeof USER!=='undefined' && USER && !document.getElementById('bootOv') && document.querySelector('.view.active')",'dashboard');
    assert.equal(await evaluate('USER.role'),role);
  }
  async function open(orderId,role){
    await evaluate(`window._pedidoId=${JSON.stringify(orderId)};location.hash=${JSON.stringify(role+'-pedido')};`);
    await waitFor("document.querySelector('.view.active .pedido-summary')",'detalhe');
    await pause(100);
  }
  async function shot(name){await evaluate('window.scrollTo(0,0)');const r=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(path.join(os.tmpdir(),'sombrear-'+name+'.png'),Buffer.from(r.data,'base64'));}
  await login('filial');
  await evaluate("location.hash='filial-novo-pedido'");
  await waitFor("document.getElementById('p_cliente')",'formulário');
  assert.equal(await evaluate("document.querySelector('.view.active').textContent.includes('Locação')"),false);
  await fill('#p_cliente','Condomínio Riacho 33');await fill('#p_vagas',130);
  await shot('novo-condominio');
  await action('next');
  for(const [i,qtd] of [80,80,320,160,52].entries()){
    if(i)await action('add-row');
    await fill('[data-line="'+i+'"][data-line-field="desc"]',catalog[i].desc);
    await fill('[data-line="'+i+'"][data-line-field="qtd"]',qtd);
    if(i===1)await fill('[data-line="1"][data-line-field="ma"]','4,60');
  }
  await action('back');assert.equal(await evaluate("document.getElementById('p_cliente').value"),'Condomínio Riacho 33');await action('next');
  assert.equal(await evaluate("document.querySelector('[data-line=\"1\"][data-line-field=\"ma\"]').value"),'4,60');
  await action('submit');
  await waitFor("location.hash==='#filial-pedido' && document.querySelector('.view.active .pedido-summary')",'pedido criado');
  const p=store.pedidos.find(p=>p.id!=='legado'),pid=p.id,first=p.itens[0].id;
  assert.deepEqual(p.itens.map(it=>it.qtd),[80,80,320,160,52]);assert.equal(p.cor_tela,'Prata');assert.equal(p.vagas,130);
  console.log('OK: cadastro em duas etapas, catálogo, medidas, quantidades e persistência.');
  await login('sede');await open(pid,'sede');
  await action('approve');await waitFor("DB.getPedido(window._pedidoId).status==='em_fabricacao'",'aceite');
  await action('dispatch');await fill('[data-dispatch-item="'+first+'"]',81);await action('save-dispatch');
  await waitFor("document.getElementById('pedidoError').textContent.includes('ultrapassa')",'bloqueio acima do saldo');
  assert.equal(store.pedidos[0].remessas.length,0);
  await fill('[data-dispatch-item="'+first+'"]',30);
  conflictNext=true;await action('save-dispatch');
  await waitFor("document.getElementById('pedidoError').textContent.includes('Outro usuário')",'conflito tratado');
  assert.equal(store.pedidos[0].remessas.length,0);
  await action('save-dispatch');await waitFor("DB.getPedido(window._pedidoId).remessas.length===1 && !document.getElementById('modalOverlay').classList.contains('open')",'envio salvo');
  assert.equal(store.pedidos[0].itens[0].qtd,80);assert.equal(store.pedidos[0].remessas[0].itens[0].qtd,30);
  const balance=await evaluate('Pedidos.balances(DB.getPedido(window._pedidoId))[0]');assert.equal(balance.saldo,50);
  await shot('saldo-sede');
  await evaluate('window.print=()=>{window.printed=true;}');await action('os');await action('print-os');
  assert.equal(await evaluate('window.printed'),true);
  assert.match(await evaluate("document.getElementById('printArea').textContent"),/Ordem de fabricação/);
  assert.equal(await evaluate("document.querySelector('#printArea > table:last-of-type tbody tr:first-child td:last-child').textContent"),'50');
  assert.equal(store.pedidos[0].remessas.length,1);
  console.log('OK: aceite, envio parcial 30/80, bloqueio de excesso e conflito, OS sem alterar saldo.');
  await login('filial');await open(pid,'filial');
  await action('receive');await waitFor('!!DB.getPedido(window._pedidoId).remessas[0].recebido_em','recebimento');
  await action('complement');await fill('[data-line="0"][data-line-field="desc"]',catalog[0].desc);await fill('[data-line="0"][data-line-field="qtd"]',20);
  failNext=true;await action('submit');await waitFor("document.getElementById('pedidoError').textContent.includes('Não foi possível salvar')",'falha de rede tratada');
  assert.equal(store.pedidos[0].itens.length,5);
  await action('submit');await waitFor("DB.getPedido(window._pedidoId).itens.length===6 && !document.getElementById('modalOverlay').classList.contains('open')",'complemento');
  assert.equal(store.pedidos[0].status,'aguardando');assert.equal(store.pedidos[0].remessas.length,1);
  await action('edit');await fill('[data-line="0"][data-line-field="qtd"]',25);await action('submit');
  await waitFor("DB.getPedido(window._pedidoId).itens[5].qtd===25 && !document.getElementById('modalOverlay').classList.contains('open')",'revisão');
  assert.equal(store.pedidos[0].itens[0].qtd,80);assert.equal(store.pedidos[0].itens[0].id,first);
  console.log('OK: recebimento parcial, complemento, falha de gravação sem perda, revisão só das peças pendentes.');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
  await pause(400);
  await shot('saldo-mobile');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'sem rolagem horizontal da página');
  assert.ok(await evaluate("document.getElementById('main').getBoundingClientRect().left<1"),'menu recolhido não ocupa espaço no celular');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
  await login('sede');await open(pid,'sede');await action('approve');await waitFor("DB.getPedido(window._pedidoId).itens[5].item_status==='aprovado'",'aceite complemento');
  await evaluate("location.hash='sede-pedidos'");await waitFor("document.querySelector('#view-sede-pedidos.active')",'lista');await open('legado','sede');
  assert.match(await evaluate("document.querySelector('.view.active').textContent"),/envios anteriores/i);
  await action('baseline');await fill('[data-dispatch-item="legado-0"]',10);await action('save-dispatch');
  await waitFor("Pedidos.known(DB.getPedido('legado')) && !document.getElementById('modalOverlay').classList.contains('open')",'saldo legado');
  assert.equal(await evaluate("Pedidos.balances(DB.getPedido('legado'))[0].saldo"),10);
  console.log('OK: pedido antigo preservado e saldo inicial conferido explicitamente.');
  const snapshot=clone(store.pedidos);failRead=true;
  await send('Page.reload',{},sessionId);
  await waitFor("document.getElementById('bootOv')?.textContent.includes('Erro ao conectar')",'falha de leitura exibida');
  assert.deepEqual(store.pedidos,snapshot);assert.equal(unexpectedWrites,0);
  failRead=false;store.pedidos=[];version++;
  await send('Page.reload',{},sessionId);
  await waitFor("typeof DB!=='undefined' && !document.getElementById('bootOv') && DB.pedidos().length===0",'coleção vazia preservada');
  assert.deepEqual(store.pedidos,[]);assert.equal(unexpectedWrites,0);
  console.log('OK: falha de leitura e coleção vazia nunca sobrescrevem o banco com dados de exemplo.');
  assert.deepEqual(pageErrors,[],'nenhum erro JavaScript no navegador');
  console.log('Todos os testes de navegador passaram. Banco usado: apenas memória local.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{
  clearTimeout(timer);if(socket)socket.close();
  if(chrome){const ended=new Promise(r=>chrome.once('exit',r));chrome.kill('SIGTERM');await Promise.race([ended,pause(2000)]);if(chrome.exitCode===null&&chrome.signalCode===null)chrome.kill('SIGKILL');}
  server.closeAllConnections();await new Promise(r=>server.close(r));
  fs.rmSync(profile,{recursive:true,force:true});
});
