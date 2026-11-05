const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const E=require('../estoque-core.js');
const {createOperations}=require('../mcp-sombrear/operacoes.cjs');

const clone=value=>JSON.parse(JSON.stringify(value));
const date='2026-11-04T15:00:00.000Z';
const sede={id:'u-sede',nome:'Operador Sede',role:'sede',auth_id:'auth-sede'};
const admin={id:'u-admin',nome:'Administrador Real',role:'sede',gerenciar_todas_filiais:true,auth_id:'auth-admin'};
const df={id:'u-df',nome:'Operador DF',role:'filial',filial_id:'df',auth_id:'auth-df'};
const mg={id:'u-mg',nome:'Operador MG',role:'filial',filial_id:'mg',auth_id:'auth-mg'};
const filiais=[{id:'df',nome:'Sombrear DF',ativo:true},{id:'mg',nome:'Sombrear MG',ativo:true}];
const catalogo=[{id:'pilar',desc:'PILAR MA',un:'PÇ',preco:12,ma:'2,40',campo_interno:'nao-retornar'},{id:'tela',desc:'TELA COMPLETA',un:'UNID',preco:20}];
const usuarios=[sede,df,mg,{...admin,role:'filial',filial_id:'df'}].map(u=>({...u,ativo:true,senha:'senha-fixture-nao-retornar'}));
const coreCtx=p=>({...p,data:'2026-11-04',agora:date,filial_nome:filiais.find(f=>f.id===p.filial_id)?.nome||''});
const item=(qtd,extra={})=>({catalogo_id:'pilar',qtd,...extra});
const coreItem=(qtd,extra={})=>({catalogo_id:'pilar',desc:'PILAR MA',un:'PÇ',ma:'2,40',mb:'0,00',mc:'0,00',cor:'Branca',qtd,...extra});
const operation=extra=>({operation_id:randomUUID(),...extra});
const baseFolder=(id,p=df)=>({id,cliente:'Obra '+id,filial_id:p.filial_id,cor_estrutura:'Branca',cor_tela:'Prata',vagas:100});
function memory(initial){
  const db={records:E.toRecords(initial||E.fromRecords([],filiais,catalogo)),version:1,attempts:0,writes:0,usuarios:clone(usuarios),beforeWrite:null,loseResponse:false};
  db.state=()=>E.fromRecords(clone(db.records),filiais,catalogo);
  db.read=async()=>({state:db.state(),filiais:clone(filiais),catalogo:clone(catalogo),usuarios:clone(db.usuarios),version:db.version});
  db.commit=s=>{db.records=E.toRecords(s);db.version++;};
  db.write=async(s,version)=>{
    db.attempts++;
    if(db.beforeWrite)await db.beforeWrite(s,version);
    if(version!==db.version)throw Object.assign(new Error('concurrent update'),{code:'CONFLICT'});
    db.commit(s);db.writes++;
    if(db.loseResponse){db.loseResponse=false;throw new Error('response lost');}
    return db.version;
  };
  return db;
}
const api=db=>createOperations({store:db,now:()=>date});
async function call(ops,name,args,principal=sede){return (await ops.callTool(name,args,principal)).structuredContent;}
async function good(ops,name,args,principal=sede){const result=await call(ops,name,args,principal);assert.equal(result.ok,true,JSON.stringify(result));return result;}
function prepared(){
  let state=E.fromRecords([],filiais,catalogo);
  state=E.createFolder(state,baseFolder('df-obra'),coreCtx(df));
  state=E.createFolder(state,baseFolder('mg-obra',mg),coreCtx(mg));
  state=E.addStock(state,'estoque-go',[coreItem(100)],coreCtx(sede),{id:'producao-base'});
  return state;
}
const key=(state,local='estoque-go')=>E.balances(state,local)[0].key;
const saldo=(state,local,cor='Branca')=>E.balances(state,local).find(row=>row.peca.cor===cor)?.disponivel||0;

test('tools têm schemas estritos, OAuth OIDC e annotations; argumentos inválidos não gravam',async()=>{
  const db=memory(),ops=api(db),tools=ops.listTools();
  assert.equal(tools.length,19);
  for(const tool of tools){
    assert.equal(tool.inputSchema.additionalProperties,false);
    assert.deepEqual(tool.securitySchemes,[{type:'oauth2',scopes:[]}]);
    assert.equal(tool.annotations.openWorldHint,false);assert.equal(tool.annotations.idempotentHint,true);
  }
  assert.equal(tools.find(t=>t.name==='consultar_saldo').annotations.readOnlyHint,true);
  assert.equal(tools.find(t=>t.name==='finalizar_obra').annotations.destructiveHint,true);
  assert.equal((await call(ops,'registrar_entrada',{...operation({local_id:'estoque-go',itens:[item(1,{cor:'Branca'})]}),role:'sede'})).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'registrar_entrada',{operation_id:'nao-e-uuid',local_id:'estoque-go',itens:[item(1,{cor:'Branca'})]})).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[item(1,{cor:'Branca',senha:'injetada'})]}))).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[item(-1,{cor:'Branca'})]}))).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'listar_catalogo',{limit:0})).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'criar_pasta',operation({condominio:'Prioridade inválida',cor_estrutura:'Branca',cor_tela:'Prata',vagas:10,prioridade:'P4'}),df)).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'nao_existe',{})).error.code,'UNKNOWN_TOOL');
  assert.equal(db.writes,0);
});

test('fluxo 100/50 usa catálogo, cores da pasta, autoria real e replay durável',async()=>{
  const db=memory(),ops=api(db);
  const folderArgs=operation({contexto_filial_id:'df',condominio:'Riacho 33',cor_estrutura:'Preta',cor_tela:'Prata',vagas:130,prioridade:'P1'});
  const folder=await good(ops,'criar_pasta',folderArgs,admin),pasta=folder.data.pasta_id;
  assert.equal(pasta,'p-mcp-'+folderArgs.operation_id);
  assert.equal((await good(ops,'consultar_local',{local_id:pasta},admin)).data.local.pasta.prioridade,'P1');
  const stockArgs=operation({local_id:'estoque-go',itens:[item(100,{cor:'Preta'})]});
  const stockResult=await good(ops,'registrar_entrada',stockArgs);
  const demand=await good(ops,'solicitar_pecas',operation({contexto_filial_id:'df',pasta_id:pasta,itens:[item(100)]}),admin);
  let state=db.state(),request=E.requests(state,pasta)[0],k=request.itens[0].key;
  assert.equal(request.id,demand.data.solicitacao_id);assert.equal(request.itens[0].peca.cor,'Preta');assert.equal(request.itens[0].peca.ma,'2,40');
  const sent=await good(ops,'enviar_solicitacao',operation({solicitacao_id:request.id,itens:[{key:k,qtd:50}]}));
  assert.equal(E.requests(db.state(),pasta)[0].itens[0].pendente,50);
  assert.equal(saldo(db.state(),'estoque-go','Preta'),50);assert.equal(saldo(db.state(),pasta,'Preta'),0);
  await good(ops,'confirmar_recebimento',operation({movimento_id:sent.data.movimento_ids[0]}),df);
  assert.equal(saldo(db.state(),pasta,'Preta'),50);
  const count=db.writes,restarted=api(db);
  assert.deepEqual(await good(restarted,'registrar_entrada',stockArgs),stockResult);
  assert.deepEqual(await good(restarted,'criar_pasta',folderArgs,admin),folder);
  assert.equal(db.writes,count);assert.equal(saldo(db.state(),'estoque-go','Preta'),50);
  for(const movement of db.state().movimentos){
    assert.equal(movement.auditoria_mcp.canal,'mcp');assert.ok(movement.operacao_mcp.hash);
    if(movement.tipo==='pasta_criada'||movement.tipo==='demanda'){
      assert.equal(movement.usuario_id,admin.id);assert.equal(movement.usuario_nome,admin.nome);
      assert.equal(movement.auditoria_mcp.principal_id,admin.id);assert.equal(movement.auditoria_mcp.auth_id,admin.auth_id);
      assert.equal(movement.auditoria_mcp.perfil_efetivo,'filial');assert.equal(movement.auditoria_mcp.filial_id,'df');
    }
  }
});

test('idempotência rejeita mesmo UUID com outro conteúdo ou operador',async()=>{
  const db=memory(),ops=api(db),args=operation({local_id:'estoque-go',itens:[item(100,{cor:'Branca'})]});
  await good(ops,'registrar_entrada',args);
  assert.equal((await call(ops,'registrar_entrada',{...args,itens:[item(200,{cor:'Branca'})]})).error.code,'IDEMPOTENCY_CONFLICT');
  assert.equal((await call(ops,'registrar_entrada',args,admin)).error.code,'IDEMPOTENCY_CONFLICT');
  assert.equal(db.writes,1);assert.equal(saldo(db.state(),'estoque-go'),100);
  assert.equal((await good(ops,'registrar_entrada',{...args,operation_id:args.operation_id.toUpperCase()})).operation_id,args.operation_id);
});

test('resposta perdida depois de gravar é recuperada sem duplicar entrada',async()=>{
  const db=memory(),args=operation({local_id:'estoque-go',itens:[item(10,{cor:'Branca'})]});db.loseResponse=true;
  assert.equal((await call(api(db),'registrar_entrada',args)).error.code,'WRITE_FAILED');
  assert.equal(saldo(db.state(),'estoque-go'),10);
  const recovered=await good(api(db),'registrar_entrada',args);
  assert.equal(recovered.operation_id,args.operation_id);assert.equal(db.writes,1);assert.equal(saldo(db.state(),'estoque-go'),10);
});

test('CAS relê e revalida operação sem perder entrada concorrente',async()=>{
  const db=memory(prepared()),ops=api(db),k=key(db.state());let concurrent=true;
  db.beforeWrite=()=>{if(concurrent){concurrent=false;db.commit(E.addStock(db.state(),'estoque-go',[coreItem(5,{cor:'Preta'})],coreCtx(sede),{id:'entrada-concorrente'}));}};
  const args=operation({origem_id:'estoque-go',destino_id:'df-obra',itens:[{key:k,qtd:80}]});
  await good(ops,'remanejar_pecas',args);
  assert.equal(db.attempts,2);assert.equal(saldo(db.state(),'estoque-go'),20);assert.equal(saldo(db.state(),'estoque-go','Preta'),5);
  assert.equal(db.state().movimentos.filter(m=>m.operacao_mcp?.id===args.operation_id).length,1);
});

test('conflito que consome saldo impede retry inválido; conflitos contínuos param em três tentativas',async()=>{
  const db=memory(prepared()),k=key(db.state());let concurrent=true;
  db.beforeWrite=()=>{if(concurrent){concurrent=false;db.commit(E.transfer(db.state(),'estoque-go','mg-obra',[{key:k,qtd:30}],coreCtx(sede),{id:'envio-concorrente'}));}};
  const result=await call(api(db),'remanejar_pecas',operation({origem_id:'estoque-go',destino_id:'df-obra',itens:[{key:k,qtd:80}]}));
  assert.equal(result.error.code,'VALIDATION_ERROR');assert.match(result.error.message,/ultrapassa/);
  assert.equal(saldo(db.state(),'estoque-go'),70);assert.equal(E.pendingTransfers(db.state(),'df-obra').length,0);
  const racing=memory(prepared());racing.beforeWrite=()=>{racing.version++;};
  const conflict=await call(api(racing),'remanejar_pecas',operation({origem_id:'estoque-go',destino_id:'df-obra',itens:[{key:key(racing.state()),qtd:1}]}));
  assert.equal(conflict.error.code,'CONFLICT');assert.equal(racing.attempts,3);assert.equal(racing.writes,0);
});

test('leituras da filial isolam pastas, solicitações e histórico de outras filiais',async()=>{
  let state=prepared(),k=key(state);
  state=E.addDemand(state,'df-obra',[coreItem(10)],coreCtx(df),{id:'pedido-df'});
  state=E.addDemand(state,'mg-obra',[coreItem(12)],coreCtx(mg),{id:'pedido-mg'});
  state=E.transfer(state,'estoque-go','mg-obra',[{key:k,qtd:12}],coreCtx(sede),{id:'envio-mg'});
  const db=memory(state),ops=api(db);
  const locals=await good(ops,'listar_locais',{},df);
  assert.deepEqual(new Set(locals.data.itens.map(l=>l.id)),new Set(['estoque-go','estoque-filial-df','df-obra']));
  assert.equal((await good(ops,'listar_solicitacoes',{},df)).data.total,1);
  assert.equal((await good(ops,'listar_transferencias_pendentes',{},df)).data.total,0);
  assert.equal((await good(ops,'consultar_historico',{local_id:'estoque-go'},df)).data.itens.some(m=>m.id==='envio-mg'),false);
  assert.equal((await good(ops,'consultar_historico',{local_id:'estoque-go'},df)).data.total,0);
  const go=await good(ops,'consultar_local',{local_id:'estoque-go'},df);
  assert.equal(go.data.transferencias_pendentes.length,0);assert.equal(go.data.solicitacoes.length,0);
  assert.equal(go.data.saldos[0].disponivel,88);
  assert.equal((await good(ops,'consultar_historico',{},df)).data.itens.some(m=>m.id==='envio-mg'||m.id==='producao-base'),false);
  assert.equal((await call(ops,'consultar_local',{local_id:'mg-obra'},df)).error.code,'NOT_FOUND');
  assert.equal((await call(ops,'consultar_relatorio',{pasta_id:'mg-obra'},df)).error.code,'NOT_FOUND');
  assert.equal((await call(ops,'listar_solicitacoes',{pasta_id:'mg-obra'},df)).error.code,'NOT_FOUND');
  assert.equal((await call(ops,'listar_locais',{filial_id:'mg'},df)).error.code,'FORBIDDEN');
  assert.deepEqual((await good(ops,'listar_filiais',{},df)).data.itens.map(f=>f.id),['df']);
  const catalog=await good(ops,'listar_catalogo',{},df);
  assert.equal(JSON.stringify(catalog).includes('nao-retornar'),false);
  const operator=await good(ops,'contexto_operador',{},admin);
  assert.equal(operator.data.contextos.length,3);assert.equal(JSON.stringify(operator).includes('senha-fixture'),false);
  assert.equal((await good(ops,'listar_locais',{},sede)).data.total,5);
  assert.equal(db.writes,0);
});

test('papéis e contextos não são escolhidos livremente; usuário inativo ou removido é bloqueado',async()=>{
  const db=memory(prepared()),ops=api(db),folderArgs=operation({condominio:'Nova',cor_estrutura:'Branca',cor_tela:'Prata',vagas:10,contexto_filial_id:'df'});
  assert.equal((await call(ops,'criar_pasta',folderArgs,sede)).error.code,'FORBIDDEN');
  assert.equal((await call(ops,'criar_pasta',folderArgs,df)).error.code,'FORBIDDEN');
  assert.equal((await call(ops,'criar_pasta',{...folderArgs,contexto_filial_id:'inexistente'},admin)).error.code,'FORBIDDEN');
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[item(1,{cor:'Branca'})]}),df)).error.code,'VALIDATION_ERROR');
  const sent=await good(ops,'remanejar_pecas',operation({origem_id:'estoque-go',destino_id:'mg-obra',itens:[{key:key(db.state()),qtd:1}]}));
  assert.equal((await call(ops,'confirmar_recebimento',operation({movimento_id:sent.data.movimento_ids[0]}),df)).error.code,'NOT_FOUND');
  db.usuarios.find(u=>u.id===df.id).ativo=false;
  assert.equal((await call(ops,'listar_locais',{},df)).error.code,'FORBIDDEN');
  db.usuarios=db.usuarios.filter(u=>u.id!==admin.id);
  assert.equal((await call(ops,'contexto_operador',{},admin)).error.code,'FORBIDDEN');
  assert.equal((await call(ops,'contexto_operador',{},null)).error.code,'UNAUTHORIZED');
});

test('fechamento exige confirmação, snapshot fresco e trânsito zerado; relatório guarda auditoria',async()=>{
  let state=prepared(),k=key(state);
  state=E.addDemand(state,'df-obra',[coreItem(100)],coreCtx(df),{id:'pedido-fechamento'});
  state=E.transfer(state,'estoque-go','df-obra',[{key:k,qtd:50}],coreCtx(sede),{id:'primeiro-envio'});
  state=E.receive(state,'primeiro-envio',coreCtx(df),{id:'primeiro-recebimento'});
  const db=memory(state),ops=api(db),preview=(await good(ops,'prever_fechamento',{pasta_id:'df-obra'},df)).data;
  assert.equal(preview.itens[0].instalado_final,50);assert.equal(preview.solicitacoes_a_arquivar[0].itens[0].pendente,50);
  const closeArgs=operation({pasta_id:'df-obra',expected:preview.expected,confirmar_sobras_remanejadas:true});
  assert.equal((await call(ops,'finalizar_obra',{...closeArgs,confirmar_sobras_remanejadas:false},df)).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'finalizar_obra',closeArgs,sede)).error.code,'VALIDATION_ERROR');
  const sent=await good(ops,'remanejar_pecas',operation({origem_id:'estoque-go',destino_id:'df-obra',itens:[{key:k,qtd:10}]}));
  assert.match((await call(ops,'finalizar_obra',closeArgs,df)).error.message,/trânsito/);
  await good(ops,'confirmar_recebimento',operation({movimento_id:sent.data.movimento_ids[0]}),df);
  assert.match((await call(ops,'finalizar_obra',closeArgs,df)).error.message,/estoque mudou/);
  const fresh=(await good(ops,'prever_fechamento',{pasta_id:'df-obra'},df)).data;
  const updatedArgs={...closeArgs,expected:fresh.expected};
  const closed=await good(ops,'finalizar_obra',updatedArgs,df);
  assert.equal(closed.data.instalado[0].qtd,60);assert.equal(saldo(db.state(),'df-obra'),0);
  assert.equal(E.requests(db.state(),'df-obra')[0].ativo,false);
  const report=(await good(ops,'consultar_relatorio',{pasta_id:'df-obra'},df)).data;
  assert.equal(report.itens[0].instalado,60);
  assert.equal(report.movimentacoes.at(-1).auditoria_mcp.principal_id,df.id);
  assert.equal(report.movimentacoes.at(-1).operacao_mcp,undefined);
  const count=db.writes;assert.deepEqual(await good(api(db),'finalizar_obra',updatedArgs,df),closed);assert.equal(db.writes,count);
  await good(ops,'reabrir_obra',operation({pasta_id:'df-obra',justificativa:'Retomar serviço'}),sede);
  assert.equal(E.requests(db.state(),'df-obra')[0].ativo,true);assert.equal(E.requests(db.state(),'df-obra')[0].itens[0].pendente,40);
});

test('catálogo é autoridade para descrição/unidade e custom mantém identidade explícita',async()=>{
  const db=memory(prepared()),ops=api(db);
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[item(1,{cor:'Branca',desc:'OUTRO PRODUTO'})]}))).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[item(1,{cor:'Branca',un:'M²'})]}))).error.code,'INVALID_ARGUMENT');
  assert.equal((await call(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[{catalogo_id:'inexistente',qtd:1,cor:'Branca'}]}))).error.code,'INVALID_ARGUMENT');
  await good(ops,'registrar_entrada',operation({local_id:'estoque-go',itens:[{desc:'SUPORTE ESPECIAL',un:'PÇ',qtd:2,cor:'Preta'}]}));
  const custom=E.balances(db.state(),'estoque-go').find(row=>row.peca.desc==='SUPORTE ESPECIAL');
  assert.equal(custom.peca.catalogo_id,null);assert.equal(custom.disponivel,2);
});
