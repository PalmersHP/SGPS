// Run with: node tests/estoque.browser.cjs (Chrome installed; no production writes).
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const Core=require('../estoque-core.js');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'sombrear-estoque-'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const clone=o=>JSON.parse(JSON.stringify(o));
const catalog=[
  ['PILAR SOMBRITE MA','PÇ',100],['BRAÇO SOMBRITE SIMPLES','PÇ',110],
  ['ARCOS DE 2VG','PÇ',20],['ESTRELA 2VG','PÇ',25],['TELA COMPLETA SOMBRITE 2 VG','UNID',200]
].map(([desc,un,preco],i)=>({id:'c'+i,desc,un,preco,cat:'Sombrite'}));
const legacy={id:'legado',filial_id:'df',filial_nome:'Sombrear DF',cliente:'Condomínio anterior',status:'em_fabricacao',tipo:'Sombrite',vagas:10,cor_estrutura:'Branca',cor_tela:'Prata',criado:'2026-10-20',itens:[{desc:catalog[0].desc,ma:'2,40',mb:'0,00',mc:'0,00',un:'PÇ',qtd:20,item_status:'aprovado'}],log:[],prazos:[]};
const store={
  usuarios:[{id:'u1',email:'sede@sombrear.com.br',senha:'Sombrear2026',role:'sede',nome:'Teste Sede',ativo:true},{id:'u2',email:'df@sombrear.com.br',senha:'Sombrear2026',role:'filial',nome:'Teste Filial',filial_id:'df',filial_nome:'Sombrear DF',ativo:true}],
  filiais:[{id:'df',nome:'Sombrear DF',cidade:'Brasília',ativo:true},{id:'go',nome:'Sombrear GO',cidade:'Goiânia',ativo:true}],catalogo:catalog,pedidos:[clone(legacy)]
};
const archivedOrders=clone(store.pedidos);
const records=()=>store.pastas_estoques||store.pedidos;
let version=1,failNext=false,conflictNext=false,bootstrapRace=false,failRead=false,unexpectedWrites=0,patches=0,base,chrome,socket,timer,seq=0;
const pending=new Map(),pageErrors=[];
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,base);
  if(url.pathname==='/rest/v1/sgps_store'){
    let body='';for await(const c of req)body+=c;
    const key=(url.searchParams.get('key')||'').replace('eq.','');
    res.setHeader('Content-Type','application/json');
    if(req.method==='GET'){
      if(failRead&&(key==='pedidos'||key==='pastas_estoques')){res.statusCode=503;res.end('{}');return;}
      res.end(JSON.stringify(Object.hasOwn(store,key)?[{key,value:store[key],updated_at:String(version)}]:[]));return;
    }
    if(req.method==='POST'){
      const data=JSON.parse(body);assert.equal(data.key,'pastas_estoques');
      assert.ok(!String(req.headers.prefer||'').includes('merge-duplicates'),'migração nunca faz upsert');
      if(bootstrapRace){bootstrapRace=false;store.pastas_estoques=clone(store.pedidos);version++;res.statusCode=409;res.end('{}');return;}
      if(Object.hasOwn(store,data.key)){res.statusCode=409;res.end('{}');return;}
      store[data.key]=data.value;version++;patches++;res.end(JSON.stringify([{key:data.key}]));return;
    }
    if(req.method==='PATCH'){
      if(failNext){failNext=false;res.statusCode=503;res.end('{}');return;}
      if(conflictNext){
        conflictNext=false;
        store.pastas_estoques=Core.toRecords(Core.addStock(Core.fromRecords(records(),store.filiais,store.catalogo),'estoque-go',[{catalogo_id:catalog[0].id,desc:catalog[0].desc,un:catalog[0].un,ma:'2,40',mb:'0',mc:'0',cor_estrutura:'Preta',qtd:1}],{...store.usuarios[0],data:'2026-10-29',agora:'2026-10-29T15:00:00Z'},{id:'parallel-stock-entry',obs:'Entrada lançada por outro usuário'}));
        version++;res.end('[]');return;
      }
      if(url.searchParams.get('updated_at')!=='eq.'+version){res.end('[]');return;}
      assert.equal(key,'pastas_estoques');store.pastas_estoques=JSON.parse(body).value;version++;patches++;
      res.end(JSON.stringify([{key:'pedidos'}]));return;
    }
    unexpectedWrites++;res.statusCode=405;res.end('{}');return;
  }
  const name=url.pathname.slice(1)||'sistema.html';
  if(!['sistema.html','app.html','pedidos-core.js','pedidos-ui.js','pedidos.css','estoque-core.js','estoque-ui.js','estoque-app.js','estoque.css'].includes(name)){res.statusCode=404;res.end();return;}
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
  timer=setTimeout(()=>chrome.kill('SIGKILL'),180000);
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
  async function waitFor(expression,label){const end=Date.now()+8000;while(Date.now()<end){try{if(await evaluate(expression))return;}catch{}await pause(50);}throw new Error('Timeout: '+label+'; '+await evaluate("document.getElementById('estoqueError')?.textContent||document.getElementById('pedidoError')?.textContent||document.getElementById('errBox')?.textContent||''"));}
  const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const visibleAction=(attribute,name)=>evaluate(`(()=>{const selector='[${attribute}="${name}"]',modal=document.getElementById('modalOverlay');const scope=modal.classList.contains('open')?modal:document.querySelector('.view.active');const button=scope.querySelector(selector);if(!button)throw new Error('Ação visível não encontrada: '+${JSON.stringify(name)});button.click();})()`);
  const action=name=>visibleAction('data-e-action',name);
  const pieceAction=name=>visibleAction('data-p-action',name);
  const fill=(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
  async function login(role){
    await evaluate("try{localStorage.removeItem('sombrear_session')}catch{} ");
    await send('Page.navigate',{url:base+'/sistema.html'},sessionId);
    await waitFor("typeof demo==='function' && location.pathname==='/sistema.html'",'login carregado');
    await click('.demo-row:nth-of-type('+(role==='sede'?2:3)+')');
    await click('.btn-login');
    await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv') && document.querySelector('.view.active [data-e-action]')",'dashboard');
    assert.equal(await evaluate('USER.role'),role);
  }
  async function open(id){
    await evaluate(`EstoqueApp.open(${JSON.stringify(id)})`);
    await waitFor(`EstoqueApp.selected()===${JSON.stringify(id)} && document.querySelector('.view.active [data-e-action]')`,'pasta/estoque aberto');
    await pause(100);
  }
  async function shot(name){await waitFor("!document.getElementById('toast')?.classList.contains('show')",'notificação encerrada');await pause(200);await evaluate('window.scrollTo(0,0)');const r=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(path.join(os.tmpdir(),'sombrear-'+name+'.png'),Buffer.from(r.data,'base64'));}
  const state=()=>evaluate('EstoqueApp.getState()');
  const balance=(id)=>evaluate(`Estoque.balances(EstoqueApp.getState(),${JSON.stringify(id)})`);
  const history=(id)=>evaluate(`Estoque.history(EstoqueApp.getState(),${JSON.stringify(id)})`);
  const requests=(id)=>evaluate(`Estoque.requests(EstoqueApp.getState(),${JSON.stringify(id)})`);
  const modalClosed=()=>waitFor("!document.getElementById('modalOverlay').classList.contains('open')",'modal fechado');
  async function dashboard(role,expected){
    await evaluate(`location.hash=${JSON.stringify(role+'-dashboard')}`);
    await waitFor(`document.querySelector('#view-${role}-dashboard.active .kpi-val')`,'dashboard '+role);
    const values=await evaluate("Object.fromEntries(Array.from(document.querySelectorAll('.view.active .kpi')).map(k=>[k.querySelector('.kpi-label').textContent,Number(k.querySelector('.kpi-val').textContent)]))");
    for(const [label,value] of Object.entries(expected))assert.equal(values[label],value,'dashboard '+role+': '+label);
  }
  async function checkStockCards(role){
    await waitFor("document.querySelector('.view.active .estoque-stock-grid')",'cards dos estoques');
    const cards=await evaluate("Array.from(document.querySelectorAll('.view.active .estoque-stock-grid .estoque-location-card')).map(c=>({name:c.querySelector('h2').textContent,id:c.querySelector('[data-e-action=\"open\"]').dataset.id}))");
    assert.deepEqual(cards.map(c=>c.id).sort(),['estoque-filial-df','estoque-go'],'há somente os estoques físicos DF e GO para '+role);
    assert.equal(cards.filter(c=>/Sombrear GO/i.test(c.name)).length,1,'card GO não duplica o cadastro da sede');
    if(role==='filial'){
      await click('.view.active [data-e-action="open"][data-id="estoque-go"]');
      await waitFor("document.querySelector('.view.active h1')?.textContent==='Estoque Sombrear GO'",'filial consulta estoque GO');
      assert.equal(await evaluate("document.querySelector('.view.active [data-e-action=\"add-items\"],.view.active [data-e-action=\"transfer\"],.view.active [data-e-action=\"receive\"]')===null"),true,'filial pode consultar GO sem ações de alteração');
      await action('list');await waitFor("document.querySelector('.view.active .estoque-stock-grid')",'retorno às pastas');
    }
  }
  const fillKey=(attribute,key,value)=>evaluate(`(()=>{const e=Array.from(document.querySelectorAll('[${attribute}]')).find(e=>e.getAttribute(${JSON.stringify(attribute)})===${JSON.stringify(key)});if(!e)throw new Error('Campo não encontrado: '+${JSON.stringify(attribute)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  async function folder(name,vagas,colors){
    await evaluate('EstoqueApp.createFolder()');
    await waitFor("document.getElementById('p_cliente')",'cadastro da pasta');
    await fill('#p_cliente',name);await fill('#p_vagas',vagas);
    if(colors){await fill('#p_cor_estrutura',colors.estrutura);await fill('#p_cor_tela',colors.tela);}
    assert.equal(await evaluate("document.querySelector('.view.active').textContent.includes('Locação')"),false);
    const migrationConflict=bootstrapRace;await pieceAction('submit');
    if(migrationConflict){
      await waitFor("(document.getElementById('pedidoError')?.textContent||'').includes('Outro usuário')",'concorrência na criação do controle');
      assert.equal(records().some(p=>p.cliente===name),false);
      assert.equal(await evaluate("document.getElementById('p_cliente').value"),name);
      await pieceAction('submit');
    }
    await waitFor(`EstoqueApp.getState().pastas.some(p=>p.cliente===${JSON.stringify(name)})`,'pasta criada sem peças');
    const result=records().find(p=>p.cliente===name);
    assert.ok(result);assert.deepEqual(result.itens,[]);
    await open(result.id);return result.id;
  }
  async function demand(id,qtd,withFailure=false){
    await open(id);await click('[data-e-action="add-items"][data-mode="demanda"]');
    await waitFor("document.querySelector('[data-line-field=\"desc\"]')",'editor de demanda');
    await fill('[data-line="0"][data-line-field="desc"]',catalog[0].desc);
    await fill('[data-line="0"][data-line-field="ma"]','2,40');
    await fill('[data-line="0"][data-line-field="qtd"]',qtd);
    if(withFailure){
      const before=clone(records());failNext=true;await pieceAction('submit');
      await waitFor("(document.getElementById('estoqueError')?.textContent||document.getElementById('pedidoError')?.textContent||'').includes('Não foi possível salvar')",'falha de gravação tratada');
      assert.deepEqual(records(),before);assert.equal(await evaluate("document.querySelector('[data-line=\"0\"][data-line-field=\"qtd\"]').value"),String(qtd));
    }
    const previous=patches;
    await evaluate("document.querySelector('[data-p-action=\"submit\"]').click();document.querySelector('[data-p-action=\"submit\"]').click()");
    await modalClosed();assert.equal(patches,previous+1,'clique duplo gera uma única gravação');
    assert.equal((await balance(id))[0].solicitado,qtd);
  }
  async function transfer(from,to,key,qtd){
    await open(from);await action('transfer');
    await waitFor("document.getElementById('e_transfer_destino')",'remanejamento aberto');
    const option=await evaluate(`Array.from(document.querySelectorAll('#e_transfer_destino option')).some(e=>e.value===${JSON.stringify(to)}&&!e.disabled)`);
    assert.equal(option,true,'destino ativo aparece e pode ser selecionado');
    await fill('#e_transfer_destino',to);await fill('#e_transfer_obs','Remanejamento de teste');
    await fillKey('data-e-transfer-key',key,qtd);
    const previous=patches;
    await evaluate("(()=>{const b=document.querySelector('[data-e-action=\"save-transfer\"]');b.click();b.click();})()");
    await modalClosed();assert.equal(patches,previous+1,'remanejamento é uma única gravação atômica');
    const moves=(await state()).movimentos.filter(m=>m.tipo==='transferencia'&&m.origem_id===from&&m.destino_id===to);
    assert.ok(moves.length);return moves.at(-1).id;
  }
  async function receive(id,moveId){
    await open(id);
    const selector='.view.active [data-e-action="receive"][data-id="'+moveId+'"]';
    assert.match(await evaluate(`document.querySelector(${JSON.stringify(selector)}).textContent`),/conferido/i);
    const before=patches;
    await evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});b.click();b.click();})()`);
    await waitFor(`EstoqueApp.getState().movimentos.filter(m=>m.tipo==='recebimento'&&m.referencia_id===${JSON.stringify(moveId)}).length===1`,'recebimento com um clique');
    await modalClosed();assert.equal(patches,before+1,'Conferido não abre formulário nem duplica o recebimento');
    assert.equal((await state()).movimentos.filter(m=>m.tipo==='recebimento'&&m.referencia_id===moveId).length,1);
  }
  async function openRequests(){
    await evaluate("if(location.hash==='#sede-aprovacoes'){EstoqueUI.requestsPage();}else location.hash='sede-aprovacoes';");
    await waitFor("document.querySelector('#view-sede-aprovacoes.active [data-e-request]')",'solicitações da sede');
  }
  async function dispatchRequest(id,key,qtd,{conflict=false,expectError=false}={}){
    await openRequests();
    const request=(await requests()).find(r=>r.id===id);
    const pendingSelector='.view.active [data-e-request="'+id+'"] [data-e-request-row="'+key+'"] [data-e-request-value="pendente"]';
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(pendingSelector)}).textContent.trim()`),String(request.itens.find(it=>it.key===key).pendente),'lista exibe a quantidade que falta enviar');
    await click('.view.active [data-e-action="dispatch-request"][data-id="'+id+'"]');
    await waitFor("document.querySelector('[data-e-request-key]')",'envio da solicitação');
    await fillKey('data-e-request-key',key,qtd);
    const before=clone(records()),previous=patches;
    if(expectError){
      await action('save-request-dispatch');
      await waitFor("!!document.getElementById('estoqueError')?.textContent",'envio acima do estoque bloqueado');
      assert.match(await evaluate("document.getElementById('estoqueError').textContent"),/saldo|estoque|disponível/i);
      assert.deepEqual(records(),before);assert.equal(patches,previous);return;
    }
    if(conflict){
      conflictNext=true;await action('save-request-dispatch');
      await waitFor("document.getElementById('estoqueError')?.textContent.includes('Outro usuário')",'conflito durante atendimento tratado');
      const concurrent=Core.fromRecords(records(),store.filiais,store.catalogo);
      assert.ok(concurrent.movimentos.some(m=>m.id==='parallel-stock-entry'));
      assert.equal(Core.balances(concurrent,'estoque-go').find(b=>b.key===key).disponivel,70,'envio rejeitado não altera o estoque da solicitação');
      assert.deepEqual(records().filter(p=>p.tipo_registro!=='controle_estoque'),before.filter(p=>p.tipo_registro!=='controle_estoque'));
    }
    await evaluate("(()=>{const b=document.querySelector('[data-e-action=\"save-request-dispatch\"]');b.click();b.click();})()");
    await modalClosed();assert.equal(patches,previous+1,'atendimento com clique duplo gera apenas um envio');
    return (await state()).movimentos.filter(m=>m.tipo==='transferencia'&&m.origem_id==='estoque-go'&&m.destino_id===request.pasta_id).at(-1).id;
  }
  await login('filial');await checkStockCards('filial');
  const pid=await folder('Condomínio Riacho 33',130);
  await demand(pid,100,true);
  const secondId=await folder('Condomínio Parque 10',20);
  await demand(secondId,10);
  const directId=await folder('Condomínio Recebimento Direto',8);
  assert.equal((await balance(pid))[0].disponivel,0,'demanda não cria estoque');
  assert.equal(records().find(p=>p.id===pid).cor_tela,'Prata');
  assert.equal(records().find(p=>p.id===pid).vagas,130);
  console.log('OK: pasta vazia, catálogo e demanda separados do estoque; falha preserva edição e clique duplo não duplica.');
  const coloredId=await folder('Condomínio Preta e Verde',24,{estrutura:'Preta',tela:'Verde'});
  await click('[data-e-action="add-items"][data-mode="demanda"]');
  await waitFor("document.querySelector('[data-line-field=\"desc\"]')",'demanda com cores do condomínio');
  const coloredDemand=[{catalogo_id:catalog[0].id,desc:catalog[0].desc,un:catalog[0].un,ma:'2,40',mb:'0,00',mc:'0,00',qtd:12},{catalogo_id:catalog[4].id,desc:catalog[4].desc,un:catalog[4].un,ma:'5,00',mb:'5,30',mc:'0,00',qtd:6}];
  for(const [i,item] of coloredDemand.entries()){
    if(i)await pieceAction('add-row');
    await fill('[data-line="'+i+'"][data-line-field="desc"]',item.desc);
    for(const field of ['ma','mb','mc','qtd'])await fill('[data-line="'+i+'"][data-line-field="'+field+'"]',item[field]);
  }
  await pieceAction('submit');await modalClosed();
  const coloredFolder=records().find(p=>p.id===coloredId),coloredRows=await balance(coloredId);
  assert.equal(coloredFolder.cor_estrutura,'Preta');assert.equal(coloredFolder.cor_tela,'Verde');
  const pillar=coloredRows.find(b=>b.peca.catalogo_id===catalog[0].id),screen=coloredRows.find(b=>b.peca.catalogo_id===catalog[4].id);
  assert.equal(pillar.peca.cor,'Preta');assert.equal(pillar.peca.cor_estrutura,'Preta');assert.equal(pillar.peca.cor_tela,'');
  assert.equal(screen.peca.cor,'Verde');assert.equal(screen.peca.cor_tela,'Verde');assert.equal(screen.peca.cor_estrutura,'');
  for(const item of coloredDemand){
    const row=coloredRows.find(b=>b.peca.catalogo_id===item.catalogo_id);
    assert.equal(row.key,Core.keyOf(item,coloredFolder),'identidade da demanda herda a cor da pasta');
    assert.equal(row.solicitado,item.qtd);assert.equal(row.disponivel,0);
  }
  console.log('OK: seleção no catálogo herda estrutura Preta e tela Verde da pasta, sem cores padrão indevidas.');
  await login('sede');await checkStockCards('sede');await shot('estoque-home');
  const go='estoque-go',df='estoque-filial-df';
  const mainRequest=(await requests(pid)).find(r=>r.itens.some(it=>it.solicitado===100));
  assert.ok(mainRequest,'demanda da filial cria solicitação individual para a sede');
  assert.equal(mainRequest.itens[0].pendente,100);
  assert.equal((await requests(coloredId))[0].itens.find(it=>it.peca.catalogo_id===catalog[0].id).peca.cor,'Preta');
  assert.equal((await requests(coloredId))[0].itens.find(it=>it.peca.catalogo_id===catalog[4].id).peca.cor,'Verde');
  await open(go);await click('.view.active [data-e-action="add-items"][data-mode="estoque"]');
  await waitFor("document.querySelector('[data-line-field=\"desc\"]')",'entrada de peças prontas');
  for(const [i,entry] of [{qtd:70,cor:'Branca',ma:'2.4'},{qtd:25,cor:'Preta',ma:'2,40'},{qtd:15,cor:'Branca',ma:'3,00'}].entries()){
    if(i)await pieceAction('add-row');
    await fill('[data-line="'+i+'"][data-line-field="desc"]',catalog[0].desc);
    await fill('[data-line="'+i+'"][data-line-field="qtd"]',entry.qtd);
    await fill('[data-line="'+i+'"][data-line-field="ma"]',entry.ma);
    await fill('[data-line="'+i+'"][data-line-field="cor"]',entry.cor);
  }
  await pieceAction('submit');await modalClosed();
  const variants=await balance(go);
  assert.equal(variants.length,3,'cores e medidas diferentes ficam separadas');
  assert.equal(variants.find(b=>b.disponivel===25).key,pillar.key,'pilar solicitado preto corresponde ao estoque preto');
  const key=variants.find(b=>b.disponivel===70).key;
  assert.equal((await balance(pid))[0].key,key,'2,40 e 2.4 identificam a mesma peça');
  const firstMove=await dispatchRequest(mainRequest.id,key,50,{conflict:true});
  assert.equal((await balance(go)).find(b=>b.key===key).disponivel,20);
  assert.equal((await balance(pid))[0].disponivel,0);
  assert.equal((await balance(pid))[0].em_transito_entrada,50);
  assert.equal((await requests(pid)).find(r=>r.id===mainRequest.id).itens[0].pendente,50);
  assert.ok((await state()).movimentos.some(m=>m.id==='parallel-stock-entry'),'retry preserva movimento concorrente');
  assert.match((await balance(go)).find(b=>b.disponivel===26).peca.cor,/preta/i);
  assert.equal(Number(String((await balance(go)).find(b=>b.disponivel===15).peca.ma).replace(',','.')),3);
  await dashboard('sede',{'Condomínios':5,'Solicitações Pendentes':4,'Remanejamentos em trânsito':1,'Obras finalizadas':0});
  await shot('estoque-dashboard-sede');
  await click('.view.active [data-e-action="request"][data-id="'+mainRequest.id+'"]');
  await waitFor(`document.querySelector('#view-sede-pedido.active [data-e-request="${mainRequest.id}"]')`,'dashboard abre a solicitação na pasta');
  assert.equal(await evaluate("document.querySelector('.view.active h1').textContent"),'Condomínio Riacho 33');
  assert.equal(await evaluate(`document.querySelector('.view.active [data-e-request="${mainRequest.id}"] [data-e-request-value="pendente"]').textContent.trim()`),'50');
  await openRequests();await send('Page.reload',{},sessionId);
  await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv')",'pendências após recarregar');
  await openRequests();
  assert.equal((await requests(pid)).find(r=>r.id===mainRequest.id).itens[0].pendente,50);
  assert.ok(await evaluate(`document.querySelector('.view.active [data-e-request="${mainRequest.id}"]')!==null`),'solicitação parcial continua na lista da sede');
  assert.equal(await evaluate(`document.querySelector('.view.active [data-e-request="${mainRequest.id}"] [data-e-request-value="pendente"]').textContent.trim()`),'50');
  await shot('estoque-solicitacao-parcial');
  await dispatchRequest(mainRequest.id,key,50,{expectError:true});await action('cancel');
  await open(go);await click('.view.active [data-e-action="add-items"][data-mode="estoque"]');
  await fill('[data-line="0"][data-line-field="desc"]',catalog[0].desc);
  await fill('[data-line="0"][data-line-field="ma"]','2,40');
  await fill('[data-line="0"][data-line-field="qtd"]',50);
  await fill('[data-line="0"][data-line-field="cor"]','Branca');
  await pieceAction('submit');await modalClosed();
  const secondMove=await dispatchRequest(mainRequest.id,key,50);
  assert.equal((await requests(pid)).find(r=>r.id===mainRequest.id).itens[0].pendente,0);
  assert.equal((await requests(pid)).find(r=>r.id===mainRequest.id).status,'enviado');
  assert.equal((await balance(go)).find(b=>b.key===key).disponivel,20);
  assert.equal((await balance(pid))[0].em_transito_entrada,100);
  await openRequests();
  assert.equal(await evaluate(`document.querySelector('.view.active [data-e-action="dispatch-request"][data-id="${mainRequest.id}"]')===null`),true,'solicitação atendida não permanece pendente');
  assert.equal((await requests()).filter(r=>r.pasta_id===coloredId&&r.status==='pendente').length,1,'envio branco não abate demanda de outras cores');
  assert.deepEqual(await requests(directId),[],'pasta vazia não exige solicitação para receber');
  const directMove=await transfer(go,directId,key,4);
  assert.deepEqual(await requests(directId),[],'remanejamento direto não cria pedido artificial');
  const legacyItemsBefore=clone(records().find(p=>p.id==='legado').itens);
  const legacyMove=await transfer(go,'legado',key,4);
  assert.equal((await balance('legado'))[0].disponivel,0,'envio não presume estoque a partir do pedido antigo');
  assert.equal((await balance('legado'))[0].em_transito_entrada,4);
  assert.equal((await balance(go)).find(b=>b.key===key).disponivel,12);
  console.log('OK: solicitação 100 → envio 50 → pendência 50 após reload → envio 50 → zero; saldo GO limita envios e variantes permanecem separadas.');
  await login('filial');await checkStockCards('filial');
  console.log('OK: DF e GO cadastradas geram somente um estoque GO; filial consulta GO sem adicionar ou remanejar.');
  await dashboard('filial',{'Condomínios':5,'Solicitações Pendentes':3,'Recebimentos a conferir':4,'Vagas concluídas':0});
  await receive(pid,firstMove);assert.equal((await balance(pid))[0].disponivel,50);
  await receive(pid,secondMove);assert.equal((await balance(pid))[0].disponivel,100);
  await receive(directId,directMove);assert.equal((await balance(directId))[0].disponivel,4);
  await receive('legado',legacyMove);
  assert.equal((await balance('legado'))[0].disponivel,4,'Conferido acrescenta só o recebido, sem inferir as vinte peças antigas');
  assert.equal((await balance('legado'))[0].em_transito_entrada,0);
  assert.equal(await evaluate("document.querySelector('.view.active .estoque-available').textContent.trim()"),'4','legado mostra o saldo físico recebido na tela');
  assert.equal(await evaluate("document.querySelector('.view.active [data-e-action=\"baseline\"]')===null"),true,'recebimento antigo não exige conferência inicial');
  assert.deepEqual(records().find(p=>p.id==='legado').itens,legacyItemsBefore);
  const between=await transfer(pid,secondId,key,10);await receive(secondId,between);
  assert.equal((await balance(secondId))[0].disponivel,10);
  const returned=await transfer(pid,df,key,25);await receive(df,returned);
  assert.equal((await balance(pid))[0].disponivel,65);
  assert.equal((await balance(df))[0].disponivel,25);
  for(const id of [pid,secondId])assert.ok((await history(id)).some(m=>m.id===between),'histórico nas duas pontas');
  console.log('OK: Conferido recebe com um clique, inclusive legado sem formulário; filial remaneja entre obras e DF com histórico.');
  await open(pid);await action('finalize');
  await waitFor("document.getElementById('e_close_remaining_confirm')",'prévia do fechamento');
  assert.equal(await evaluate("document.querySelector('[data-e-installed-key]')===null"),true,'instalado não precisa ser digitado');
  assert.equal(await evaluate("document.getElementById('e_close_remaining_confirm').checked"),false,'conversão do saldo exige confirmação prévia');
  assert.match(await evaluate(`document.querySelector('[data-e-close-key="${key}"]').textContent`),/65/);
  await action('cancel');
  assert.equal((await balance(pid))[0].disponivel,65);assert.equal((await balance(pid))[0].instalado,0,'cancelar prévia não altera estoque');
  const leftovers=await transfer(pid,df,key,5);
  assert.equal((await balance(pid))[0].disponivel,60);assert.equal((await balance(pid))[0].em_transito_saida,5);
  await action('finalize');
  await waitFor("document.getElementById('modalOverlay').classList.contains('open')",'fechamento com trânsito');
  assert.match(await evaluate("document.getElementById('modalBox').textContent"),/trânsito|recebimento/i);
  assert.equal(await evaluate("!document.querySelector('[data-e-action=\"confirm-finalize\"]') || document.querySelector('[data-e-action=\"confirm-finalize\"]').disabled"),true,'trânsito impede finalizar');
  await shot('estoque-sobras-fechamento');await action('cancel');
  await receive(df,leftovers);await open(pid);await action('finalize');
  await waitFor("document.getElementById('e_close_remaining_confirm')",'prévia do saldo restante');
  assert.match(await evaluate(`document.querySelector('[data-e-close-key="${key}"]').textContent`),/60/);
  // Outro operador recebe uma peça depois que a prévia foi aberta. O saldo exibido não pode ser fechado silenciosamente.
  let concurrent=Core.fromRecords(records(),store.filiais,store.catalogo);
  const ctxSede={...store.usuarios[0],data:'2026-10-29',agora:'2026-10-29T16:00:00Z'};
  const ctxFilial={...store.usuarios[1],data:'2026-10-29',agora:'2026-10-29T16:01:00Z'};
  concurrent=Core.transfer(concurrent,go,pid,[{key,qtd:1}],ctxSede,{id:'parallel-close-transfer'});
  concurrent=Core.receive(concurrent,'parallel-close-transfer',ctxFilial,{id:'parallel-close-receipt'});
  store.pastas_estoques=Core.toRecords(concurrent);version++;
  const beforeStale=patches;
  await click('#e_close_remaining_confirm');await action('confirm-finalize');
  await waitFor("!!document.getElementById('estoqueError')?.textContent",'prévia desatualizada bloqueada');
  assert.match(await evaluate("document.getElementById('estoqueError').textContent"),/saldo|estoque|quantidade|conferência/i);
  assert.equal(patches,beforeStale,'prévia desatualizada não grava fechamento');
  assert.notEqual(Core.fromRecords(records(),store.filiais,store.catalogo).pastas.find(p=>p.id===pid).status_obra,'finalizada');
  assert.equal(Core.balances(Core.fromRecords(records(),store.filiais,store.catalogo),pid)[0].disponivel,61);
  await action('cancel');await evaluate('EstoqueApp.refresh(undefined,true)');
  const corrective=await transfer(pid,df,key,1);await receive(df,corrective);
  await open(pid);await action('finalize');await waitFor("document.getElementById('e_close_remaining_confirm')",'nova prévia atualizada');
  await click('#e_close_remaining_confirm');await action('confirm-finalize');
  await waitFor(`EstoqueApp.getState().pastas.find(p=>p.id===${JSON.stringify(pid)}).status_obra==='finalizada'`,'obra finalizada');
  const closed=(await state()).pastas.find(p=>p.id===pid);
  assert.equal(closed.status_obra,'finalizada');assert.ok(closed.relatorio_final);
  const report=await evaluate(`Estoque.report(EstoqueApp.getState(),${JSON.stringify(pid)})`);
  assert.equal(report.itens.find(b=>b.key===key).instalado,60);
  assert.equal(report.itens.find(b=>b.key===key).disponivel,0);
  assert.equal(report.itens.find(b=>b.key===key).solicitado,100);
  assert.equal(await evaluate("document.querySelector('.view.active [data-e-action=\"add-items\"]')===null && document.querySelector('.view.active [data-e-action=\"transfer\"]')===null"),true,'obra finalizada bloqueia alterações');
  if(!await evaluate("document.getElementById('modalOverlay').classList.contains('open')"))await action('report');
  await waitFor("document.getElementById('modalOverlay').classList.contains('open')",'relatório final');
  assert.match(await evaluate("document.getElementById('modalBox').textContent"),/Riacho 33/);
  await shot('estoque-relatorio-final');
  await evaluate('window.print=()=>{window.printed=true;}');await action('print-report');
  assert.equal(await evaluate('window.printed'),true);
  assert.match(await evaluate("document.getElementById('printArea').textContent"),/Relatório final da obra/);
  await action('cancel');
  console.log('OK: fechamento converte o saldo restante em 60 instalados; trânsito e prévia desatualizada bloqueiam, relatório final preserva solicitado e histórico.');
  await dashboard('filial',{'Condomínios':5,'Solicitações Pendentes':2,'Recebimentos a conferir':0,'Vagas concluídas':130});
  await shot('estoque-dashboard-filial');
  console.log('OK: dashboards contam solicitações, recebimentos e obras concluídas corretamente; sede abre a solicitação pela lista do dashboard.');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
  await open(df);await pause(400);await shot('estoque-mobile');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'sem rolagem horizontal da página');
  assert.ok(await evaluate("document.getElementById('main').getBoundingClientRect().left<1"),'menu recolhido não ocupa espaço no celular');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
  const persisted=clone(records());await send('Page.reload',{},sessionId);
  await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv')",'recarregamento');
  assert.deepEqual(records(),persisted);assert.equal((await balance(df))[0].disponivel,31);
  assert.equal((await balance('legado'))[0].disponivel,4);
  assert.equal((await state()).pastas.find(p=>p.id===pid).status_obra,'finalizada');
  assert.deepEqual(store.pedidos,archivedOrders,'novo sistema não altera os pedidos arquivados');
  store.pedidos=[];version++;await send('Page.reload',{},sessionId);
  await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv')",'recarrega após escrita de aba antiga');
  assert.equal((await balance(df))[0].disponivel,31,'escrita de aba antiga não apaga estoque');
  assert.deepEqual(records(),persisted);store.pedidos=clone(archivedOrders);
  assert.deepEqual(records().find(p=>p.id==='legado').itens,legacyItemsBefore);
  console.log('OK: mobile, recarregamento e legado preservam peças e saldos.');
  const snapshot=clone(records());failRead=true;
  await send('Page.reload',{},sessionId);
  await waitFor("document.getElementById('bootOv')?.textContent.includes('Erro ao conectar')",'falha de leitura exibida');
  assert.deepEqual(records(),snapshot);assert.equal(unexpectedWrites,0);
  failRead=false;assert.deepEqual(store.pedidos,archivedOrders,'o aplicativo novo preserva os pedidos antigos');
  delete store.pastas_estoques;bootstrapRace=true;await login('filial');
  const raced=await folder('Pasta após migração concorrente',1);
  assert.equal(records().filter(p=>p.id===raced).length,1);
  assert.deepEqual(store.pedidos,archivedOrders);
  console.log('OK: migração exclusiva resolve conflito sem duplicar pasta; abas antigas não apagam o estoque novo.');
  store.pastas_estoques=[];version++;
  await send('Page.reload',{},sessionId);
  await waitFor("typeof DB!=='undefined' && !document.getElementById('bootOv') && DB.pedidos().length===0",'coleção vazia preservada');
  assert.deepEqual(records(),[]);assert.equal(unexpectedWrites,0);
  assert.deepEqual(pageErrors,[],'nenhum erro JavaScript no navegador');
  console.log('Todos os testes de estoque passaram. Banco usado: apenas memória local; nenhum acesso de gravação à produção.');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{
  clearTimeout(timer);if(socket)socket.close();
  if(chrome){const ended=new Promise(r=>chrome.once('exit',r));chrome.kill('SIGTERM');await Promise.race([ended,pause(2000)]);if(chrome.exitCode===null&&chrome.signalCode===null)chrome.kill('SIGKILL');}
  server.closeAllConnections();await new Promise(r=>server.close(r));
  fs.rmSync(profile,{recursive:true,force:true});
});
