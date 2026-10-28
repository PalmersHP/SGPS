const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../pedidos-core.js');
const filial={role:'filial',filial_id:'df',filial_nome:'Sombrear DF',nome:'Filial',data:'2026-10-28'};
const sede={role:'sede',nome:'Sede',data:'2026-10-28'};
const details={cliente:'Condomínio Riacho 33',cor_estrutura:'Branca',cor_tela:'Prata',vagas:130};
const item=(qtd=80,extra={})=>({desc:'PILAR SOMBRITE MA',ma:'2,40',mb:'0,00',mc:'0,00',un:'PÇ',qtd,preco_unit:100,...extra});
const order=()=>P.create(details,[item()],filial);
const shipment=(id='r1')=>({id,data:'2026-10-28',obs:'Transporte teste'});
const send=(p,qtd,id='r1')=>P.send(p,[{item_id:p.itens[0].id,qtd}],sede,shipment(id));

test('pedido → aceite → duas remessas → recebimentos sem alterar o solicitado',()=>{
  const initial=order();
  assert.equal(initial.status,'aguardando');
  const accepted=P.approve(initial,sede);
  assert.equal(initial.itens[0].item_status,'aguardando');
  let p=send(accepted,30);
  assert.deepEqual(P.balances(p).map(b=>[b.pedido,b.enviado,b.saldo]),[[80,30,50]]);
  p=P.receive(p,'r1',filial);
  assert.equal(p.status,'em_fabricacao');
  p=send(p,50,'r2');
  assert.equal(p.status,'em_transito');
  p=P.receive(p,'r2',filial);
  assert.equal(p.status,'entregue');
  assert.equal(P.balances(p)[0].recebido,80);
  assert.equal(p.itens[0].qtd,80);
});
test('impede envio sem aprovação, acima do saldo, negativo, vazio ou duplicado',()=>{
  const p=P.approve(order(),sede);
  assert.throws(()=>send(order(),1),/aceitar/);
  assert.throws(()=>send(p,81),/ultrapassa/);
  assert.throws(()=>send(p,-1),/quantidade/);
  assert.throws(()=>P.send(p,[],sede,shipment()),/pelo menos/);
  assert.throws(()=>P.send(p,[{item_id:p.itens[0].id,qtd:1},{item_id:p.itens[0].id,qtd:1}],sede,shipment()),/duas vezes/);
  const sent=send(p,30);
  assert.throws(()=>send(sent,51,'r2'),/ultrapassa/);
  assert.throws(()=>send(sent,10),/já foi registrado/);
});
test('complementos preservam envios e dependem de um novo aceite',()=>{
  const original=send(P.approve(order(),sede),30);
  const added=P.add(original,[item(20)],filial);
  assert.equal(added.status,'aguardando');
  assert.deepEqual(added.remessas,original.remessas);
  assert.equal(added.itens[0].id,original.itens[0].id);
  assert.notEqual(added.itens[1].id,added.itens[0].id);
  assert.deepEqual(P.balances(added).map(b=>[b.pedido,b.enviado,b.saldo]),[[80,30,50],[20,0,20]]);
  assert.throws(()=>P.send(added,[{item_id:added.itens[1].id,qtd:1}],sede,shipment('r2')),/aceitar/);
  const approved=P.approve(added,sede);
  assert.equal(approved.itens[1].item_status,'aprovado');
  assert.deepEqual(approved.remessas,original.remessas);
});
test('pedido entregue aceita complemento e reabre sem apagar o histórico',()=>{
  const delivered=P.receive(send(P.approve(order(),sede),80),'r1',filial);
  const p=P.add(delivered,[item(5)],filial);
  assert.equal(p.status,'aguardando');
  assert.equal(P.balances(p)[0].saldo,0);
  assert.equal(P.balances(p)[1].saldo,5);
  assert.ok(p.remessas[0].recebido_em);
});
test('mesma peça com medidas diferentes mantém saldos independentes',()=>{
  const p=P.approve(P.create(details,[item(80,{ma:'4,30'}),item(20,{ma:'4,60'})],filial),sede);
  const sent=P.send(p,[{item_id:p.itens[1].id,qtd:10}],sede,shipment());
  assert.deepEqual(P.balances(sent).map(b=>b.saldo),[80,10]);
});
test('quantidades fracionárias apenas nas unidades adequadas',()=>{
  assert.throws(()=>P.create(details,[item(1.5)],filial),/inteiro/);
  let p=P.approve(P.create(details,[item(12.5,{un:'M²'})],filial),sede);
  p=send(p,2.25);
  assert.equal(P.balances(p)[0].saldo,10.25);
  for(const bad of [NaN,Infinity,-1,0,'abc'])assert.throws(()=>P.create(details,[item(bad)],filial),/quantidade/);
});
test('perfis e filiais têm limites para aceite, complemento, envio e recebimento',()=>{
  const p=P.approve(order(),sede);
  assert.throws(()=>P.approve(p,filial),/perfil/);
  assert.throws(()=>P.add(p,[item(1)],sede),/perfil/);
  assert.throws(()=>P.add(p,[item(1)],{...filial,filial_id:'outra'}),/perfil/);
  assert.throws(()=>P.send(p,[{item_id:p.itens[0].id,qtd:1}],filial,shipment()),/perfil/);
  assert.throws(()=>P.receive(send(p,1),'r1',sede),/perfil/);
  assert.throws(()=>P.add({...p,inativo:true},[item(1)],filial),/inativo/);
});
test('pedidos antigos exigem conferência dos envios anteriores, sem inventar saldo',()=>{
  const legacy={...order(),status:'em_fabricacao'};
  delete legacy.versao_pedido;delete legacy.saldo_inicial_confirmado;
  delete legacy.itens[0].id;
  assert.equal(P.known(legacy),false);
  assert.throws(()=>send(legacy,1),/anteriores/);
  const p=P.baseline(legacy,[{item_id:'legado-0',qtd:30}],sede,shipment());
  assert.equal(P.known(p),true);
  assert.equal(P.balances(p)[0].saldo,50);
  assert.equal(p.remessas[0].anterior,true);
  assert.throws(()=>P.baseline(p,[],sede,shipment('r2')),/já foi conferido/);
});
test('saldo inicial zero é explícito e não inventa remessa',()=>{
  const legacy={...order(),versao_pedido:1};
  const p=P.baseline(legacy,[],sede,shipment());
  assert.equal(P.known(p),true);
  assert.equal(p.remessas.length,0);
  assert.equal(P.balances(p)[0].saldo,80);
});
test('revisão preserva peças aprovadas, identificadores e complementos concorrentes',()=>{
  const original=order();
  const concurrent=P.add(original,[item(5)],filial);
  const p=P.edit(concurrent,[{...original.itens[0],qtd:90}],filial,original.itens);
  assert.equal(p.itens[0].id,original.itens[0].id);
  assert.deepEqual(p.itens.map(it=>it.qtd),[90,5]);
  const removed=P.edit(concurrent,[],filial,original.itens);
  assert.equal(removed.itens[0].id,concurrent.itens[1].id);
  assert.throws(()=>P.edit(P.approve(original,sede),original.itens,filial,original.itens),/aprovada/);
  assert.throws(()=>P.edit(original,[],filial,original.itens),/pelo menos/);
});
test('revisão desatualizada não sobrescreve edição de outra pessoa',()=>{
  const p=order(),changed=P.edit(p,[{...p.itens[0],qtd:90}],filial,p.itens);
  assert.throws(()=>P.edit(changed,[{...p.itens[0],qtd:95}],filial,p.itens),/outro usuário/);
});
test('status de produção e impressão não servem para abater quantidades',()=>{
  const original=P.approve(order(),sede);
  for(const state of ['aprovado','em_fabricacao','pronto_envio']){
    const p=P.production(original,original.itens[0].id,state,sede);
    assert.equal(P.balances(p)[0].enviado,0);
    assert.equal(P.balances(p)[0].saldo,80);
  }
  assert.throws(()=>P.production(original,original.itens[0].id,'entregue',sede),/remessas/);
});
test('linhas antigas com quantidade zero não contam como peças a conferir',()=>{
  const p=order();p.itens.push({...item(0),id:'zero',item_status:'aguardando'});
  const accepted=P.approve(p,sede);
  assert.equal(accepted.itens[1].item_status,'aguardando');
  assert.equal(accepted.status,'em_fabricacao');
  assert.throws(()=>P.approve(accepted,sede),/Não há peças/);
});
