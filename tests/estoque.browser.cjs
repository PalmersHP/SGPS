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
  filiais:[{id:'df',nome:'Sombrear DF',cidade:'Brasília',ativo:true}],catalogo:catalog,pedidos:[clone(legacy)]
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
  const action=name=>click('[data-e-action="'+name+'"]');
  const pieceAction=name=>click('[data-p-action="'+name+'"]');
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
  const modalClosed=()=>waitFor("!document.getElementById('modalOverlay').classList.contains('open')",'modal fechado');
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
  async function transfer(from,to,key,qtd,{conflict=false}={}){
    await open(from);await action('transfer');
    await waitFor("document.getElementById('e_transfer_destino')",'remanejamento aberto');
    await fill('#e_transfer_destino',to);await fill('#e_transfer_obs','Remanejamento de teste');
    await fillKey('data-e-transfer-key',key,qtd);
    if(conflict){
      const before=clone(records());conflictNext=true;await action('save-transfer');
      await waitFor("document.getElementById('estoqueError')?.textContent.includes('Outro usuário')",'conflito de estoque tratado');
      assert.deepEqual(records().filter(p=>p.tipo_registro!=='controle_estoque'),before.filter(p=>p.tipo_registro!=='controle_estoque'),'conflito não altera as pastas');
      const concurrent=Core.fromRecords(records(),store.filiais,store.catalogo);
      assert.ok(concurrent.movimentos.some(m=>m.id==='parallel-stock-entry'));
      assert.equal(Core.balances(concurrent,from).find(b=>b.key===key).disponivel,100,'transferência rejeitada não reduz a origem');
    }
    const previous=patches;
    await evaluate("document.querySelector('[data-e-action=\"save-transfer\"]').click();document.querySelector('[data-e-action=\"save-transfer\"]').click()");
    await modalClosed();assert.equal(patches,previous+1,'remanejamento é uma única gravação atômica');
    const moves=(await state()).movimentos.filter(m=>m.tipo==='transferencia'&&m.origem_id===from&&m.destino_id===to);
    assert.ok(moves.length);return moves.at(-1).id;
  }
  async function receive(id,moveId){
    await open(id);await click('[data-e-action="receive"][data-id="'+moveId+'"]');
    await waitFor("document.querySelector('[data-e-action=\"confirm-receive\"]')",'confirmação do recebimento');
    const before=patches;
    await evaluate("document.querySelector('[data-e-action=\"confirm-receive\"]').click();document.querySelector('[data-e-action=\"confirm-receive\"]').click()");
    await modalClosed();assert.equal(patches,before+1);
    assert.equal((await state()).movimentos.filter(m=>m.tipo==='recebimento'&&m.referencia_id===moveId).length,1);
  }
  await login('filial');
  const pid=await folder('Condomínio Riacho 33',130);
  await demand(pid,80,true);
  const secondId=await folder('Condomínio Parque 10',20);
  await demand(secondId,10);
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
  await login('sede');await shot('estoque-home');
  for(const id of [pid,secondId]){await open(id);await action('approve');await waitFor(`Estoque.balances(EstoqueApp.getState(),${JSON.stringify(id)})[0].aprovado>0`,'demanda aprovada');}
  const go='estoque-go',df='estoque-filial-df';
  await open(go);await click('[data-e-action="add-items"][data-mode="estoque"]');
  await waitFor("document.querySelector('[data-line-field=\"desc\"]')",'entrada de peças prontas');
  for(const [i,entry] of [{qtd:100,cor:'Branca',ma:'2.4'},{qtd:25,cor:'Preta',ma:'2,40'},{qtd:15,cor:'Branca',ma:'3,00'}].entries()){
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
  const key=variants.find(b=>b.disponivel===100).key;
  assert.equal((await balance(pid))[0].key,key,'2,40 e 2.4 identificam a mesma peça');
  const firstMove=await transfer(go,pid,key,80,{conflict:true});
  assert.equal((await balance(go)).find(b=>b.key===key).disponivel,20);
  assert.equal((await balance(pid))[0].disponivel,0);
  assert.equal((await balance(pid))[0].em_transito_entrada,80);
  assert.ok((await state()).movimentos.some(m=>m.id==='parallel-stock-entry'),'retry preserva movimento concorrente');
  assert.match((await balance(go)).find(b=>b.disponivel===26).peca.cor,/preta/i);
  assert.equal(Number(String((await balance(go)).find(b=>b.disponivel===15).peca.ma).replace(',','.')),3);
  console.log('OK: GO recebe peças prontas por variante; transferência atômica reserva origem e aguarda confirmação do destino.');
  await login('filial');await receive(pid,firstMove);
  assert.equal((await balance(pid))[0].disponivel,80);
  assert.equal((await balance(pid))[0].em_transito_entrada,0);
  const between=await transfer(pid,secondId,key,10);
  assert.equal((await balance(pid))[0].disponivel,70);
  assert.equal((await balance(secondId))[0].disponivel,0);
  await receive(secondId,between);
  assert.equal((await balance(secondId))[0].disponivel,10);
  const returned=await transfer(pid,df,key,5);await receive(df,returned);
  assert.equal((await balance(pid))[0].disponivel,65);
  assert.equal((await balance(df))[0].disponivel,5);
  for(const id of [pid,secondId])assert.ok((await history(id)).some(m=>m.id===between),'histórico nas duas pontas');
  console.log('OK: confirmação de recebimento, remanejamento entre condomínios e devolução ao DF com histórico.');
  await open(pid);await action('reconcile');
  await waitFor("document.querySelector('[data-e-installed-key]')",'conferência final');
  assert.equal(await evaluate("document.querySelector('[data-e-installed-key]').value"),'0','instalado não é presumido');
  await fillKey('data-e-installed-key',key,60);await action('save-reconcile');
  await waitFor(`Estoque.balances(EstoqueApp.getState(),${JSON.stringify(pid)})[0].instalado===60`,'instalado conferido');
  assert.equal((await balance(pid))[0].instalado,60);
  assert.equal((await balance(pid))[0].disponivel,5);
  assert.notEqual((await state()).pastas.find(p=>p.id===pid).status_obra,'finalizada');
  assert.ok(await evaluate("!document.querySelector('[data-e-action=\"finalize\"]') || document.querySelector('[data-e-action=\"finalize\"]').disabled"),'fechamento indisponível com sobras');
  await shot('estoque-sobras-fechamento');await action('cancel');
  const leftovers=await transfer(pid,df,key,5);
  assert.equal((await balance(pid))[0].disponivel,0);
  assert.equal((await balance(pid))[0].em_transito_saida,5);
  assert.ok(await evaluate("!document.querySelector('[data-e-action=\"finalize\"]') || document.querySelector('[data-e-action=\"finalize\"]').disabled"),'fechamento indisponível com saída em trânsito');
  await receive(df,leftovers);await open(pid);
  await action('finalize');await waitFor("document.querySelector('[data-e-action=\"confirm-finalize\"]')",'confirmação de finalização');
  await action('confirm-finalize');await waitFor(`EstoqueApp.getState().pastas.find(p=>p.id===${JSON.stringify(pid)}).status_obra==='finalizada'`,'obra finalizada');
  const closed=(await state()).pastas.find(p=>p.id===pid);
  assert.equal(closed.status_obra,'finalizada');assert.ok(closed.relatorio_final);
  const report=await evaluate(`Estoque.report(EstoqueApp.getState(),${JSON.stringify(pid)})`);
  assert.equal(report.itens.find(b=>b.key===key).instalado,60);
  assert.equal(report.itens.find(b=>b.key===key).disponivel,0);
  assert.equal(report.itens.find(b=>b.key===key).solicitado,80);
  assert.equal(await evaluate("document.querySelector('.view.active [data-e-action=\"add-items\"]')===null && document.querySelector('.view.active [data-e-action=\"transfer\"]')===null"),true,'obra finalizada bloqueia alterações');
  await action('report');await waitFor("document.getElementById('modalOverlay').classList.contains('open')",'relatório final');
  assert.match(await evaluate("document.getElementById('modalBox').textContent"),/Riacho 33/);
  await shot('estoque-relatorio-final');
  await evaluate('window.print=()=>{window.printed=true;}');await action('print-report');
  assert.equal(await evaluate('window.printed'),true);
  assert.match(await evaluate("document.getElementById('printArea').textContent"),/Relatório final da obra/);
  await action('cancel');
  console.log('OK: instalação só no fechamento; sobras e trânsito bloqueiam conclusão; relatório final preserva solicitado e instalado.');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
  await open(df);await pause(400);await shot('estoque-mobile');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'),'sem rolagem horizontal da página');
  assert.ok(await evaluate("document.getElementById('main').getBoundingClientRect().left<1"),'menu recolhido não ocupa espaço no celular');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
  const persisted=clone(records());await send('Page.reload',{},sessionId);
  await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv')",'recarregamento');
  assert.deepEqual(records(),persisted);assert.equal((await balance(df))[0].disponivel,10);
  assert.equal((await state()).pastas.find(p=>p.id===pid).status_obra,'finalizada');
  assert.deepEqual(store.pedidos,archivedOrders,'novo sistema não altera os pedidos arquivados');
  store.pedidos=[];version++;await send('Page.reload',{},sessionId);
  await waitFor("typeof EstoqueApp!=='undefined' && typeof USER!=='undefined' && USER && !document.getElementById('bootOv')",'recarrega após escrita de aba antiga');
  assert.equal((await balance(df))[0].disponivel,10,'escrita de aba antiga não apaga estoque');
  assert.deepEqual(records(),persisted);store.pedidos=clone(archivedOrders);
  await login('sede');await open('legado');
  const oldBefore=clone(records().find(p=>p.id==='legado').itens);
  assert.equal((await balance('legado'))[0].disponivel,0,'legado não inventa estoque');
  await action('baseline');await waitFor("document.querySelector('[data-e-baseline-key]')",'conferência do legado');
  await evaluate("(()=>{document.querySelector('[data-e-baseline-field=\"disponivel\"]').value='7';document.querySelector('[data-e-baseline-field=\"instalado\"]').value='3';})()");
  await click('#e_baseline_confirm');await action('save-baseline');await modalClosed();
  assert.equal((await balance('legado'))[0].disponivel,7);
  assert.equal((await balance('legado'))[0].instalado,3);
  assert.deepEqual(records().find(p=>p.id==='legado').itens,oldBefore);
  console.log('OK: mobile, recarregamento e conferência explícita de legado preservam peças e saldos.');
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
