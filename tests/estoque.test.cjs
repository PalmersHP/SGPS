const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../estoque-core.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const sede={id:'sede',nome:'Sede',role:'sede',data:'2026-10-29',agora:'2026-10-29T15:00:00Z'};
const filial={id:'u-df',nome:'Filial DF',role:'filial',filial_id:'df',filial_nome:'Sombrear DF',data:'2026-10-29',agora:'2026-10-29T15:00:00Z'};
const outra={...filial,id:'u-mg',filial_id:'mg',filial_nome:'Sombrear MG'};
const filiais=[{id:'df',nome:'Sombrear DF'},{id:'mg',nome:'Sombrear MG'}];
const cat=[{id:'c1',desc:'PILAR SOMBRITE MA'},{id:'c2',desc:'TELA COMPLETA SOMBRITE 2 VG'}];
const stock='estoque-filial-df';
const piece=(qtd=100,extra={})=>({catalogo_id:'c1',desc:'PILAR SOMBRITE MA',ma:'2,40',mb:'0,00',mc:'0,00',un:'PÇ',cor:'Branca',qtd,...extra});
const details=(id='obra1',extra={})=>({id,cliente:'Condomínio '+id,cor_estrutura:'Branca',cor_tela:'Prata',vagas:130,...extra});
const meta=(id,obs='')=>({id,data:'2026-10-29',obs});
const empty=()=>E.fromRecords([],filiais,cat);
const create=(s,id='obra1',ctx=filial)=>E.createFolder(s,details(id),ctx);
function ready(qtd=100){let s=create(empty());s=E.addStock(s,'estoque-go',[piece(qtd)],sede,meta('producao'));return s;}
const row=(s,id,key)=>E.balances(s,id).find(b=>!key||b.key===key);
const key=s=>row(s,'estoque-go').key;
const transfer=(s,from,to,qtd,id)=>E.transfer(s,from,to,[{key:row(s,from).key,qtd}],from==='estoque-go'?sede:filial,meta(id));
function receive(s,id,ctx=filial){return E.receive(s,id,ctx,meta('receber-'+id));}
function physical(s){return E.locations(s).reduce((sum,l)=>sum+E.balances(s,l.id).reduce((n,b)=>n+b.disponivel+b.instalado+b.em_transito_saida,0),0);}

test('pasta nasce vazia e não produz estoque ao lançar ou aceitar demanda',()=>{
  const initial=empty();let s=create(initial);
  assert.equal(initial.pastas.length,0);assert.equal(s.pastas[0].itens.length,0);
  assert.equal(E.getLocation(s,'obra1').conhecido,true);
  s=E.addDemand(s,'obra1',[piece(80)],filial,meta('pedido'));
  assert.deepEqual([row(s,'obra1').solicitado,row(s,'obra1').disponivel,row(s,'obra1').aprovado],[80,0,0]);
  s=E.approveDemand(s,'obra1',sede,null,meta('aceite'));
  assert.deepEqual([row(s,'obra1').solicitado,row(s,'obra1').aprovado,row(s,'obra1').disponivel],[80,80,0]);
  assert.throws(()=>E.addDemand(s,'obra1',[piece(1)],filial,meta('pedido')),/Já registrado/);
});
test('pasta duplicada bloqueia por ID ou por nome normalizado na mesma filial',()=>{
  const s=E.createFolder(empty(),details('o1',{cliente:'Condomínio Riacho 33'}),filial);
  assert.throws(()=>E.createFolder(s,details('o1'),filial),/Já registrado/);
  assert.throws(()=>E.createFolder(s,details('o2',{cliente:'  condominio  riacho 33 '}),filial),/pasta existente/);
  assert.equal(E.createFolder(s,details('o2',{cliente:'Condomínio Riacho 33'}),outra).pastas.length,2);
});
test('produção entra em GO; despacho baixa origem e recebimento aumenta destino',()=>{
  const initial=ready();let s=transfer(initial,'estoque-go','obra1',80,'envio1');
  assert.equal(row(initial,'estoque-go').disponivel,100);
  assert.equal(row(s,'estoque-go').disponivel,20);assert.equal(row(s,'estoque-go').em_transito_saida,80);
  assert.equal(row(s,'obra1').disponivel,0);assert.equal(row(s,'obra1').em_transito_entrada,80);
  assert.equal(physical(s),100);
  const sent=clone(s.movimentos.find(m=>m.id==='envio1'));
  s=receive(s,'envio1');
  assert.equal(row(s,'obra1').disponivel,80);assert.equal(row(s,'obra1').em_transito_entrada,0);
  assert.equal(row(s,'estoque-go').em_transito_saida,0);assert.equal(physical(s),100);
  assert.deepEqual(s.movimentos.find(m=>m.id==='envio1'),sent);
  assert.equal(s.movimentos.at(-1).referencia_id,'envio1');
  assert.throws(()=>receive(s,'envio1'),/Já registrado/);
});
test('cenário completo conserva peças entre GO, condomínios, DF e instalações',()=>{
  let s=create(ready(),'obra2');
  s=E.addDemand(s,'obra1',[piece(80)],filial,meta('demanda'));
  s=receive(transfer(s,'estoque-go','obra1',80,'go-obra'),'go-obra');
  s=receive(transfer(s,'obra1','obra2',10,'obra-obra'),'obra-obra');
  s=receive(transfer(s,'obra1',stock,5,'obra-df'),'obra-df');
  assert.equal(row(s,'obra1').disponivel,65);
  s=E.reconcile(s,'obra1',[{key:row(s,'obra1').key,qtd:60}],filial,meta('conferencia'));
  assert.equal(row(s,'obra1').instalado,60);assert.equal(row(s,'obra1').disponivel,5);
  assert.equal(physical(s),100);
  assert.throws(()=>E.finalize(s,'obra1',filial,meta('fechar')),/sobras/);
  s=transfer(s,'obra1',stock,5,'sobras-df');
  assert.equal(row(s,'obra1').disponivel,0);
  assert.throws(()=>E.finalize(s,'obra1',filial,meta('fechar')),/trânsito/);
  s=receive(s,'sobras-df');s=E.finalize(s,'obra1',filial,meta('fechar'));
  assert.equal(E.getLocation(s,'obra1').finalizada,true);
  const report=E.report(s,'obra1');assert.equal(report.itens[0].solicitado,80);assert.equal(report.itens[0].instalado,60);assert.equal(report.itens[0].diferenca,20);
  assert.equal(report.itens[0].disponivel,0);assert.equal(report.itens[0].enviado,20);
  assert.equal(physical(s),100);
  assert.deepEqual([row(s,'estoque-go').disponivel,row(s,'obra2').disponivel,row(s,stock).disponivel],[20,10,10]);
});
test('medidas equivalentes e cores antigas normalizam; variantes ficam separadas',()=>{
  assert.equal(E.keyOf(piece(1,{ma:'4,60',cor:'Estrutura Branca'})),E.keyOf(piece(1,{ma:'4.6',cor:'branca'})));
  assert.notEqual(E.keyOf(piece(1,{ma:'4,60'})),E.keyOf(piece(1,{ma:'4,30'})));
  assert.notEqual(E.keyOf(piece(1)),E.keyOf(piece(1,{cor:'Preta'})));
  assert.equal(E.keyOf({catalogo_id:'c2',desc:'TELA COMPLETA SOMBRITE 2 VG',un:'UNID',cor_tela:'Tela Prata'}),E.keyOf({catalogo_id:'c2',desc:'TELA COMPLETA SOMBRITE 2 VG',un:'UN',cor:'Prata'}));
  let s=ready();s=E.addStock(s,'estoque-go',[piece(5,{cor:'Preta'}),piece(3,{ma:'4,60'})],sede,meta('variantes'));
  assert.equal(E.balances(s,'estoque-go').length,3);
  assert.deepEqual(E.balances(s,'estoque-go').map(b=>b.disponivel),[100,5,3]);
});
test('cor recebida diferente do condomínio permanece SKU distinto da demanda',()=>{
  let s=E.createFolder(empty(),details('obra1',{cor_estrutura:'Preta'}),filial);
  s=E.addDemand(s,'obra1',[piece(5,{cor:'Preta'})],filial,meta('demanda-preta'));
  s=E.addStock(s,'estoque-go',[piece(5)],sede,meta('brancas'));
  s=receive(transfer(s,'estoque-go','obra1',5,'brancas-obra'),'brancas-obra');
  const rows=E.balances(s,'obra1');assert.equal(rows.length,2);
  assert.deepEqual(rows.map(b=>[b.peca.cor,b.solicitado,b.disponivel]),[['Preta',5,0],['Branca',0,5]]);
});
test('bloqueia saldo negativo, zero, repetição, destino igual e envio duplicado',()=>{
  const s=ready(),k=key(s);
  for(const n of [101,0,-1,Infinity,NaN,1.2])assert.throws(()=>E.transfer(s,'estoque-go','obra1',[{key:k,qtd:n}],sede,meta('bad')));
  assert.throws(()=>E.transfer(s,'estoque-go','estoque-go',[{key:k,qtd:1}],sede,meta('bad')),/diferente/);
  assert.throws(()=>E.transfer(s,'estoque-go','obra1',[{key:k,qtd:1},{key:k,qtd:2}],sede,meta('bad')),/duas vezes/);
  const sent=transfer(s,'estoque-go','obra1',1,'once');
  assert.throws(()=>transfer(sent,'estoque-go','obra1',1,'once'),/Já registrado/);
  assert.throws(()=>E.addStock(s,'estoque-go',[piece(1)],sede,meta('producao')),/Já registrado/);
});
test('unidade contínua aceita decimais sem perder conservação',()=>{
  let s=create(empty());s=E.addStock(s,'estoque-go',[piece(12.5,{un:'M²'})],sede,meta('metro'));
  s=receive(transfer(s,'estoque-go','obra1',2.25,'metro-obra'),'metro-obra');
  assert.equal(row(s,'obra1').disponivel,2.25);assert.equal(row(s,'estoque-go').disponivel,10.25);assert.equal(physical(s),12.5);
});
test('permissões dos depósitos, transferências, recebimentos e conferência',()=>{
  let s=ready();s=create(s,'mg',outra);
  assert.throws(()=>E.addStock(s,'estoque-go',[piece(1)],filial,meta('x')),/perfil/);
  assert.throws(()=>E.addStock(s,stock,[piece(1)],filial,meta('x')),/justificativa/);
  assert.throws(()=>E.addStock(s,stock,[piece(1)],sede,meta('x','origem')),/perfil/);
  s=E.addStock(s,stock,[piece(5)],filial,meta('entrada-df','Sobras conferidas'));
  assert.throws(()=>E.transfer(s,stock,'mg',[{key:row(s,stock).key,qtd:1}],filial,meta('x')),/próprio estoque/);
  assert.throws(()=>E.transfer(s,stock,'estoque-go',[{key:row(s,stock).key,qtd:1}],filial,meta('x')),/próprio estoque/);
  assert.throws(()=>E.transfer(s,stock,'obra1',[{key:row(s,stock).key,qtd:1}],sede,meta('x')),/GO/);
  s=transfer(s,'estoque-go','obra1',5,'go');
  assert.throws(()=>receive(s,'go',sede),/responsável pelo destino/);
  assert.throws(()=>receive(s,'go',outra),/responsável pelo destino/);
  assert.throws(()=>E.reconcile(s,'obra1',[],sede,meta('x')),/filial responsável/);
});
test('conferência de fechamento usa total instalado, só baixa diferença e não duplica',()=>{
  let s=receive(transfer(ready(),'estoque-go','obra1',80,'go'),'go'),k=row(s,'obra1').key;
  assert.throws(()=>E.reconcile(s,'obra1',[{key:k,qtd:81}],filial,meta('excesso')),/ultrapassa/);
  s=E.reconcile(s,'obra1',[{key:k,qtd:60}],filial,meta('inst60'));
  const count=s.movimentos.length,again=E.reconcile(s,'obra1',[{key:k,qtd:60}],filial,meta('mesmototal'));
  assert.equal(again.movimentos.length,count);assert.equal(row(again,'obra1').disponivel,20);
  s=E.reconcile(s,'obra1',[{key:k,qtd:65}],filial,meta('inst65'));
  assert.equal(row(s,'obra1').disponivel,15);
  assert.throws(()=>E.reconcile(s,'obra1',[{key:k,qtd:60}],filial,meta('correcao')),/Justifique/);
  s=E.reconcile(s,'obra1',[{key:k,qtd:60}],filial,meta('correcao','Corrigido após conferência física'));
  assert.equal(row(s,'obra1').instalado,60);assert.equal(row(s,'obra1').disponivel,20);
});
test('fechamento exige conferência e bloqueia novas alterações; reabertura é auditada',()=>{
  let s=create(empty());
  assert.throws(()=>E.finalize(s,'obra1',filial,meta('fechar')),/Confira/);
  s=E.reconcile(s,'obra1',[],filial,meta('conferencia-vazia'));
  s=E.finalize(s,'obra1',filial,meta('fechar'));
  const frozen=E.report(s,'obra1'),before=clone(s);
  assert.throws(()=>E.addDemand(s,'obra1',[piece(1)],filial,meta('x')),/finalizada/);
  assert.throws(()=>E.reconcile(s,'obra1',[],filial,meta('x')),/finalizada/);
  assert.throws(()=>E.reopen(s,'obra1',filial,meta('x','motivo')),/Somente a sede/);
  assert.throws(()=>E.reopen(s,'obra1',sede,meta('x')),/motivo/);
  const reopened=E.reopen(s,'obra1',sede,meta('reabrir','Retomar serviço complementar'));
  assert.equal(E.getLocation(reopened,'obra1').finalizada,false);
  assert.deepEqual(reopened.pastas[0].relatorios_finais[0],frozen);
  assert.deepEqual(s,before);
  assert.equal(reopened.pastas[0].conferencia_fechamento,undefined);
  frozen.itens.push({injetado:true});assert.deepEqual(E.report(s,'obra1'),before.pastas[0].relatorio_final);
});
test('legado mantém saldo desconhecido, remessas pendentes e nenhuma entrada presumida',()=>{
  const old={id:'antigo',cliente:'Obra antiga',filial_id:'df',filial_nome:'Sombrear DF',status:'em_fabricacao',criado:'2026-10-20',cor_estrutura:'Estrutura Branca',cor_tela:'Tela Prata',itens:[{id:'i-old',desc:'PILAR SOMBRITE MA',ma:'2,40',mb:'0,00',mc:'0,00',un:'PÇ',qtd:80,item_status:'aprovado'}],remessas:[{id:'recebida',data:'2026-10-20',recebido_em:'2026-10-21',itens:[{item_id:'i-old',qtd:60}]},{id:'pendente',data:'2026-10-25',itens:[{item_id:'i-old',qtd:20}]}],log:[{status:'em_fabricacao'}]};
  const originals=[clone(old)];let s=E.fromRecords(originals,filiais,cat);
  assert.deepEqual(originals,[old]);assert.equal(E.getLocation(s,'antigo').conhecido,false);
  assert.equal(row(s,'antigo').disponivel,0);assert.equal(row(s,'antigo').historico_recebido,60);assert.equal(row(s,'antigo').em_transito_entrada,20);
  assert.equal(E.pendingTransfers(s,'antigo').length,1);
  const movement=E.pendingTransfers(s,'antigo')[0];assert.equal(movement.origem_id,'origem-legada');
  assert.throws(()=>receive(s,movement.id),/estoque inicial/);
  s=E.legacyInitial(s,'antigo',[{key:row(s,'antigo').key,disponivel:10,instalado:50}],filial,meta('inventario'));
  assert.deepEqual([row(s,'antigo').disponivel,row(s,'antigo').instalado,row(s,'antigo').em_transito_entrada],[10,50,20]);
  s=receive(s,movement.id);
  assert.deepEqual([row(s,'antigo').disponivel,row(s,'antigo').instalado,row(s,'antigo').em_transito_entrada],[30,50,0]);
  assert.throws(()=>E.legacyInitial(s,'antigo',[],filial,meta('again')),/já foi conferido/);
  const reloaded=E.fromRecords(E.toRecords(s),filiais,cat);
  assert.equal(reloaded.movimentos.length,s.movimentos.length);assert.equal(E.pendingTransfers(reloaded,'antigo').length,0);
  assert.equal(row(reloaded,'antigo').disponivel,30);assert.deepEqual(reloaded.pastas[0].remessas,old.remessas);
});
test('serialização usa um meta discriminado e preserva dados adicionais das pastas',()=>{
  let s=ready();s.pastas[0].observacao_customizada='preservada';
  const raw=E.toRecords(s),metaRecord=raw.find(r=>r.tipo_registro==='controle_estoque');
  assert.equal(metaRecord.id,'__estoques_sombrear');assert.equal(raw.length,2);
  assert.deepEqual(E.fromRecords(raw,filiais,cat),s);
  assert.throws(()=>E.fromRecords(raw.concat([metaRecord]),filiais,cat),/inconsistente/);
});
test('datas inválidas e instalação maior que estoque não alteram input',()=>{
  const s=ready(),before=clone(s);
  assert.throws(()=>E.addStock(s,'estoque-go',[piece(1)],sede,{id:'data',data:'2026-02-30'}),/data válida/);
  assert.throws(()=>E.addStock(s,'estoque-go',[piece(1)],sede,{id:'futuro',data:'2026-10-30'}),/data válida/);
  assert.deepEqual(s,before);
});
test('peça customizada mantém identidade histórica quando aparece depois no catálogo',()=>{
  let s=create(empty());
  const custom=piece(5,{catalogo_id:null,desc:'SUPORTE ESPECIAL'});
  s=E.addDemand(s,'obra1',[custom],filial,meta('especial'));
  s=E.addStock(s,'estoque-go',[custom],sede,meta('entrada-especial'));
  s=receive(transfer(s,'estoque-go','obra1',5,'especial-obra'),'especial-obra');
  const keyBefore=row(s,'obra1').key;
  const extended=cat.concat([{id:'c-novo',desc:'SUPORTE ESPECIAL'}]);
  s=E.fromRecords(E.toRecords(s),filiais,extended);
  assert.equal(E.balances(s,'obra1').length,1);
  assert.equal(row(s,'obra1').key,keyBefore);
  assert.equal(row(s,'obra1').solicitado,5);
  assert.equal(row(s,'obra1').disponivel,5);
});
