(function(){
  'use strict';
  var activeId=null,modalDraft=null,working=false,homeSearch='',homeStatus='abertas',requestFocus=null;
  var h=function(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var num=function(value){return Number(value||0).toLocaleString('pt-BR',{maximumFractionDigits:3});};
  var labels={pasta_criada:'Pasta criada',criacao_pasta:'Pasta criada',solicitacao:'Peças solicitadas',demanda:'Peças solicitadas',demanda_adicionada:'Peças solicitadas',aceite:'Peças aceitas pela sede',aprovacao:'Peças aceitas pela sede',demanda_aprovada:'Peças aceitas pela sede',entrada:'Entrada de peças',entrada_estoque:'Entrada de peças',transferencia:'Remanejamento enviado',recebimento:'Recebimento confirmado',conferencia_inicial:'Estoque inicial conferido',saldo_inicial:'Estoque inicial conferido',instalacao:'Instalação conferida no fechamento',conferencia_fechamento:'Conferência de fechamento',finalizacao:'Obra finalizada',obra_finalizada:'Obra finalizada',reabertura:'Obra reaberta'};
  function app(){return window.EstoqueApp;}
  function state(){return app().getState();}
  function context(){return app().context();}
  function isSede(){return USER.role==='sede';}
  function dateTime(value){
    if(!value)return '—';
    var simple=/^\d{4}-\d{2}-\d{2}$/.test(String(value)),d=new Date(simple?value+'T12:00:00Z':value);
    if(!Number.isFinite(d.getTime()))return String(value);
    return d.toLocaleString('pt-BR',Object.assign({timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric'},simple?{}:{hour:'2-digit',minute:'2-digit'}));
  }
  function button(action,label,primary,attrs){return '<button type="button" class="btn '+(primary?'btn-primary':'btn-outline')+'" data-e-action="'+h(action)+'" '+(attrs||'')+'>'+label+'</button>';}
  function field(label,id,value,extra){return '<div class="fg"><label for="'+id+'">'+h(label)+'</label><input id="'+id+'" value="'+h(value)+'" '+(extra||'')+'></div>';}
  function visible(loc){return loc&&(isSede()||loc.id==='estoque-go'||loc.filial_id===USER.filial_id);}
  function owned(loc){return loc&&(isSede()?loc.id==='estoque-go':loc.filial_id===USER.filial_id&&loc.id!=='estoque-go');}
  function inactive(loc){return loc.tipo==='condominio'&&loc.pasta&&(loc.pasta.inativo||loc.pasta.status==='cancelado');}
  function writable(loc){return visible(loc)&&loc.ativo!==false&&!loc.finalizada&&!inactive(loc);}
  function canClose(loc){return writable(loc)&&!isSede()&&owned(loc);}
  function pasta(s,id){return s.pastas.find(function(p){return p.id===id;});}
  function current(s){return Estoque.getLocation(s||state(),activeId||window._pedidoId);}
  function name(s,id){var l=Estoque.getLocation(s,id);return l?l.nome:id||'';}
  function locationData(s,id){var loc=Estoque.getLocation(s,id);if(loc&&loc.tipo==='condominio'&&!loc.pasta)loc=Object.assign({},loc,{pasta:pasta(s,id)});return loc;}
  function open(id){
    close();activeId=id;window._pedidoId=id;
    if(app().open){app().open(id);return;}
    var hash=USER.role+'-pedido';if(location.hash.slice(1)===hash)detail(id);else location.hash=hash;
  }
  function modal(title,body,footer){
    openModal(title,body,footer);document.getElementById('modalBox').classList.add('estoque-modal');
  }
  function close(){closeModal();document.getElementById('modalBox').classList.remove('estoque-modal');modalDraft=null;}
  function error(message){var el=document.getElementById('estoqueError');if(el){el.textContent=message;el.scrollIntoView({block:'nearest'});}showToast(message,'error');}
  function inlineError(){return '<p id="estoqueError" class="estoque-error" role="alert"></p>';}
  async function commit(transform,onSuccess){
    if(working)return;working=true;
    try{var saved=await app().save(transform);if(saved){if(onSuccess)onSuccess(saved);return saved;}}
    catch(e){error(e.message||'Não foi possível salvar a alteração.');}
    finally{working=false;}
    return null;
  }
  function measure(peca){
    return [peca.ma,peca.mb,peca.mc].map(function(v){return String(v||'').trim();}).filter(function(v){return v&&!/^0(?:[.,]0+)?$/.test(v)&&v!=='—';}).join(' / ');
  }
  function piece(peca){
    var dims=measure(peca),colors=peca.cor?peca.cor:[peca.cor_estrutura?'Estrutura '+peca.cor_estrutura:'',peca.cor_tela?'Tela '+peca.cor_tela:''].filter(Boolean).join(' · ');
    return '<strong>'+h(peca.desc||'Peça')+'</strong>'+((dims||colors)?'<small>'+h([dims,colors].filter(Boolean).join(' · '))+'</small>':'');
  }
  function sumTypes(rows,key){return rows.filter(function(b){return Number(b[key])>0;}).length;}
  function transfers(s,id){return Estoque.pendingTransfers(s,id);}
  function statusTag(loc){
    if(loc.finalizada)return '<span class="estoque-tag estoque-tag-done">Obra finalizada</span>';
    if(inactive(loc))return '<span class="estoque-tag estoque-tag-muted">Arquivada</span>';
    return '<span class="estoque-tag">'+(loc.tipo==='estoque'?'Estoque disponível':'Obra em andamento')+'</span>';
  }
  function stockCard(s,loc){
    var rows=Estoque.balances(s,loc.id),pending=transfers(s,loc.id),received=pending.filter(function(m){return m.destino_id===loc.id;}).length;
    return '<article class="estoque-location-card estoque-warehouse"><div class="estoque-location-heading"><span class="estoque-location-icon" aria-hidden="true">▤</span><div><span class="estoque-eyebrow">Estoque da '+(loc.id==='estoque-go'?'sede':'filial')+'</span><h2>'+h(loc.nome)+'</h2></div></div><div class="estoque-card-stats"><div><strong>'+sumTypes(rows,'disponivel')+'</strong><span>tipos de peça em estoque</span></div><div><strong>'+pending.length+'</strong><span>remanejos em trânsito</span></div></div>'+(received?'<p class="estoque-attention">'+received+' recebimento(s) para conferir</p>':'<p class="estoque-help">'+(loc.id==='estoque-go'?'Peças prontas para abastecer as obras.':'Peças disponíveis para os condomínios da filial.')+'</p>')+button('open','Abrir estoque →',true,'data-id="'+h(loc.id)+'"')+'</article>';
  }
  function folderCard(s,loc){
    var p=loc.pasta||pasta(s,loc.id)||{},rows=Estoque.balances(s,loc.id),pending=transfers(s,loc.id),unfilled=Estoque.requests(s,loc.id).filter(function(r){return r.ativo&&r.status!=='enviado';}).length;
    return '<article class="estoque-location-card" data-e-folder="'+h(loc.id)+'"><div class="estoque-location-heading"><span class="estoque-location-icon estoque-folder-icon" aria-hidden="true">▱</span><div><h3>'+h(loc.nome)+'</h3><p>'+h(p.filial_nome||'Condomínio')+'</p></div></div><div>'+statusTag(loc)+'</div><dl class="estoque-folder-info"><div><dt>Estrutura</dt><dd>'+h(p.cor_estrutura||'—')+'</dd></div><div><dt>Tela</dt><dd>'+h(p.cor_tela||'—')+'</dd></div><div><dt>Vagas</dt><dd>'+num(p.vagas)+'</dd></div></dl><div class="estoque-folder-summary"><span>'+(sumTypes(rows,'disponivel')+' tipos em estoque')+'</span><span>'+pending.length+' em trânsito</span></div>'+(unfilled&&!loc.finalizada?'<p class="estoque-attention">'+unfilled+' solicitação(ões) com envio pendente</p>':'')+button('open','Abrir pasta →',false,'data-id="'+h(loc.id)+'"')+'</article>';
  }
  function folderGrid(s){
    var query=homeSearch.trim().toLocaleLowerCase('pt-BR'),list=Estoque.locations(s).filter(function(l){return l.tipo==='condominio'&&visible(l);}).map(function(l){return locationData(s,l.id);});
    list=list.filter(function(l){return (homeStatus==='todas'||(homeStatus==='finalizadas'?l.finalizada:!l.finalizada))&&(!query||[l.nome,l.pasta&&l.pasta.filial_nome].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0);});
    return list.length?list.map(function(l){return folderCard(s,l);}).join(''):'<div class="estoque-empty"><strong>'+((homeSearch||homeStatus==='finalizadas')?'Nenhuma pasta encontrada.':'Comece pela pasta do condomínio.')+'</strong><p>'+((homeSearch||homeStatus==='finalizadas')?'Ajuste a busca ou o filtro para ver outras pastas.':'Cadastre os dados gerais. Depois, lance as peças pelo catálogo.')+'</p>'+(!isSede()&&!homeSearch&&homeStatus==='abertas'?button('create-folder','+ Criar pasta do condomínio',true):'')+'</div>';
  }
  function home(){
    activeId=null;var s=state(),el=document.getElementById('view-'+USER.role+'-pedidos');if(!el)return;
    var stocks=Estoque.locations(s).filter(function(l){return l.tipo==='estoque'&&visible(l);});
    el.innerHTML='<section class="estoque-view"><div class="page-hdr"><div><h1>Pastas e estoques</h1><p>Peças solicitadas, remanejamentos e saldo de cada obra em um só lugar.</p></div><div class="estoque-actions">'+button('refresh','↻ Atualizar')+(!isSede()?button('create-folder','+ Criar pasta do condomínio',true):'')+'</div></div><div class="estoque-stock-grid">'+stocks.map(function(l){return stockCard(s,l);}).join('')+'</div>'+(isSede()?pendingRequestsSection(s,true):'')+'<div class="estoque-section-header"><div><h2>Pastas dos condomínios</h2><p>Abra uma pasta para lançar peças e acompanhar a obra.</p></div><div class="estoque-filters"><input type="search" id="e_folder_search" aria-label="Buscar condomínio" placeholder="Buscar condomínio..." value="'+h(homeSearch)+'"><select id="e_folder_status" aria-label="Filtrar situação da obra"><option value="abertas" '+(homeStatus==='abertas'?'selected':'')+'>Obras em andamento</option><option value="finalizadas" '+(homeStatus==='finalizadas'?'selected':'')+'>Obras finalizadas</option><option value="todas" '+(homeStatus==='todas'?'selected':'')+'>Todas as pastas</option></select></div></div><div class="estoque-folder-grid" id="e_folder_grid">'+folderGrid(s)+'</div></section>';
  }
  function summaryCell(label,value){return '<div><small>'+h(label)+'</small><strong>'+h(value)+'</strong></div>';}
  function pendingRequests(s){return Estoque.requests(s).filter(function(r){return r.ativo&&r.itens.some(function(it){return it.pendente>0;});});}
  function requestStatus(r){return '<span class="estoque-tag '+(r.status==='enviado'?'estoque-tag-done':'estoque-tag-warning')+'">'+({pendente:'Aguardando envio',parcial:'Envio parcial',enviado:'Enviada'}[r.status]||'Aguardando envio')+'</span>';}
  function requestCard(s,r,title,showLocation){
    var canSend=isSede()&&r.ativo&&r.itens.some(function(it){return it.pendente>0;}),awaiting=r.itens.some(function(it){return it.enviado>it.recebido;});
    return '<article class="estoque-request" data-e-request="'+h(r.id)+'"><header><div><h3>'+h(showLocation?r.condominio:title)+'</h3><p>'+h(dateTime(r.data))+' · '+h(r.usuario_nome||r.filial_nome||'Filial')+(showLocation&&r.filial_nome&&r.filial_nome!==r.usuario_nome?' · '+h(r.filial_nome):'')+'</p></div><div class="estoque-actions">'+requestStatus(r)+(canSend?button('dispatch-request','Enviar peças',true,'data-id="'+h(r.id)+'"'):'')+(showLocation?button('request','Abrir pasta',false,'data-id="'+h(r.id)+'"'):'')+'</div></header><div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th><th class="estoque-num">Solicitado</th><th class="estoque-num">Enviado</th><th class="estoque-num">Recebido</th><th class="estoque-num">Falta enviar</th></tr></thead><tbody>'+r.itens.map(function(it){return '<tr data-e-request-row="'+h(it.key)+'"><td class="estoque-piece">'+piece(it.peca)+'</td><td>'+h(it.peca.un)+'</td><td class="estoque-num" data-e-request-value="solicitado">'+num(it.solicitado)+'</td><td class="estoque-num" data-e-request-value="enviado">'+num(it.enviado)+'</td><td class="estoque-num" data-e-request-value="recebido">'+num(it.recebido)+'</td><td class="estoque-num estoque-request-pending" data-e-request-value="pendente">'+num(it.pendente)+'</td></tr>';}).join('')+'</tbody></table></div>'+(awaiting?'<p class="estoque-help estoque-request-note">Há peças enviadas aguardando o CONFERIDO da filial.</p>':'')+'</article>';
  }
  function requestsSection(s,loc){
    var list=Estoque.requests(s,loc.id);
    return '<div class="card estoque-requests"><div class="card-hdr"><div><h2>Solicitações de peças</h2><p class="estoque-help">Cada lançamento mantém seu solicitado, enviado, recebido e saldo pendente.</p></div><span class="estoque-tag estoque-tag-muted">'+list.length+'</span></div><div class="estoque-table-body">'+(list.length?list.slice().reverse().map(function(r,i){return requestCard(s,r,'Solicitação '+(list.length-i),false);}).join(''):'<div class="estoque-empty"><strong>Nenhuma solicitação nesta pasta.</strong><p>A filial pode criar uma solicitação escolhendo as peças e as quantidades no catálogo.</p></div>')+'</div></div>';
  }
  function pendingRequestsSection(s,compact){
    var list=pendingRequests(s),shown=compact?list.slice(0,6):list;
    return '<div class="card estoque-pending-requests" id="e_requests_pending"><div class="card-hdr"><div><h2>Solicitações pendentes</h2><p class="estoque-help">'+list.length+' solicitação(ões) aguardando envio total ou parcial.</p></div>'+(compact?button('requests-page','Ver todas'):'')+'</div>'+(shown.length?'<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Condomínio / filial</th><th>Solicitação</th><th>Pendências</th><th></th></tr></thead><tbody>'+shown.map(function(r){return '<tr><td><strong>'+h(r.condominio)+'</strong><small>'+h(r.filial_nome||'')+'</small></td><td>'+h(dateTime(r.data))+'<small>'+h(r.usuario_nome||'')+'</small></td><td>'+requestStatus(r)+'<small>'+r.itens.filter(function(it){return it.pendente>0;}).length+' tipo(s) de peça</small></td><td>'+button('request','Abrir solicitação →',false,'data-id="'+h(r.id)+'"')+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="card-body"><p class="estoque-help">Todas as solicitações ativas foram enviadas.</p></div>')+'</div>';
  }
  function requestsPage(){
    if(!isSede())return;activeId=null;var s=state(),list=pendingRequests(s),el=document.getElementById('view-sede-aprovacoes');if(!el)return;
    el.innerHTML='<section class="estoque-view"><div class="page-hdr"><div><h1>Solicitações pendentes</h1><p>Envie as peças disponíveis no estoque GO. O restante continua pendente até o próximo envio.</p></div><div class="estoque-actions">'+button('refresh','↻ Atualizar')+button('print-pending','Imprimir pendências',true,list.length?'':'disabled')+'</div></div>'+(!list.length?'<div class="estoque-empty"><strong>Nenhuma solicitação pendente.</strong><p>Novos lançamentos das filiais aparecerão aqui.</p></div>':'<div class="card estoque-requests">'+list.map(function(r){return requestCard(s,r,'',true);}).join('')+'</div>')+'</section>';
  }
  function printPending(){
    if(!isSede())return;
    var list=pendingRequests(state()),area=document.getElementById('printArea');
    if(!area)return;
    if(!list.length){showToast('Não há solicitações pendentes para imprimir.','info');return;}
    var locations=new Set(list.map(function(r){return r.pasta_id;}));
    area.innerHTML='<div class="estoque-print estoque-pending-print"><div class="estoque-print-heading">'+(typeof LOGO_URI==='string'?'<img src="'+h(LOGO_URI)+'" alt="Sombrear" style="height:40px">':'')+'<h1>Solicitações pendentes</h1></div><p class="estoque-pending-print-meta">Emitido em '+h(dateTime(new Date().toISOString()))+' · '+h(USER.nome)+'</p><p>'+list.length+' solicitações · '+locations.size+' condomínios</p><p class="estoque-pending-print-help">Lista de trabalho da sede. Quantidades ainda pendentes de envio na emissão deste documento.</p>'+list.map(function(r,index){
      var items=r.itens.filter(function(it){return it.pendente>0;});
      return '<section class="estoque-pending-print-request" data-print-request="'+h(r.id)+'"><table class="estoque-table"><colgroup><col style="width:48%"><col style="width:8%"><col style="width:14%"><col style="width:14%"><col style="width:16%"></colgroup><thead><tr class="estoque-pending-print-context"><th colspan="5"><h2>'+h(r.condominio)+'</h2><p>'+h(r.filial_nome||'')+' · Solicitação '+(index+1)+' · '+h(dateTime(r.data))+(r.usuario_nome?' · '+h(r.usuario_nome):'')+'</p></th></tr><tr><th>Peça / medidas / cores</th><th>Unid.</th><th class="estoque-num">Solicitado</th><th class="estoque-num">Enviado</th><th class="estoque-num">Falta enviar</th></tr></thead><tbody>'+items.map(function(it){return '<tr data-print-item="'+h(it.key)+'"><td class="estoque-piece">'+piece(it.peca)+'</td><td>'+h(it.peca.un)+'</td><td class="estoque-num">'+num(it.solicitado)+'</td><td class="estoque-num">'+num(it.enviado)+'</td><td class="estoque-num estoque-pending-print-qty" data-print-pending="'+h(it.pendente)+'">'+num(it.pendente)+'</td></tr>';}).join('')+'</tbody></table><div class="estoque-pending-print-notes"><p>Responsável: ________________________________ &nbsp; Prazo: ____/____/________</p><p>Observações: __________________________________________________________</p></div></section>';
    }).join('')+'</div>';
    var previousTitle=document.title;
    document.title='Sombrear - Solicitações pendentes';
    try{window.print();}finally{document.title=previousTitle;}
  }
  function focusRequestCard(){
    if(!requestFocus)return;var id=requestFocus;requestFocus=null;
    var container=document.getElementById('view-'+USER.role+'-pedido'),target=container&&Array.from(container.querySelectorAll('[data-e-request]')).find(function(el){return el.dataset.eRequest===id;});
    if(target){target.classList.add('estoque-request-highlight');setTimeout(function(){if(target.isConnected)target.scrollIntoView({block:'start',behavior:'smooth'});},0);}
  }
  function openRequest(id){
    var s=state(),r=Estoque.requests(s).find(function(entry){return entry.id===id;});
    if(!r||!visible(locationData(s,r.pasta_id))){error('Solicitação não encontrada. Atualize a página.');return;}
    requestFocus=id;open(r.pasta_id);
  }
  function openRequestDispatch(id){
    if(!isSede())return;var s=state(),request=Estoque.requests(s).find(function(r){return r.id===id;});
    if(!request||!request.ativo){error('Esta solicitação não está disponível para envio.');return;}
    var stock=Estoque.balances(s,'estoque-go'),rows=request.itens.filter(function(it){return it.pendente>0;}).map(function(it){var b=stock.find(function(entry){return entry.key===it.key;});return Object.assign({},it,{disponivel:b?b.disponivel:0});});
    if(!rows.length){error('Todas as peças desta solicitação já foram enviadas.');return;}
    modalDraft={type:'request-dispatch',requestId:id,locationId:request.pasta_id,rows:rows,id:crypto.randomUUID()};
    modal('Enviar peças — '+request.condominio,'<p class="estoque-help">Origem: Estoque Sombrear GO. Informe o que será enviado agora; as quantidades restantes continuam pendentes nesta solicitação.</p><div class="tbl-wrap"><table class="estoque-table estoque-input-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th><th class="estoque-num">Falta enviar</th><th class="estoque-num">Saldo GO</th><th>Enviar agora</th></tr></thead><tbody>'+rows.map(function(it){return '<tr><td class="estoque-piece">'+piece(it.peca)+'</td><td>'+h(it.peca.un)+'</td><td class="estoque-num">'+num(it.pendente)+'</td><td class="estoque-num">'+num(it.disponivel)+'</td><td><input type="number" min="0" max="'+Math.min(it.pendente,it.disponivel)+'" step="any" value="0" aria-label="Enviar '+h(it.peca.desc)+' desta solicitação" data-e-request-key="'+h(it.key)+'" '+(it.disponivel<=0?'disabled':'')+'>'+(it.disponivel<=0?'<small>Sem saldo no GO</small>':'')+'</td></tr>';}).join('')+'</tbody></table></div>'+field('Observações / transporte (opcional)','e_request_obs','','placeholder="Motorista, veículo ou observações do envio"')+inlineError(),button('cancel','Cancelar')+button('save-request-dispatch','Registrar envio',true));
  }
  async function saveRequestDispatch(){
    var d=modalDraft;if(!d||d.type!=='request-dispatch')return;var entries=[];
    try{document.querySelectorAll('[data-e-request-key]').forEach(function(input){var row=d.rows.find(function(it){return it.key===input.dataset.eRequestKey;}),qtd=numeric(input.value,row.peca.un);if(qtd>row.pendente)throw new Error('A quantidade de '+row.peca.desc+' supera o que falta enviar nesta solicitação.');if(qtd>row.disponivel)throw new Error('A quantidade de '+row.peca.desc+' supera o saldo disponível no GO.');if(qtd>0)entries.push({key:row.key,qtd:qtd});});}catch(e){error(e.message);return;}
    if(!entries.length){error('Informe a quantidade de pelo menos uma peça para enviar.');return;}
    var ctx=context(),meta={id:d.id,obs:document.getElementById('e_request_obs').value};
    await commit(function(s){return Estoque.dispatchRequest(s,d.requestId,entries,ctx,meta);},function(){close();render();showToast('Envio registrado. Solicitação atualizada.','success');});
  }
  function balanceTable(loc,rows){
    var folder=loc.tipo==='condominio',body=rows.map(function(b){
      return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td>'+(folder?'<td class="estoque-num">'+num(b.solicitado)+'</td>':'')+'<td class="estoque-num estoque-available">'+num(b.disponivel)+'</td><td class="estoque-num">'+num(b.em_transito_entrada)+(b.em_transito_saida?'<small>'+num(b.em_transito_saida)+' saindo</small>':'')+'</td>'+(folder?'<td class="estoque-num">'+num(b.instalado)+'</td>':'')+'</tr>';
    }).join('');
    return '<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th>'+(folder?'<th class="estoque-num">Solicitado</th>':'')+'<th class="estoque-num">Em estoque</th><th class="estoque-num">A receber</th>'+(folder?'<th class="estoque-num">Instalado</th>':'')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
  }
  function canReceive(s,m){var dest=locationData(s,m.destino_id);return dest&&writable(dest)&&owned(dest);}
  function transitSection(s,loc){
    var pending=transfers(s,loc.id);if(!pending.length)return '';
    var cards=pending.map(function(m){
      var incoming=m.destino_id===loc.id;
      return '<article class="estoque-transfer"><header><div><span class="estoque-tag estoque-tag-warning">'+(incoming?'A receber':'Enviado · aguardando recebimento')+'</span><h3>'+h(name(s,m.origem_id))+' → '+h(name(s,m.destino_id))+'</h3><p>'+h(dateTime(m.criado_em||m.data))+' · '+h(m.usuario_nome||'')+'</p></div>'+(incoming&&canReceive(s,m)?button('receive','CONFERIDO',true,'data-id="'+h(m.id)+'"'):'')+'</header><ul>'+movementItems(m)+'</ul>'+(m.obs?'<p class="estoque-help">'+h(m.obs)+'</p>':'')+'</article>';
    }).join('');
    return '<div class="card estoque-transit"><div class="card-hdr"><h2>Remanejamentos em trânsito</h2><span class="estoque-tag estoque-tag-warning">'+pending.length+'</span></div><div class="card-body"><p class="estoque-help">Confira as quantidades abaixo. Ao clicar em CONFERIDO, as peças entram no estoque do destino.</p>'+cards+'</div></div>';
  }
  function movementItems(m){return (m.itens||[]).map(function(it){var p=it.peca||it;return '<li><strong>'+num(it.qtd===undefined?(it.disponivel||0):it.qtd)+' '+h(p.un||'')+'</strong> · '+h(p.desc||'Peça')+(measure(p)?' · '+h(measure(p)):'')+(p.cor?' · '+h(p.cor):'')+(it.instalado!==undefined?' · '+num(it.instalado)+' instalado(s)':'')+'</li>';}).join('');}
  function historyHtml(s,events){
    if(!events.length)return '<p class="estoque-help">As movimentações desta pasta serão registradas aqui, com data, responsável e peças.</p>';
    return '<ol class="estoque-history">'+events.slice().reverse().map(function(m){
      var route=m.origem_id||m.destino_id?[m.origem_nome||name(s,m.origem_id),m.destino_nome||name(s,m.destino_id)].filter(Boolean).join(' → '):'';
      return '<li><div class="estoque-event-heading"><strong>'+h(labels[m.tipo]||String(m.tipo||'Registro').replace(/_/g,' '))+'</strong><time>'+h(dateTime(m.criado_em||m.data))+'</time></div><p>'+h(m.usuario_nome||m.user||'Responsável não informado')+'</p>'+(route?'<p class="estoque-route">'+h(route)+'</p>':'')+(m.itens&&m.itens.length?'<details><summary>'+m.itens.length+' tipo(s) de peça · ver quantidades</summary><ul>'+movementItems(m)+'</ul></details>':'')+(m.obs?'<p class="estoque-event-note">'+h(m.obs)+'</p>':'')+'</li>';
    }).join('')+'</ol>';
  }
  function legacyHistory(p){
    if(!p)return '';
    p=Object.assign({},p,{log:(p.log||[]).filter(function(l){return !l.movimento_id;})});
    if(!p.log.length&&!(p.remessas||[]).length)return '';
    return '<details class="estoque-legacy-history"><summary>Registros anteriores desta pasta</summary><p class="estoque-help">Histórico preservado dos pedidos e envios anteriores.</p>'+(p.remessas||[]).slice().reverse().map(function(r){return '<article><strong>Remessa · '+h(dateTime(r.data))+'</strong><p>'+h(r.user||'')+(r.recebido_em?' · Recebida em '+h(dateTime(r.recebido_em)):' · Sem confirmação no registro anterior')+'</p><ul>'+movementItems(r)+'</ul>'+(r.obs?'<p>'+h(r.obs)+'</p>':'')+'</article>';}).join('')+'<ul>'+(p.log||[]).slice().reverse().map(function(l){return '<li>'+h(dateTime(l.data))+' · '+h(l.user||'')+' · '+h(l.obs||l.status||'Registro')+'</li>';}).join('')+'</ul></details>';
  }
  function closureNotice(s,loc){
    if(loc.tipo!=='condominio'||!loc.finalizada)return '';
    return '<div class="estoque-notice estoque-notice-success"><strong>Obra finalizada em '+h(dateTime(loc.pasta.finalizado_em))+'.</strong><p>O relatório final preserva as peças instaladas e todas as movimentações deste fechamento.</p>'+button('report','Ver relatório final',true)+'</div>';
  }
  function detail(id){
    activeId=id;window._pedidoId=id;var s=state(),loc=locationData(s,id),el=document.getElementById('view-'+USER.role+'-pedido');if(!el)return;
    if(!visible(loc)){el.innerHTML='<div class="estoque-empty">Pasta ou estoque não encontrado.</div>';return;}
    var folder=loc.tipo==='condominio',p=loc.pasta||{},rows=Estoque.balances(s,id),active=writable(loc),canMove=active&&owned(loc)&&sumTypes(rows,'disponivel')>0;
    var actions=button('refresh','↻ Atualizar');
    if(active&&((folder&&!isSede())||(!folder&&owned(loc))))actions+=button('add-items',folder?'+ Nova solicitação':'+ Adicionar peças',true,'data-mode="'+(folder?'demanda':'estoque')+'"');
    if(canMove)actions+=button('transfer','Remanejar peças');
    if(folder&&canClose(loc))actions+=button('finalize','Finalizar obra');
    if(folder)actions+=button('report',loc.finalizada?'Relatório final':'Conferência / PDF');
    if(folder&&loc.finalizada&&isSede())actions+=button('reopen','Reabrir obra');
    var summary=folder?summaryCell('Cor da estrutura',p.cor_estrutura||'—')+summaryCell('Cor da tela',p.cor_tela||'—')+summaryCell('Número de vagas',num(p.vagas))+summaryCell('Tipos de peça em estoque',sumTypes(rows,'disponivel')):summaryCell('Tipos de peça em estoque',sumTypes(rows,'disponivel'))+summaryCell('Remanejamentos em trânsito',transfers(s,id).length);
    var noRows='<div class="estoque-empty"><strong>'+(folder?'Nenhuma peça lançada nesta pasta.':'O estoque ainda está vazio.')+'</strong><p>'+(folder?'Crie uma solicitação pelo catálogo para pedir as peças deste condomínio.':'Registre as peças prontas para disponibilizá-las aos condomínios.')+'</p>'+((active&&((folder&&!isSede())||(!folder&&owned(loc))))?button('add-items',folder?'+ Nova solicitação':'+ Adicionar peças',true,'data-mode="'+(folder?'demanda':'estoque')+'"'):'')+'</div>';
    var details=folder?'<details class="card estoque-general"><summary class="card-hdr">Informações do condomínio</summary><div class="card-body"><div class="form-grid">'+['endereco','cnpj','sindico','contato','email','tipo','chumbacao','pilares'].map(function(k,i){return '<div><small>'+['Endereço','CNPJ','Responsável','Telefone','E-mail','Cobertura','Chumbação','Pilares'][i]+'</small><p>'+h(p[k]||'—')+'</p></div>';}).join('')+'</div></div></details>':'';
    el.innerHTML='<section class="estoque-view"><div class="page-hdr"><div><button type="button" class="btn btn-ghost btn-sm" data-e-action="list">← Pastas e estoques</button><h1>'+h(loc.nome)+'</h1><p>'+h(folder?(p.filial_nome||'Condomínio'):(loc.id==='estoque-go'?'Sede · peças prontas':'Filial · peças disponíveis'))+'</p></div>'+statusTag(loc)+'</div><div class="estoque-actions estoque-main-actions">'+actions+'</div><div class="estoque-summary '+(!folder?'estoque-summary-compact':'')+'">'+summary+'</div>'+closureNotice(s,loc)+(folder?requestsSection(s,loc):'')+'<div class="card"><div class="card-hdr"><div><h2>'+ (folder?'Peças do condomínio':'Peças em estoque')+'</h2><p class="estoque-help">'+(folder?'O estoque reúne as peças recebidas. Remaneje as sobras antes de finalizar; o saldo que ficar será registrado como instalado.':'Somente as peças recebidas e disponíveis podem ser remanejadas.')+'</p></div></div><div class="estoque-table-body">'+(rows.length?balanceTable(loc,rows):noRows)+'</div></div>'+transitSection(s,loc)+'<div class="card"><div class="card-hdr"><h2>Histórico de movimentações</h2></div><div class="card-body">'+historyHtml(s,Estoque.history(s,id))+legacyHistory(p)+'</div></div>'+details+'</section>';
    focusRequestCard();
  }
  function render(){var hash=location.hash.slice(1);if(hash==='sede-aprovacoes')requestsPage();else if(hash===USER.role+'-pedido')detail(window._pedidoId);else home();}
  function openTransfer(){
    var s=state(),loc=current(s);if(!loc||!writable(loc)||!owned(loc))return;
    var rows=Estoque.balances(s,loc.id).filter(function(b){return b.disponivel>0;}),targets=Estoque.locations(s).filter(function(l){return l.id!==loc.id&&l.id!=='estoque-go'&&writable(locationData(s,l.id))&&(isSede()||l.filial_id===USER.filial_id);});
    if(!rows.length){error('Não há peças disponíveis para remanejar.');return;}
    if(!targets.length){error('Não há destino disponível. Crie uma pasta ativa na filial para remanejar as peças.');return;}
    modalDraft={type:'transfer',locationId:loc.id,rows:rows,id:crypto.randomUUID()};
    modal('Remanejar peças — '+loc.nome,'<p class="estoque-help">Escolha o destino e informe o que está saindo. As peças ficam em trânsito até a confirmação de quem recebe.</p><div class="form-grid"><div class="fg"><label for="e_transfer_destino">Destino *</label><select id="e_transfer_destino"><option value="">Selecione o estoque ou condomínio</option>'+targets.map(function(l){return '<option value="'+h(l.id)+'">'+h(l.nome)+'</option>';}).join('')+'</select></div>'+field('Observações / transporte','e_transfer_obs','','placeholder="Ex.: motorista, veículo ou motivo do remanejamento"')+'</div><div class="tbl-wrap"><table class="estoque-table estoque-input-table"><thead><tr><th>Peça</th><th>Unid.</th><th class="estoque-num">Disponível</th><th>Enviar agora</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td class="estoque-num">'+num(b.disponivel)+'</td><td><input type="number" min="0" max="'+b.disponivel+'" step="any" value="0" aria-label="Enviar '+h(b.peca.desc)+'" data-e-transfer-key="'+h(b.key)+'"></td></tr>';}).join('')+'</tbody></table></div>'+inlineError(),button('cancel','Cancelar')+button('save-transfer','Registrar remanejamento',true));
  }
  function numeric(value,unit){return Estoque.qty(value,unit,true);}
  async function saveTransfer(){
    var d=modalDraft;if(!d||d.type!=='transfer')return;
    var destination=document.getElementById('e_transfer_destino').value,entries=[];
    if(!destination){error('Selecione o destino das peças.');return;}
    try{document.querySelectorAll('[data-e-transfer-key]').forEach(function(input){var b=d.rows.find(function(r){return r.key===input.dataset.eTransferKey;}),qtd=numeric(input.value,b.peca.un);if(qtd>b.disponivel)throw new Error('A quantidade de '+b.peca.desc+' supera o saldo disponível.');if(qtd>0)entries.push({key:b.key,qtd:qtd});});}catch(e){error(e.message);return;}
    if(!entries.length){error('Informe a quantidade de pelo menos uma peça para remanejar.');return;}
    var meta={id:d.id,obs:document.getElementById('e_transfer_obs').value},ctx=context();
    await commit(function(s){return Estoque.transfer(s,d.locationId,destination,entries,ctx,meta);},function(){close();detail(d.locationId);showToast('Remanejamento registrado. Aguardando confirmação do destino.','success');});
  }
  async function receive(id){
    var s=state(),m=transfers(s,activeId).find(function(t){return t.id===id;});if(!m||!canReceive(s,m))return;
    var ctx=context(),locationId=activeId;
    await commit(function(latest){return Estoque.receive(latest,id,ctx,{id:'recebimento:'+id});},function(){detail(locationId);showToast('Recebimento conferido. Peças disponíveis no estoque.','success');});
  }
  function openFinalize(){
    var s=state(),loc=locationData(s,activeId);if(!loc||!canClose(loc))return;
    var rows=Estoque.balances(s,loc.id),moving=transfers(s,loc.id).length,unfilled=Estoque.requests(s,loc.id).filter(function(r){return r.itens.some(function(it){return it.pendente>0;});}).length;
    modalDraft={type:'finalize',locationId:loc.id,id:crypto.randomUUID(),moving:moving,expected:rows.map(function(b){return {key:b.key,disponivel:b.disponivel,instalado:b.instalado};})};
    modal('Finalizar obra — '+loc.nome,'<p class="estoque-help">Remaneje as sobras antes de finalizar. O saldo que permanecer nesta pasta será registrado como instalado e o estoque será zerado.</p>'+(moving?'<div class="estoque-notice"><strong>'+moving+' remanejamento(s) ainda em trânsito.</strong><p>Aguarde a confirmação dos recebimentos antes de finalizar a obra.</p></div>':'')+'<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th><th class="estoque-num">Saldo a registrar como instalado</th><th class="estoque-num">Total instalado no relatório</th></tr></thead><tbody>'+rows.map(function(b){return '<tr data-e-close-key="'+h(b.key)+'"><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td class="estoque-num estoque-available">'+num(b.disponivel)+'</td><td class="estoque-num">'+num(b.instalado+b.disponivel)+(b.instalado?'<small>'+num(b.instalado)+' já registrado(s) como instalado(s)</small>':'')+'</td></tr>';}).join('')+'</tbody></table></div>'+(!rows.length?'<p class="estoque-help">Esta pasta não possui peças registradas.</p>':'')+(unfilled?'<p class="estoque-help">Ainda há '+unfilled+' solicitação(ões) com peças não enviadas. Ao finalizar, elas sairão da fila de pendências e ficarão preservadas no histórico da obra.</p>':'')+'<label class="estoque-check"><input type="checkbox" id="e_close_remaining_confirm"> Conferi a instalação e já remanejei todas as sobras. O saldo desta prévia corresponde às peças que ficaram instaladas na obra.</label>'+field('Observações do fechamento (opcional)','e_close_obs','','placeholder="Observações sobre a conclusão da obra"')+inlineError(),button('cancel','Voltar')+(sumTypes(rows,'disponivel')?button('transfer','Remanejar sobras'):'')+button('confirm-finalize','Finalizar e gerar relatório',true,'id="e_close_submit" disabled'));
  }
  async function finalize(){
    var d=modalDraft;if(!d||d.type!=='finalize')return;
    if(!document.getElementById('e_close_remaining_confirm').checked){error('Confirme que as sobras foram remanejadas e que o saldo corresponde ao instalado.');return;}
    if(d.moving){error('Aguarde a confirmação dos remanejamentos em trânsito.');return;}
    var ctx=context(),meta={id:d.id,obs:document.getElementById('e_close_obs').value,expected:d.expected};
    await commit(function(s){return Estoque.closeWithRemaining(s,d.locationId,ctx,meta);},function(){close();detail(d.locationId);openReport();showToast('Obra finalizada. Relatório final gerado.','success');});
  }
  function openReopen(){
    var s=state(),loc=current(s);if(!loc||!loc.finalizada||!isSede())return;
    modalDraft={type:'reopen',locationId:loc.id,id:crypto.randomUUID()};
    modal('Reabrir obra — '+loc.nome,'<p class="estoque-help">O relatório anterior será preservado no histórico de fechamentos. A justificativa ficará registrada para a filial e a sede.</p><div class="fg"><label for="e_reopen_obs">Motivo da reabertura *</label><textarea id="e_reopen_obs" placeholder="Descreva por que a obra precisa ser reaberta."></textarea></div>'+inlineError(),button('cancel','Cancelar')+button('save-reopen','Reabrir obra',true));
  }
  async function reopen(){
    var d=modalDraft;if(!d||d.type!=='reopen')return;var obs=document.getElementById('e_reopen_obs').value.trim();if(!obs){error('Informe o motivo da reabertura.');return;}
    var ctx=context();await commit(function(s){return Estoque.reopen(s,d.locationId,ctx,{id:d.id,obs:obs});},function(){close();detail(d.locationId);showToast('Obra reaberta. O relatório anterior foi preservado.','success');});
  }
  function reportBody(r,finalReport){
    return '<h3>'+h(r.condominio)+'</h3><p>'+h(r.filial_nome||'')+' · Estrutura: '+h(r.cor_estrutura||'—')+' · Tela: '+h(r.cor_tela||'—')+' · Vagas: '+num(r.vagas)+'</p><p>'+ (finalReport?'Finalizada em '+h(dateTime(r.finalizado_em))+' · '+h(typeof r.finalizado_por==='object'?(r.finalizado_por.nome||r.finalizado_por.usuario_nome||''):r.finalizado_por||''):'Conferência emitida em '+h(dateTime(r.gerado_em)))+'</p>'+'<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th><th>Solicitado</th><th>Recebido</th><th>Remanejado</th><th>Instalado</th><th>Saldo</th><th>Diferença *</th></tr></thead><tbody>'+(r.itens||[]).map(function(b){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td>'+num(b.solicitado)+'</td><td>'+num(b.recebido)+'</td><td>'+num(b.enviado)+'</td><td>'+num(b.instalado)+'</td><td>'+num(b.disponivel)+'</td><td>'+num(b.diferenca)+'</td></tr>';}).join('')+'</tbody></table></div><p class="estoque-help">* Diferença entre o solicitado e o instalado. Quantidade positiva indica peças solicitadas que não foram instaladas.</p>'+(finalReport?'<p class="estoque-help">Este relatório corresponde ao fechamento registrado. Estoque físico zerado e nenhuma peça em trânsito.</p>':'');
  }
  function openReport(){
    var s=state(),loc=locationData(s,activeId);if(!loc||loc.tipo!=='condominio'||!visible(loc))return;
    var r=Estoque.report(s,loc.id);modalDraft={type:'report',report:r,finalReport:loc.finalizada,locationId:loc.id};
    var previous=(loc.pasta.relatorios_finais||[]).length;
    modal(loc.finalizada?'Relatório final do condomínio':'Conferência do condomínio',reportBody(r,loc.finalizada)+(previous?'<p class="estoque-help">'+previous+' relatório(s) de fechamentos anteriores preservados nesta pasta.</p>':'')+'<details class="estoque-report-history"><summary>Histórico completo de movimentações</summary>'+historyHtml(s,r.movimentacoes||[])+'</details>',button('cancel','Fechar')+button('print-report','Imprimir / salvar PDF',true));
  }
  function printReport(){
    var d=modalDraft;if(!d||d.type!=='report')return;
    var s=state(),r=d.report,area=document.getElementById('printArea');if(!area)return;
    area.innerHTML='<div class="estoque-print"><div class="estoque-print-heading">'+(typeof LOGO_URI==='string'?'<img src="'+h(LOGO_URI)+'" alt="Sombrear" style="height:44px">':'')+'<h2>'+ (d.finalReport?'Relatório final da obra':'Conferência de materiais')+'</h2></div>'+reportBody(r,d.finalReport)+'<h3>Histórico de movimentações</h3>'+historyHtml(s,r.movimentacoes||[]).replace(/<details>/g,'<details open>')+'<div class="pr-sign-wrap" style="margin-top:48px"><div class="pr-sign">SOMBREAR INDÚSTRIA</div><div class="pr-sign">'+h(r.filial_nome||'RESPONSÁVEL PELA OBRA')+'</div></div></div>';window.print();
  }
  async function refresh(){
    if(working)return;try{await app().refresh(location.hash.slice(1),true);}catch(e){error(e.message||'Não foi possível atualizar.');}
  }
  document.addEventListener('input',function(e){
    if(e.target.id==='e_folder_search'){homeSearch=e.target.value;var grid=document.getElementById('e_folder_grid');if(grid)grid.innerHTML=folderGrid(state());}
  });
  document.addEventListener('change',function(e){if(e.target.id==='e_close_remaining_confirm'){var submit=document.getElementById('e_close_submit');if(submit)submit.disabled=!e.target.checked||!!(modalDraft&&modalDraft.moving);}if(e.target.id==='e_folder_status'){homeStatus=e.target.value;var grid=document.getElementById('e_folder_grid');if(grid)grid.innerHTML=folderGrid(state());}});
  document.addEventListener('click',function(e){
    var target=e.target.closest('[data-e-action]');if(!target||working||target.disabled)return;
    var action=target.dataset.eAction;
    if(action==='open')open(target.dataset.id);
    else if(action==='list'){close();location.hash=USER.role+'-pedidos';}
    else if(action==='create-folder')app().createFolder();
    else if(action==='add-items'){close();app().editItems(target.dataset.mode,activeId);}
    else if(action==='refresh')refresh();
    else if(action==='transfer')openTransfer();
    else if(action==='save-transfer')saveTransfer();
    else if(action==='receive')receive(target.dataset.id);
    else if(action==='request')openRequest(target.dataset.id);
    else if(action==='requests-page'){close();location.hash='sede-aprovacoes';}
    else if(action==='dispatch-request')openRequestDispatch(target.dataset.id);
    else if(action==='save-request-dispatch')saveRequestDispatch();
    else if(action==='reconcile')openFinalize();
    else if(action==='finalize')openFinalize();
    else if(action==='confirm-finalize')finalize();
    else if(action==='report')openReport();
    else if(action==='print-report')printReport();
    else if(action==='print-pending')printPending();
    else if(action==='reopen')openReopen();
    else if(action==='save-reopen')reopen();
    else if(action==='cancel')close();
  });
  window.EstoqueUI={home:home,detail:detail,render:render,open:open,close:close,openTransfer:openTransfer,openReconcile:openFinalize,openFinalize:openFinalize,openRequest:openRequest,requestsPage:requestsPage,openReport:openReport};
})();
