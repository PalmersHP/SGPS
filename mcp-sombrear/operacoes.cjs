'use strict';

const {createHash}=require('node:crypto');
const Estoque=require('../estoque-core.js');

// Store contract: read() returns {state,filiais,catalogo,usuarios,version}.
// write(state,version) must atomically compare version and persist the entire
// operational record, or throw {code:'CONFLICT'}. Its successful return is ignored.
// Authentication belongs to the transport. Never construct principal from tool args.
const UUID='^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
const str=(description,maxLength=200)=>({type:'string',minLength:1,maxLength,description});
const id=()=>str('Identificador retornado pelas ferramentas de consulta.',200);
const object=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false});
const pagination={limit:{type:'integer',minimum:1,maximum:200},offset:{type:'integer',minimum:0,maximum:1000000}};
const mutation={operation_id:{...str('UUID estável da operação. Reutilize o mesmo UUID ao tentar novamente.',36),pattern:UUID},contexto_filial_id:{...id(),description:'Contexto de filial autorizado para administrador da sede; não altera a identidade do operador.'},data:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},obs:{type:'string',maxLength:4000}};
const entry=object({key:str('SKU exato retornado pela consulta de saldo ou solicitação.',3000),qtd:{type:'number',exclusiveMinimum:0}},['key','qtd']);
const entries={type:'array',minItems:1,maxItems:1000,items:entry};
const pieceProperties={catalogo_id:id(),desc:str('Descrição de uma peça personalizada sem catalogo_id.',300),un:str('Unidade da peça personalizada; padrão PÇ.',20),ma:str('Medida A.',50),mb:str('Medida B.',50),mc:str('Medida C.',50),qtd:{type:'number',exclusiveMinimum:0}};
function pieces(withColor){
  const schema=object({...pieceProperties,...(withColor?{cor:str('Cor ou acabamento das peças que entram no estoque.',100)}:{})},['qtd',...(withColor?['cor']:[])]);
  schema.anyOf=[{required:['catalogo_id']},{required:['desc']}];
  return {type:'array',minItems:1,maxItems:1000,items:schema};
}
const expected={type:'array',maxItems:5000,items:object({key:str('SKU da prévia de fechamento.',3000),disponivel:{type:'number',minimum:0},instalado:{type:'number',minimum:0}},['key','disponivel','instalado'])};
function tool(name,description,properties={},required=[],write=false,destructive=false){
  const securitySchemes=[{type:'oauth2',scopes:[]}];
  return {name,description,inputSchema:object(properties,required),annotations:{readOnlyHint:!write,destructiveHint:destructive,idempotentHint:true,openWorldHint:false},securitySchemes,_meta:{securitySchemes}};
}
const TOOLS=[
  tool('contexto_operador','Identifica o operador autenticado e os contextos de atuação autorizados.'),
  tool('listar_catalogo','Lista peças e unidades do catálogo real para lançar solicitações e entradas.',{busca:str('Trecho da descrição.'),...pagination}),
  tool('listar_filiais','Lista filiais acessíveis ao operador, sem dados de usuários.',pagination),
  tool('listar_locais','Lista estoques e pastas de condomínio acessíveis.',{tipo:{type:'string',enum:['estoque','condominio']},filial_id:id(),busca:str('Trecho do nome.'),incluir_finalizadas:{type:'boolean'},...pagination}),
  tool('listar_solicitacoes','Lista solicitações com solicitado, enviado, recebido e pendente por peça. Por padrão mostra apenas solicitações ativas.',{pasta_id:id(),filial_id:id(),status:{type:'string',enum:['pendente','parcial','enviado']},ativas:{type:'boolean',description:'true (padrão): ativas; false: arquivadas.'},...pagination}),
  tool('listar_transferencias_pendentes','Lista remanejamentos enviados que ainda aguardam recebimento.',{local_id:id(),...pagination}),
  tool('consultar_local','Consulta dados gerais, saldo, solicitações e remanejamentos pendentes de um local.',{local_id:id()},['local_id']),
  tool('consultar_saldo','Consulta estoque disponível, em trânsito, instalado e solicitado por SKU.',{local_id:id()},['local_id']),
  tool('consultar_historico','Consulta o histórico de movimentações acessíveis ao operador.',{local_id:id(),...pagination}),
  tool('consultar_relatorio','Consulta o relatório da obra; quando finalizada, retorna o relatório congelado.',{pasta_id:id()},['pasta_id']),
  tool('criar_pasta','Cria a pasta vazia de um condomínio no contexto da filial responsável.',{...mutation,condominio:str('Nome do condomínio.'),cor_estrutura:str('Cor da estrutura.',100),cor_tela:str('Cor da tela.',100),vagas:{type:'integer',minimum:1},prioridade:{type:'string',enum:['','P1','P2','P3'],description:'Prioridade do condomínio; vazio significa sem prioridade definida.'},endereco:{type:'string',maxLength:500},sindico:{type:'string',maxLength:200},contato:{type:'string',maxLength:200},email:{type:'string',maxLength:200},tipo:{type:'string',maxLength:100}},['operation_id','condominio','cor_estrutura','cor_tela','vagas'],true),
  tool('solicitar_pecas','Adiciona uma solicitação à pasta. As cores seguem os parâmetros do condomínio; não cria estoque físico.',{...mutation,pasta_id:id(),itens:pieces(false)},['operation_id','pasta_id','itens'],true),
  tool('registrar_entrada','Registra peças prontas em um depósito. GO é operado pela sede; depósito de filial exige contexto próprio e observação de origem.',{...mutation,local_id:id(),itens:pieces(true)},['operation_id','local_id','itens'],true),
  tool('remanejar_pecas','Despacha peças disponíveis da origem para o destino. A entrada no destino ocorre após confirmação de recebimento.',{...mutation,origem_id:id(),destino_id:id(),itens:entries},['operation_id','origem_id','destino_id','itens'],true),
  tool('enviar_solicitacao','Envia do estoque GO uma quantidade parcial ou total de uma solicitação, limitada ao seu saldo pendente.',{...mutation,solicitacao_id:id(),itens:entries},['operation_id','solicitacao_id','itens'],true),
  tool('confirmar_recebimento','Confirma uma única vez o recebimento integral de um remanejamento pelo responsável pelo destino.',{...mutation,movimento_id:id()},['operation_id','movimento_id'],true),
  tool('prever_fechamento','Mostra as peças que serão consideradas instaladas, trânsito e solicitações que serão arquivadas. Retorna expected para finalizar.',{pasta_id:id()},['pasta_id']),
  tool('finalizar_obra','Após o remanejo das sobras, considera instalado todo saldo restante e finaliza a obra. Exige a prévia exata e confirmação explícita.',{...mutation,pasta_id:id(),expected,confirmar_sobras_remanejadas:{type:'boolean',enum:[true]}},['operation_id','pasta_id','expected','confirmar_sobras_remanejadas'],true,true),
  tool('reabrir_obra','Reabre uma obra finalizada com justificativa, preservando o relatório anterior. Somente sede.',{...mutation,pasta_id:id(),justificativa:str('Motivo da reabertura.',4000)},['operation_id','pasta_id','justificativa'],true)
];

const clone=value=>JSON.parse(JSON.stringify(value));
function failure(code,message){const error=new Error(message);error.code=code;error.safe=true;throw error;}
function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
  return JSON.stringify(value);
}
function validate(schema,value,path='argumentos'){
  if(schema.type==='object'){
    if(!value||typeof value!=='object'||Array.isArray(value))failure('INVALID_ARGUMENT',path+' deve ser um objeto.');
    for(const key of schema.required||[])if(!Object.hasOwn(value,key))failure('INVALID_ARGUMENT','Campo obrigatório: '+path+'.'+key+'.');
    for(const key of Object.keys(value)){
      if(!Object.hasOwn(schema.properties,key))failure('INVALID_ARGUMENT','Campo não permitido: '+path+'.'+key+'.');
      validate(schema.properties[key],value[key],path+'.'+key);
    }
    if(schema.anyOf&&!schema.anyOf.some(option=>(option.required||[]).every(key=>Object.hasOwn(value,key))))failure('INVALID_ARGUMENT',path+' precisa de catalogo_id ou desc.');
  }else if(schema.type==='array'){
    if(!Array.isArray(value))failure('INVALID_ARGUMENT',path+' deve ser uma lista.');
    if(value.length<(schema.minItems||0)||schema.maxItems!==undefined&&value.length>schema.maxItems)failure('INVALID_ARGUMENT','Quantidade de itens inválida em '+path+'.');
    value.forEach((item,index)=>validate(schema.items,item,path+'['+index+']'));
  }else if(schema.type==='string'){
    if(typeof value!=='string'||schema.minLength&&value.trim().length<schema.minLength||schema.maxLength&&value.length>schema.maxLength||schema.pattern&&!new RegExp(schema.pattern).test(value))failure('INVALID_ARGUMENT','Texto inválido em '+path+'.');
  }else if(schema.type==='number'||schema.type==='integer'){
    if(typeof value!=='number'||!Number.isFinite(value)||schema.type==='integer'&&!Number.isInteger(value)||schema.minimum!==undefined&&value<schema.minimum||schema.maximum!==undefined&&value>schema.maximum||schema.exclusiveMinimum!==undefined&&value<=schema.exclusiveMinimum)failure('INVALID_ARGUMENT','Número inválido em '+path+'.');
  }else if(schema.type==='boolean'&&typeof value!=='boolean')failure('INVALID_ARGUMENT',path+' deve ser verdadeiro ou falso.');
  if(schema.enum&&!schema.enum.includes(value))failure('INVALID_ARGUMENT','Opção inválida em '+path+'.');
}
function response(payload){return {content:[{type:'text',text:JSON.stringify(payload)}],structuredContent:payload,...(!payload.ok?{isError:true}:{})};}
function page(items,args){const offset=args.offset||0,limit=args.limit||100;return {total:items.length,offset,limit,itens:items.slice(offset,offset+limit)};}
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function publicLocation(location){
  const result={id:location.id,tipo:location.tipo,nome:location.nome,filial_id:location.filial_id,ativo:location.ativo,finalizada:location.finalizada,conhecido:location.conhecido};
  if(location.pasta){
    result.pasta={};
    for(const key of ['id','cliente','filial_id','filial_nome','cor_estrutura','cor_tela','vagas','prioridade','endereco','sindico','contato','email','tipo','obs','status','status_obra','criado','atualizado','finalizado_em','finalizado_por'])if(location.pasta[key]!==undefined)result.pasta[key]=location.pasta[key];
  }return result;
}
function publicMovement(movement){const result=clone(movement);delete result.operacao_mcp;return result;}
function publicReport(report){const result=clone(report);result.movimentacoes=(result.movimentacoes||[]).map(publicMovement);return result;}

function createOperations({store,now=()=>new Date()}={}){
  if(!store||typeof store.read!=='function'||typeof store.write!=='function')throw new TypeError('store.read e store.write são obrigatórios.');
  async function read(){
    let snapshot;try{snapshot=await store.read();}catch{failure('STORE_UNAVAILABLE','Não foi possível consultar o sistema. Tente novamente.');}
    if(!snapshot||!snapshot.state||!Array.isArray(snapshot.state.pastas)||!Array.isArray(snapshot.state.estoques)||!Array.isArray(snapshot.state.movimentos)||!Array.isArray(snapshot.filiais)||!Array.isArray(snapshot.catalogo)||!Array.isArray(snapshot.usuarios)||snapshot.version===undefined)failure('STORE_UNAVAILABLE','Os dados do sistema estão indisponíveis ou incompletos.');
    return {...snapshot,state:{...snapshot.state,catalogo:clone(snapshot.catalogo)}};
  }
  function authenticate(principal,snapshot){
    if(!principal||typeof principal.id!=='string'||!principal.id||typeof principal.nome!=='string'||!principal.nome||!['sede','filial'].includes(principal.role))failure('UNAUTHORIZED','Operador autenticado não informado.');
    const account=snapshot.usuarios.find(user=>user.id===principal.id);
    if(!account||account.ativo===false)failure('FORBIDDEN','Este operador está inativo ou não está cadastrado no sistema.');
    if(principal.role==='filial'&&!snapshot.filiais.some(f=>f.id===principal.filial_id&&f.ativo!==false))failure('FORBIDDEN','A filial do operador está inativa ou não foi encontrada.');
  }
  function context(principal,args,snapshot,time){
    let role=principal.role,filialId=principal.filial_id;
    if(args.contexto_filial_id){
      if(principal.role!=='sede'||principal.gerenciar_todas_filiais!==true)failure('FORBIDDEN','Seu acesso não permite atuar em contexto de outra filial.');
      const filial=snapshot.filiais.find(f=>f.id===args.contexto_filial_id&&f.ativo!==false);
      if(!filial)failure('FORBIDDEN','Contexto de filial não encontrado ou inativo.');
      role='filial';filialId=filial.id;
    }
    const filial=snapshot.filiais.find(f=>f.id===filialId);
    const today=time.toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});
    if(args.data){const day=new Date(args.data+'T00:00:00Z');if(!Number.isFinite(day.getTime())||day.toISOString().slice(0,10)!==args.data||args.data>today)failure('INVALID_ARGUMENT','Informe uma data válida, até hoje.');}
    return {id:principal.id,nome:principal.nome,role,filial_id:role==='filial'?filialId:null,filial_nome:role==='filial'&&filial?filial.nome:'',data:today,agora:time.toISOString()};
  }
  function visible(principal,location){return !!location&&(principal.role==='sede'||location.id==='estoque-go'||location.filial_id===principal.filial_id);}
  function getLocation(snapshot,principal,id,folderOnly=false){
    const location=Estoque.getLocation(snapshot.state,id);
    if(!location||!visible(principal,location)||location.tipo==='historico'||folderOnly&&location.tipo!=='condominio')failure('NOT_FOUND','Pasta ou estoque não encontrado no seu acesso.');
    return location;
  }
  function checkFilialFilter(args,principal){if(args.filial_id&&principal.role==='filial'&&args.filial_id!==principal.filial_id)failure('FORBIDDEN','A consulta deve permanecer na sua filial.');}
  function visibleMovement(snapshot,principal,movement){
    if(principal.role==='sede')return true;
    const ids=[movement.pasta_id,movement.origem_id,movement.destino_id].filter(Boolean);
    if(ids.some(id=>Estoque.getLocation(snapshot.state,id)?.filial_id===principal.filial_id))return true;
    return false;
  }
  function requests(snapshot,principal,pastaId){return Estoque.requests(snapshot.state,pastaId).filter(r=>principal.role==='sede'||r.filial_id===principal.filial_id);}
  function pending(snapshot,principal,locationId){return Estoque.pendingTransfers(snapshot.state,locationId).filter(m=>visibleMovement(snapshot,principal,m)).map(publicMovement);}
  function readTool(name,args,principal,snapshot){
    const state=snapshot.state;checkFilialFilter(args,principal);
    switch(name){
      case 'contexto_operador':return {operador:{id:principal.id,nome:principal.nome,role:principal.role,filial_id:principal.filial_id||null},contextos:principal.role==='sede'?[{role:'sede'},...(principal.gerenciar_todas_filiais===true?snapshot.filiais.filter(f=>f.ativo!==false).map(f=>({role:'filial',filial_id:f.id,filial_nome:f.nome})):[])]:[{role:'filial',filial_id:principal.filial_id,filial_nome:snapshot.filiais.find(f=>f.id===principal.filial_id)?.nome}]};
      case 'listar_catalogo':return page(snapshot.catalogo.filter(item=>!args.busca||normalize(item.desc).includes(normalize(args.busca))).map(item=>{const result={};for(const key of ['id','desc','un','preco','cat','ma','mb','mc'])if(item[key]!==undefined)result[key]=item[key];return result;}),args);
      case 'listar_filiais':return page(snapshot.filiais.filter(f=>principal.role==='sede'||f.id===principal.filial_id).map(f=>({id:f.id,nome:f.nome,cidade:f.cidade||'',ativo:f.ativo!==false})),args);
      case 'listar_locais':return page(Estoque.locations(state).filter(l=>visible(principal,l)&&(!args.tipo||l.tipo===args.tipo)&&(!args.filial_id||l.filial_id===args.filial_id)&&(!args.busca||normalize(l.nome).includes(normalize(args.busca)))&&(args.incluir_finalizadas===true||!l.finalizada)).map(publicLocation),args);
      case 'listar_solicitacoes':if(args.pasta_id)getLocation(snapshot,principal,args.pasta_id,true);return page(requests(snapshot,principal,args.pasta_id).filter(r=>(args.ativas===false?!r.ativo:r.ativo)&&(!args.filial_id||r.filial_id===args.filial_id)&&(!args.status||r.status===args.status)),args);
      case 'listar_transferencias_pendentes':if(args.local_id)getLocation(snapshot,principal,args.local_id);return page(pending(snapshot,principal,args.local_id),args);
      case 'consultar_saldo':getLocation(snapshot,principal,args.local_id);return {local_id:args.local_id,itens:Estoque.balances(state,args.local_id)};
      case 'consultar_local':{const location=getLocation(snapshot,principal,args.local_id);return {local:publicLocation(location),saldos:Estoque.balances(state,location.id),solicitacoes:location.tipo==='condominio'?requests(snapshot,principal,location.id):[],transferencias_pendentes:pending(snapshot,principal,location.id)};}
      case 'consultar_historico':if(args.local_id)getLocation(snapshot,principal,args.local_id);return page(Estoque.history(state,args.local_id).filter(m=>visibleMovement(snapshot,principal,m)).map(publicMovement).reverse(),args);
      case 'consultar_relatorio':getLocation(snapshot,principal,args.pasta_id,true);return publicReport(Estoque.report(state,args.pasta_id));
      case 'prever_fechamento':{
        const location=getLocation(snapshot,principal,args.pasta_id,true),rows=Estoque.balances(state,args.pasta_id),transfers=pending(snapshot,principal,args.pasta_id);
        return {pasta_id:args.pasta_id,version:snapshot.version,expected:rows.map(({key,disponivel,instalado})=>({key,disponivel,instalado})),itens:rows.map(b=>({key:b.key,peca:b.peca,ja_instalado:b.instalado,saldo_restante:b.disponivel,instalado_final:Math.round((b.instalado+b.disponivel)*1000)/1000})),transferencias_pendentes:transfers,solicitacoes_a_arquivar:requests(snapshot,principal,args.pasta_id).filter(r=>r.ativo&&r.status!=='enviado'),pode_finalizar:location.ativo&&!location.finalizada&&transfers.length===0,orientacao:'Remaneje todas as sobras antes de confirmar. O saldo restante será registrado como instalado.'};
      }
      default:failure('UNKNOWN_TOOL','Ferramenta não encontrada.');
    }
  }
  function normalizePieces(items,snapshot,withColor){
    return items.map(item=>{
      const catalog=item.catalogo_id?snapshot.catalogo.find(c=>c.id===item.catalogo_id):null;
      if(item.catalogo_id&&!catalog)failure('INVALID_ARGUMENT','Peça do catálogo não encontrada. Consulte o catálogo atualizado.');
      if(catalog&&item.desc&&normalize(item.desc)!==normalize(catalog.desc))failure('INVALID_ARGUMENT','Descrição incompatível com catalogo_id.');
      if(catalog&&item.un&&Estoque.normalizeItem({un:item.un}).un!==Estoque.normalizeItem({un:catalog.un}).un)failure('INVALID_ARGUMENT','Unidade incompatível com o catálogo.');
      const piece={catalogo_id:catalog?catalog.id:null,desc:catalog?catalog.desc:item.desc,un:catalog?catalog.un:item.un||'PÇ',ma:item.ma||catalog?.ma||'0,00',mb:item.mb||catalog?.mb||'0,00',mc:item.mc||catalog?.mc||'0,00',qtd:item.qtd,preco_unit:catalog?Number(catalog.preco)||0:0};
      if(withColor)piece.cor=item.cor;
      return piece;
    });
  }
  function transform(name,args,principal,snapshot,ctx){
    const state=snapshot.state,operationId=args.operation_id.toLowerCase(),meta={id:'mcp:'+operationId,data:args.data||ctx.data,obs:args.obs||''};
    switch(name){
      case 'criar_pasta':return Estoque.createFolder(state,{id:'p-mcp-'+operationId,cliente:args.condominio,cor_estrutura:args.cor_estrutura,cor_tela:args.cor_tela,vagas:args.vagas,prioridade:args.prioridade||'',endereco:args.endereco||'',sindico:args.sindico||'',contato:args.contato||'',email:args.email||'',tipo:args.tipo||'Sombrite',obs:args.obs||''},{...ctx,data:args.data||ctx.data});
      case 'solicitar_pecas':getLocation(snapshot,principal,args.pasta_id,true);return Estoque.addDemand(state,args.pasta_id,normalizePieces(args.itens,snapshot,false),ctx,meta);
      case 'registrar_entrada':getLocation(snapshot,principal,args.local_id);return Estoque.addStock(state,args.local_id,normalizePieces(args.itens,snapshot,true),ctx,meta);
      case 'remanejar_pecas':getLocation(snapshot,principal,args.origem_id);getLocation(snapshot,principal,args.destino_id);return Estoque.transfer(state,args.origem_id,args.destino_id,args.itens,ctx,meta);
      case 'enviar_solicitacao':{const request=requests(snapshot,principal).find(r=>r.id===args.solicitacao_id);if(!request)failure('NOT_FOUND','Solicitação não encontrada no seu acesso.');return Estoque.dispatchRequest(state,args.solicitacao_id,args.itens,ctx,meta);}
      case 'confirmar_recebimento':{const movement=state.movimentos.find(m=>m.id===args.movimento_id&&m.tipo==='transferencia');if(!movement||!visibleMovement(snapshot,principal,movement))failure('NOT_FOUND','Transferência não encontrada no seu acesso.');return Estoque.receive(state,args.movimento_id,ctx,meta);}
      case 'finalizar_obra':getLocation(snapshot,principal,args.pasta_id,true);return Estoque.closeWithRemaining(state,args.pasta_id,ctx,{...meta,expected:args.expected});
      case 'reabrir_obra':getLocation(snapshot,principal,args.pasta_id,true);return Estoque.reopen(state,args.pasta_id,ctx,{...meta,obs:args.justificativa});
      default:failure('UNKNOWN_TOOL','Ferramenta não encontrada.');
    }
  }
  async function callTool(name,args={},principal){
    try{
      const definition=TOOLS.find(tool=>tool.name===name);if(!definition)failure('UNKNOWN_TOOL','Ferramenta não encontrada.');
      validate(definition.inputSchema,args);
      const time=new Date(now());if(!Number.isFinite(time.getTime()))failure('CONFIGURATION_ERROR','Relógio do servidor indisponível.');
      const write=!definition.annotations.readOnlyHint;
      let normalizedArgs=clone(args);if(write)normalizedArgs.operation_id=normalizedArgs.operation_id.toLowerCase();
      for(let attempt=0;attempt<(write?3:1);attempt++){
        const snapshot=await read();authenticate(principal,snapshot);
        if(!write)return response({ok:true,tool:name,data:readTool(name,args,principal,snapshot)});
        const ctx=context(principal,args,snapshot,time);
        const identity={id:principal.id,auth_id:principal.auth_id||null,role:principal.role,filial_id:principal.filial_id||null,gerenciar_todas_filiais:principal.gerenciar_todas_filiais===true};
        const hash=createHash('sha256').update(canonical({tool:name,args:normalizedArgs,principal:identity})).digest('hex');
        const previous=snapshot.state.movimentos.find(m=>m.operacao_mcp?.id===normalizedArgs.operation_id);
        if(previous){
          if(previous.operacao_mcp.hash!==hash)failure('IDEMPOTENCY_CONFLICT','Este operation_id já foi utilizado com outros dados ou por outro operador.');
          if(!previous.operacao_mcp.resultado)failure('STORE_UNAVAILABLE','O registro anterior da operação está incompleto.');
          return response(clone(previous.operacao_mcp.resultado));
        }
        let updated;
        try{updated=transform(name,args,principal,snapshot,ctx);}catch(error){if(error.safe)throw error;failure('VALIDATION_ERROR',error.message||'A operação não pôde ser validada.');}
        const oldIds=new Set(snapshot.state.movimentos.map(m=>m.id)),created=updated.movimentos.filter(m=>!oldIds.has(m.id));
        if(!created.length)failure('VALIDATION_ERROR','A operação não gerou uma movimentação para registrar.');
        const data={movimento_ids:created.map(m=>m.id)};
        if(name==='criar_pasta')data.pasta_id='p-mcp-'+normalizedArgs.operation_id;
        if(args.pasta_id)data.pasta_id=args.pasta_id;
        if(name==='solicitar_pecas')data.solicitacao_id=created.find(m=>m.tipo==='demanda').id;
        if(args.solicitacao_id)data.solicitacao_id=args.solicitacao_id;
        if(args.local_id)data.local_id=args.local_id;
        if(args.origem_id)data.origem_id=args.origem_id;
        if(args.destino_id)data.destino_id=args.destino_id;
        if(name==='finalizar_obra'){data.finalizada=true;data.instalado=Estoque.report(updated,args.pasta_id).itens.map(it=>({key:it.key,peca:it.peca,qtd:it.instalado}));}
        if(name==='reabrir_obra')data.finalizada=false;
        const payload={ok:true,tool:name,operation_id:normalizedArgs.operation_id,data};
        created.forEach(m=>{
          m.auditoria_mcp={canal:'mcp',principal_id:principal.id,principal_nome:principal.nome,auth_id:principal.auth_id||null,perfil_efetivo:ctx.role,filial_id:ctx.filial_id||null};
          m.operacao_mcp={id:normalizedArgs.operation_id,hash,tool:name,resultado:clone(payload)};
        });
        if(name==='finalizar_obra'){
          const report=updated.pastas.find(p=>p.id===args.pasta_id).relatorio_final;
          report.movimentacoes=report.movimentacoes.map(m=>created.find(event=>event.id===m.id)?clone(created.find(event=>event.id===m.id)):m);
        }
        try{await store.write(updated,snapshot.version);return response(payload);}
        catch(error){if(error.code==='CONFLICT'){if(attempt<2)continue;failure('CONFLICT','O sistema foi atualizado por outro usuário. Consulte o saldo e tente novamente com o mesmo operation_id.');}failure('WRITE_FAILED','Não foi possível confirmar a gravação. Tente novamente com o mesmo operation_id.');}
      }
    }catch(error){return response({ok:false,error:{code:error.safe?error.code:'INTERNAL_ERROR',message:error.safe?error.message:'Não foi possível executar esta operação.'}});}
  }
  return {listTools:()=>clone(TOOLS),callTool};
}

module.exports={createOperations};
