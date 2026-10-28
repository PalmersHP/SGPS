(function(){
  'use strict';
  var draft=null,dispatch=null,busy=false,loading=false,revision=0;
  var h=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var num=function(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});};
  var date=function(){return new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});};
  function ctx(){return Object.assign({},USER,{data:date()});}
  function current(){return DB.getPedido(window._pedidoId);}
  function allowed(p){return p&&(USER.role==='sede'||p.filial_id===USER.filial_id);}
  function price(it){return typeof it.preco_unit==='number'?it.preco_unit:lookupPreco(it.desc);}
  function total(p){return (p.itens||[]).reduce(function(sum,it){return sum+price(it)*(Number(it.qtd)||0);},0);}
  function blank(){return {desc:'',ma:'0,00',mb:'0,00',mc:'0,00',un:'PÇ',qtd:1};}
  function button(action,label,primary,extra){return '<button type="button" class="btn '+(primary?'btn-primary':'btn-outline')+'" data-p-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function field(label,key,value,type,extra){return '<div class="fg"><label for="p_'+key+'">'+label+'</label><input id="p_'+key+'" data-field="'+key+'" type="'+(type||'text')+'" value="'+h(value)+'" '+(extra||'')+'></div>';}
  function modal(title,body,footer){openModal(title,body,footer);document.getElementById('modalBox').classList.add('pedido-modal');}
  function close(){closeModal();document.getElementById('modalBox').classList.remove('pedido-modal');dispatch=null;}
  function error(message){
    var el=document.getElementById('pedidoError');
    if(el){el.textContent=message;el.scrollIntoView({block:'nearest'});}
    showToast(message,'error');
  }
  async function read(){
    var r=await fetch(SUPA_URL+'/rest/v1/sgps_store?key=eq.pedidos&select=value,updated_at',{headers:SUPA_HDR,cache:'no-store'});
    if(!r.ok)throw new Error('Não foi possível consultar os pedidos. Tente novamente.');
    var rows=await r.json();
    if(!Array.isArray(rows)||rows.length!==1||!Array.isArray(rows[0].value)||!rows[0].updated_at)throw new Error('Os pedidos não estão disponíveis. Nenhuma alteração foi salva.');
    return rows[0];
  }
  async function save(orderId,transform){
    if(busy)return null;
    busy=true;revision++;
    document.querySelectorAll('[data-p-action]').forEach(function(b){b.disabled=true;});
    try{
      var store=await read(),old=store.value.find(function(p){return p.id===orderId;});
      if(orderId&&!old)throw new Error('Pedido não encontrado. Atualize a página.');
      var next=transform(old);
      next.itens.forEach(function(it){if(typeof it.preco_unit!=='number')it.preco_unit=lookupPreco(it.desc);it.subtotal=it.preco_unit*it.qtd;});
      next.subtotal_pecas=total(next);next.frete=0;next.valor=next.subtotal_pecas;
      var orders=orderId?store.value.map(function(p){return p.id===orderId?next:p;}):[next].concat(store.value);
      var r=await fetch(SUPA_URL+'/rest/v1/sgps_store?key=eq.pedidos&updated_at=eq.'+encodeURIComponent(store.updated_at)+'&select=key',{
        method:'PATCH',headers:Object.assign({},SUPA_HDR,{'Prefer':'return=representation'}),
        body:JSON.stringify({value:orders,updated_at:new Date().toISOString()})
      });
      if(!r.ok)throw new Error('Não foi possível salvar. Seus dados continuam na tela para tentar novamente.');
      var changed=await r.json();
      if(!Array.isArray(changed)||changed.length!==1)throw new Error('Outro usuário atualizou os pedidos. Tente salvar novamente para conferir os dados mais recentes.');
      DB_CACHE.pedidos=orders;buildSidebar();return next;
    }catch(e){error(e.message);return null;}
    finally{busy=false;document.querySelectorAll('[data-p-action]').forEach(function(b){b.disabled=false;});}
  }
  function itemEditor(){
    var rows=draft.items.map(function(it,i){
      var custom=it.custom||(!WZ_CATALOGO.some(function(c){return c.desc===it.desc;})&&!!it.desc);
      var options='<option value="">Selecione a peça</option>'+WZ_CATALOGO.filter(function(c){return c.desc!=='DEIXAR EM BRANCO (EDITÁVEL)';}).map(function(c){return '<option value="'+h(c.desc)+'" '+(c.desc===it.desc?'selected':'')+'>'+h(c.desc)+'</option>';}).join('')+'<option value="__custom__" '+(custom?'selected':'')+'>Outra peça (descrever)</option>';
      var input=function(key){return '<input aria-label="'+h(key==='qtd'?'Quantidade de '+(it.desc||'peças'):'Medida '+key.slice(1).toUpperCase())+'" data-line="'+i+'" data-line-field="'+key+'" value="'+h(it[key])+'" '+(key==='qtd'?'type="number" min="0.001" step="any"':'type="text"')+'>';};
      return '<tr><td><select aria-label="Peça '+(i+1)+'" data-line="'+i+'" data-line-field="desc">'+options+'</select>'+(custom?'<input class="pedido-custom" placeholder="Descrição da peça" aria-label="Descrição da peça" data-line="'+i+'" data-line-field="customDesc" value="'+h(it.desc)+'">':'')+'</td><td>'+input('ma')+'</td><td>'+input('mb')+'</td><td>'+input('mc')+'</td><td>'+h(it.un)+'</td><td>'+input('qtd')+'</td><td class="num">'+fmtMoeda(price(it))+'</td><td>'+button('remove','✕',false,'aria-label="Remover peça '+(i+1)+'" data-index="'+i+'"')+'</td></tr>';
    }).join('');
    return '<div class="pedido-actions">'+(draft.mode==='edit'?'':button('add-row','+ Lançar peça',true))+'</div><p class="pedido-help">Escolha no catálogo e informe as medidas e a quantidade. Para braços de 4,60 m, por exemplo, preencha 4,60 na Medida A.</p><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th><th>Med. A</th><th>Med. B</th><th>Med. C</th><th>Unid.</th><th>Quantidade</th><th>V. unit.</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="pedidoDraftTotal" class="pedido-total"></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>';
  }
  function draftTotal(){var el=document.getElementById('pedidoDraftTotal');if(el&&draft)el.textContent='Total solicitado: '+fmtMoeda(draft.items.reduce(function(s,it){return s+price(it)*(Number(it.qtd)||0);},0));}
  function form(){
    var d=draft.data;
    return '<div class="pedido-form"><div class="form-grid">'+
      field('Nome do condomínio *','cliente',d.cliente,'text','placeholder="Ex.: Condomínio Riacho 33" required')+
      field('Número de vagas *','vagas',d.vagas,'number','min="1" step="1" required')+
      field('Cor da estrutura *','cor_estrutura',d.cor_estrutura,'text','list="pedidoEstruturas" required')+
      field('Cor da tela *','cor_tela',d.cor_tela,'text','list="pedidoTelas" required')+
      '</div><datalist id="pedidoEstruturas"><option value="Branca"><option value="Preta"><option value="Cinza"></datalist><datalist id="pedidoTelas"><option value="Prata"><option value="Verde"><option value="Azul"><option value="Vermelha"><option value="Bege"><option value="Não se aplica"></datalist>'+
      '<details class="pedido-options"><summary>Contato e informações técnicas (opcional)</summary><div class="form-grid">'+
      '<div class="fg"><label for="p_tipo">Tipo de cobertura</label><select id="p_tipo" data-field="tipo">'+['Sombrite','Telha','Carport'].map(function(t){return '<option '+(d.tipo===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div>'+
      field('Chumbação','chumbacao',d.chumbacao)+field('Pilares','pilares',d.pilares)+field('Endereço','endereco',d.endereco)+field('CNPJ','cnpj',d.cnpj)+field('Síndico / responsável','sindico',d.sindico)+field('Telefone','contato',d.contato)+field('E-mail','email',d.email,'email')+
      '</div></details></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>';
  }
  function renderDraft(){
    if(!draft)return;
    if(draft.mode!=='new'){
      modal(draft.mode==='add'?'Adicionar peças — '+draft.data.cliente:'Revisar peças pendentes — '+draft.data.cliente,
        '<p class="pedido-help">'+(draft.mode==='add'?'As peças serão acrescentadas ao mesmo condomínio e enviadas à sede para conferência. Os envios já registrados serão mantidos.':'Somente peças ainda não aceitas pela sede podem ser alteradas.')+'</p>'+itemEditor(),
        button('cancel','Cancelar')+button('submit',draft.mode==='add'?'Enviar complemento à sede':'Salvar revisão',true));
    }else{
      document.getElementById('view-filial-novo-pedido').innerHTML='<div class="page-hdr"><div><h1>Novo condomínio / pedido</h1><p>Cadastre os dados gerais e lance as peças que a sede deve fornecer.</p></div></div><div class="pedido-steps"><span class="'+(draft.step===1?'active':'')+'">1. Dados do condomínio</span><span>→</span><span class="'+(draft.step===2?'active':'')+'">2. Peças do pedido</span></div><div class="card"><div class="card-hdr"><h2>'+(draft.step===1?'Dados gerais':h(draft.data.cliente)+' — peças solicitadas')+'</h2></div><div class="card-body">'+(draft.step===1?form():itemEditor())+'</div></div><div class="pedido-footer">'+(draft.step===2?button('back','← Dados do condomínio'):'<span></span>')+button(draft.step===1?'next':'submit',draft.step===1?'Continuar para as peças →':'Enviar pedido à sede',true)+'</div>';
    }
    draftTotal();
  }
  function novo(){
    if(!USER||USER.role!=='filial')return;
    draft={mode:'new',step:1,data:{cliente:'',vagas:'',cor_estrutura:'Branca',cor_tela:'Prata',tipo:'Sombrite',chumbacao:'Chumbação Direta em Solo',pilares:'Tipo Direto',endereco:'',cnpj:'',sindico:'',contato:'',email:'',obs:'',prazos:prazoesPadrao()},items:[blank()]};
    renderDraft();
  }
  function openEditor(mode){
    var p=current();if(!allowed(p)||USER.role!=='filial')return;
    draft={mode:mode,target:p.id,data:p,items:mode==='add'?[blank()]:Pedidos.normalize(p).itens.filter(function(it){return it.qtd>0&&it.item_status==='aguardando';})};
    if(mode==='edit')draft.originals=JSON.parse(JSON.stringify(draft.items));
    renderDraft();
  }
  async function submit(){
    if(!draft)return;
    var data=draft,items=data.items.map(function(it){return Object.assign({},it,{preco_unit:price(it)});});
    var p=await save(data.target,function(old){return data.mode==='new'?Pedidos.create(data.data,items,ctx()):data.mode==='add'?Pedidos.add(old,items,ctx()):Pedidos.edit(old,items,ctx(),data.originals);});
    if(!p)return;
    draft=null;close();window._pedidoId=p.id;location.hash='filial-pedido';detail(p.id,'filial');
    showToast(data.mode==='new'?'Pedido enviado à sede.':data.mode==='add'?'Complemento enviado para conferência.':'Peças pendentes atualizadas.','success');
  }
  function measures(it){return [it.ma,it.mb,it.mc].map(function(v){return h(v||'—');}).join(' / ');}
  function detail(orderId,role){
    var p=DB.getPedido(orderId),el=document.getElementById('view-'+role+'-pedido');
    if(!allowed(p)){el.innerHTML='<p>Pedido não encontrado.</p>';return;}
    var sede=role==='sede',known=Pedidos.known(p),rows=Pedidos.balances(p).filter(function(b){return b.pedido>0;}),pending=rows.filter(function(b){return b.item.item_status==='aguardando'||!b.item.item_status&&!b.item.os_status;}),active=!p.inativo&&p.status!=='cancelado';
    var available=rows.some(function(b){return b.saldo>0&&b.item.item_status!=='aguardando'&&(b.item.item_status||b.item.os_status);});
    var actions=button('refresh','↻ Atualizar')+button('print','Imprimir / PDF');
    if(sede){
      actions+=button('os','OS de fabricação');
      if(active&&pending.length)actions+=button('approve','Aceitar peças pendentes ('+pending.length+')',true);
      if(active&&known&&available)actions+=button('dispatch','Registrar envio',true);
    }else if(active){
      if(known&&pending.length)actions+=button('edit','Revisar peças pendentes');
      actions+=button('complement','+ Adicionar peças',true);
    }
    var table=rows.map(function(b){
      var it=b.item,st=normalizeItemStatus(it),label=ITEM_STATUS_LABELS[st]||st;
      if(known&&b.enviado>0)label=b.saldo===0?'Enviado':'Envio parcial';
      if(known&&b.recebido>=b.pedido&&b.pedido>0)label='Recebido';
      var state=sede&&active&&b.saldo>0?'<select class="pedido-stage" aria-label="Conferência de '+h(it.desc)+'" data-production="'+h(b.id)+'"><option value="" disabled '+(['aprovado','em_fabricacao','pronto_envio'].indexOf(st)<0?'selected':'')+'>'+h(st==='aguardando'?'Aguardando aceite':label)+'</option>'+['aprovado','em_fabricacao','pronto_envio'].map(function(s){return '<option value="'+s+'" '+(st===s?'selected':'')+'>'+ITEM_STATUS_LABELS[s]+'</option>';}).join('')+'</select>':'<span>'+h(label)+'</span>';
      return '<tr><td class="pedido-item-name"><strong>'+h(it.desc)+'</strong>'+(it.complemento?'<small>Complemento · '+fmtDate(it.solicitado_em)+'</small>':'')+'</td><td>'+measures(it)+'</td><td>'+h(it.un)+'</td><td class="num">'+num(b.pedido)+'</td><td class="num">'+(known?num(b.enviado):'—')+'</td><td class="num saldo">'+(known?num(b.saldo):'—')+'</td><td>'+state+(known&&b.enviado>0&&b.saldo>0?'<small>'+num(b.enviado)+' já enviado(s)</small>':'')+'</td></tr>';
    }).join('');
    var shipments=(p.remessas||[]).slice().reverse().map(function(r){
      var buttons=button('print-shipment','Comprovante',false,'data-shipment="'+h(r.id)+'"');
      if(!sede&&!r.recebido_em&&active)buttons+=button('receive','Confirmar recebimento',false,'data-shipment="'+h(r.id)+'"');
      return '<article class="pedido-remessa"><header><div><strong>'+fmtDate(r.data)+(r.anterior?' · Envios anteriores':' · Remessa')+'</strong><small class="pedido-help"> · '+h(r.user)+'</small></div><div class="pedido-actions">'+buttons+'</div></header><ul>'+r.itens.map(function(it){return '<li><strong>'+num(it.qtd)+' '+h(it.un)+'</strong> — '+h(it.desc)+' ('+measures(it)+')</li>';}).join('')+'</ul>'+(r.obs?'<p class="pedido-help">'+h(r.obs)+'</p>':'')+'<span class="pedido-tag">'+(r.recebido_em?'Recebido em '+fmtDate(r.recebido_em)+' · '+h(r.recebido_por):'Aguardando confirmação da filial')+'</span></article>';
    }).join('')||'<p class="pedido-help">Nenhum envio registrado. Cada remessa aparecerá aqui com as peças e as quantidades enviadas.</p>';
    var history=(p.log||[]).slice().reverse().map(function(l){return '<li>'+h(l.obs||STATUS_LABELS[l.status]||l.status)+'<small>'+fmtDate(l.data)+' · '+h(l.user)+'</small></li>';}).join('');
    var notice=!known?'<div class="pedido-notice"><strong>Confira os envios anteriores deste pedido.</strong><br>Este pedido foi criado antes do controle de remessas. A sede precisa informar o que já foi enviado para calcular o saldo.'+(sede&&active?'<div class="pedido-actions" style="margin-top:10px">'+button('baseline','Informar envios anteriores')+'</div>':'')+'</div>':'';
    el.innerHTML='<div class="page-hdr"><div><button class="btn btn-ghost btn-sm" data-p-action="list">← Pedidos</button><h1>'+h(p.cliente)+'</h1><p>'+h(p.filial_nome)+' · Criado em '+fmtDate(p.criado)+' · '+badge(p.status)+'</p></div></div><div class="pedido-actions" style="margin-bottom:20px">'+actions+'</div><div class="pedido-summary"><div><small>Cor da estrutura</small><strong>'+h(p.cor_estrutura||'—')+'</strong></div><div><small>Cor da tela</small><strong>'+h(p.cor_tela||'—')+'</strong></div><div><small>Número de vagas</small><strong>'+num(p.vagas)+'</strong></div><div><small>Remessas registradas</small><strong>'+(p.remessas||[]).length+'</strong></div></div>'+notice+
      '<div class="card"><div class="card-hdr"><h2>Peças e saldo do pedido</h2><span class="pedido-help">'+(pending.length?pending.length+' item(ns) aguardando a sede':'Peças conferidas pela sede')+'</span></div><div class="card-body" style="padding:0"><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th><th>Medidas A / B / C</th><th>Unid.</th><th class="num">Pedido</th><th class="num">Enviado</th><th class="num">Falta enviar</th><th>Conferência / produção</th></tr></thead><tbody>'+table+'</tbody></table></div></div></div>'+
      '<div class="pedido-grid"><div class="card"><div class="card-hdr"><h2>Histórico de envios</h2></div><div class="card-body">'+shipments+'</div></div><div class="card"><div class="card-hdr"><h2>Histórico do pedido</h2></div><div class="card-body"><ul class="pedido-history">'+history+'</ul></div></div></div>'+
      '<details class="card"><summary class="card-hdr">Dados complementares e valores</summary><div class="card-body"><div class="form-grid">'+['endereco','cnpj','sindico','contato','email','tipo','chumbacao','pilares'].map(function(k,i){return '<div><small class="pedido-muted">'+['Endereço','CNPJ','Responsável','Telefone','E-mail','Cobertura','Chumbação','Pilares'][i]+'</small><div>'+h(p[k]||'—')+'</div></div>';}).join('')+'</div><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th><th>Quantidade</th><th>V. unit.</th><th>Total</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td>'+h(b.item.desc)+'</td><td>'+num(b.pedido)+'</td><td>'+fmtMoeda(price(b.item))+'</td><td>'+fmtMoeda(price(b.item)*b.pedido)+'</td></tr>';}).join('')+'</tbody></table></div><div class="pedido-total">Total solicitado: '+fmtMoeda(total(p))+'</div></div></details>';
  }
  function openDispatch(baseline){
    var p=current();if(!p||USER.role!=='sede')return;
    var rows=Pedidos.balances(p).filter(function(b){return b.pedido>0&&(baseline||b.saldo>0&&normalizeItemStatus(b.item)!=='aguardando');});
    if(!rows.length){error('Não há peças aceitas com saldo para enviar.');return;}
    dispatch={id:'r'+crypto.randomUUID(),pedido:p.id,baseline:baseline,rows:rows,data:date(),obs:''};
    modal(baseline?'Conferir envios anteriores':'Registrar envio — '+p.cliente,
      '<p class="pedido-help">'+(baseline?'Informe o total que já saiu da sede antes deste controle. Se nada foi enviado, mantenha todas as quantidades em zero.':'Informe somente o que está saindo nesta remessa. O saldo será abatido após salvar.')+'</p><div class="form-grid">'+field('Data do envio','envio_data',date(),'date','max="'+date()+'"')+field('Observações / transporte','envio_obs','','text','placeholder="Ex.: transportadora, veículo ou referência"')+'</div><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th><th>Medidas</th><th>Unid.</th><th>'+(baseline?'Pedido':'Falta enviar')+'</th><th>'+(baseline?'Já enviado':'Enviar agora')+'</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td>'+h(b.item.desc)+'</td><td>'+measures(b.item)+'</td><td>'+h(b.item.un)+'</td><td>'+num(baseline?b.pedido:b.saldo)+'</td><td><input aria-label="Enviar '+h(b.item.desc)+'" type="number" min="0" step="any" max="'+b.saldo+'" value="0" data-dispatch-item="'+h(b.id)+'"></td></tr>';}).join('')+'</tbody></table></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>',
      button('cancel','Cancelar')+button('save-dispatch',baseline?'Confirmar saldo inicial':'Salvar envio',true));
  }
  async function saveDispatch(){
    if(!dispatch)return;
    var d=dispatch,entries=[];
    try{
      document.querySelectorAll('[data-dispatch-item]').forEach(function(input){
        var row=d.rows.find(function(b){return b.id===input.dataset.dispatchItem;});
        var n=Pedidos.qty(input.value,row.item.un,true);
        if(n>0)entries.push({item_id:row.id,qtd:n});
      });
    }catch(e){error(e.message);return;}
    var meta={id:d.id,data:document.getElementById('p_envio_data').value,obs:document.getElementById('p_envio_obs').value};
    var saved=await save(d.pedido,function(p){return d.baseline?Pedidos.baseline(p,entries,ctx(),meta):Pedidos.send(p,entries,ctx(),meta);});
    if(saved){close();detail(saved.id,'sede');showToast(d.baseline?'Saldo inicial conferido.':'Envio registrado e saldo atualizado.','success');}
  }
  async function approve(orderId){
    var saved=await save(orderId,function(p){return Pedidos.approve(p,ctx());});
    if(saved){showToast('Peças aceitas pela sede.','success');renderView(location.hash.slice(1));}
  }
  async function production(key,next){
    var p=current();if(!p)return;
    var saved=await save(p.id,function(old){return Pedidos.production(old,key,next,ctx());});
    detail(p.id,USER.role);if(saved)showToast('Conferência atualizada.','success');
  }
  async function receive(shipmentId){
    var p=current();if(!p)return;
    var saved=await save(p.id,function(old){return Pedidos.receive(old,shipmentId,ctx());});
    if(saved){detail(p.id,'filial');showToast('Recebimento confirmado.','success');}
  }
  function openOS(){
    var p=current(),rows=Pedidos.balances(p).filter(function(b){return b.pedido>0&&normalizeItemStatus(b.item)!=='aguardando'&&(!Pedidos.known(p)||b.saldo>0);});
    if(!rows.length){error('Aceite as peças pendentes antes de gerar a OS de fabricação.');return;}
    modal('Selecionar peças para fabricação','<p class="pedido-help">A OS usa as quantidades que ainda faltam enviar. Gerar o documento não registra um envio.</p><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th></th><th>Peça</th><th>Medidas</th><th>Quantidade</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td><input type="checkbox" checked data-os-item="'+h(b.id)+'" aria-label="Selecionar '+h(b.item.desc)+'"></td><td>'+h(b.item.desc)+'</td><td>'+measures(b.item)+'</td><td>'+num(Pedidos.known(p)?b.saldo:b.pedido)+'</td></tr>';}).join('')+'</tbody></table></div>',button('cancel','Cancelar')+button('print-os','Gerar OS de fabricação',true));
  }
  function print(mode,shipmentId){
    var p=current();if(!allowed(p))return;
    var rows=Pedidos.balances(p).filter(function(b){return b.pedido>0;}),known=Pedidos.known(p),shipment=(p.remessas||[]).find(function(r){return r.id===shipmentId;}),title='Pedido de materiais';
    if(mode==='os'){
      var selected=Array.from(document.querySelectorAll('[data-os-item]:checked')).map(function(i){return i.dataset.osItem;});
      rows=rows.filter(function(b){return selected.indexOf(b.id)>=0;});
      if(!rows.length){error('Selecione ao menos uma peça.');return;}
      title='Ordem de fabricação';close();
    }
    if(mode==='shipment'){
      if(!shipment)return;
      title='Comprovante de envio';rows=shipment.itens.map(function(it){return {item:it,pedido:it.qtd,enviado:it.qtd,saldo:0};});
    }
    var cols=mode==='order'?'<th>Pedido</th><th>Enviado</th><th>Falta enviar</th>':'<th>Quantidade</th>';
    document.getElementById('printArea').innerHTML='<table><tr><td><img src="'+LOGO_URI+'" style="height:44px" alt="Sombrear"></td><td style="text-align:right"><h2>'+title+'</h2>'+h(p.filial_nome)+'<br>'+fmtDate(shipment?shipment.data:date())+'</td></tr></table><div class="pr-line"></div><h3>'+h(p.cliente)+'</h3><p>Estrutura: '+h(p.cor_estrutura)+' · Tela: '+h(p.cor_tela)+' · Vagas: '+num(p.vagas)+'</p><p>'+h(p.endereco||'')+'</p>'+(!known&&mode!=='shipment'?'<p>Envios anteriores ainda não conferidos pela sede.</p>':'')+'<table><thead><tr><th>Peça</th><th>Med. A</th><th>Med. B</th><th>Med. C</th><th>Unid.</th>'+cols+'</tr></thead><tbody>'+rows.map(function(b){var it=b.item;return '<tr><td>'+h(it.desc)+'</td><td>'+h(it.ma)+'</td><td>'+h(it.mb)+'</td><td>'+h(it.mc)+'</td><td>'+h(it.un)+'</td>'+(mode==='order'?'<td>'+num(b.pedido)+'</td><td>'+(known?num(b.enviado):'—')+'</td><td>'+(known?num(b.saldo):'—')+'</td>':'<td>'+num(mode==='os'&&known?b.saldo:b.pedido)+'</td>')+'</tr>';}).join('')+'</tbody></table>'+(shipment?'<p>'+h(shipment.obs)+'</p>':'')+'<div class="pr-sign-wrap" style="margin-top:60px"><div class="pr-sign">SOMBREAR INDÚSTRIA</div><div class="pr-sign">'+h(p.filial_nome)+'</div></div>';
    window.print();
  }
  async function refresh(hash,manual){
    if(loading||busy||!USER)return;
    if(!manual&&document.getElementById('modalOverlay').classList.contains('open'))return;
    loading=true;var startedAt=revision;
    try{
      var store=await read();
      if(!busy&&startedAt===revision){DB_CACHE.pedidos=store.value;buildSidebar();if(location.hash.slice(1)===hash)renderView(hash);}
      if(manual)showToast('Pedidos atualizados.','success');
    }catch(e){if(manual)error(e.message);}
    finally{loading=false;}
  }
  document.addEventListener('input',function(e){
    var t=e.target;
    if(draft&&t.dataset.field&&!t.dataset.field.startsWith('envio_'))draft.data[t.dataset.field]=t.value;
    if(draft&&t.dataset.lineField&&t.dataset.lineField!=='desc'){
      var it=draft.items[Number(t.dataset.line)];if(!it)return;
      it[t.dataset.lineField==='customDesc'?'desc':t.dataset.lineField]=t.value;
      draftTotal();
    }
  });
  document.addEventListener('change',function(e){
    var t=e.target;
    if(draft&&t.dataset.field&&!t.dataset.field.startsWith('envio_'))draft.data[t.dataset.field]=t.value;
    if(draft&&t.dataset.lineField==='desc'){
      var it=draft.items[Number(t.dataset.line)],cat=WZ_CATALOGO.find(function(c){return c.desc===t.value;});
      if(cat)Object.assign(it,cat,{custom:false,preco_unit:lookupPreco(cat.desc)});
      else Object.assign(it,{desc:'',custom:t.value==='__custom__',preco_unit:0});
      renderDraft();
    }
    if(t.dataset.production)production(t.dataset.production,t.value);
  });
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-p-action]');if(!t||busy)return;
    var action=t.dataset.pAction;
    if(action==='next'){
      if(!draft.data.cliente.trim()){error('Informe o nome do condomínio.');return;}
      try{Pedidos.qty(draft.data.vagas,'PÇ',false);}catch(err){error('Informe um número inteiro de vagas maior que zero.');return;}
      if(!draft.data.cor_estrutura.trim()||!draft.data.cor_tela.trim()){error('Informe as cores da estrutura e da tela.');return;}
      draft.step=2;renderDraft();
    }else if(action==='back'){draft.step=1;renderDraft();}
    else if(action==='add-row'){draft.items.push(blank());renderDraft();}
    else if(action==='remove'){draft.items.splice(Number(t.dataset.index),1);renderDraft();}
    else if(action==='submit')submit();
    else if(action==='cancel'){close();draft=null;}
    else if(action==='complement')openEditor('add');
    else if(action==='edit')openEditor('edit');
    else if(action==='approve')approve(current().id);
    else if(action==='dispatch'||action==='baseline')openDispatch(action==='baseline');
    else if(action==='save-dispatch')saveDispatch();
    else if(action==='receive')receive(t.dataset.shipment);
    else if(action==='refresh')refresh(location.hash.slice(1),true);
    else if(action==='list')location.hash=USER.role+'-pedidos';
    else if(action==='os')openOS();
    else if(action==='print-os')print('os');
    else if(action==='print')print('order');
    else if(action==='print-shipment')print('shipment',t.dataset.shipment);
  });
  window.PedidosUI={novo:novo,detail:detail,approve:approve,refresh:refresh,close:close};
})();
