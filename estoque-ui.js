(function(){
  'use strict';
  var activeId=null,modalDraft=null,working=false,homeSearch='',homeStatus='abertas';
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
    if(!loc.conhecido)return '<span class="estoque-tag estoque-tag-warning">Conferir estoque inicial</span>';
    if(loc.pasta&&loc.pasta.conferencia_fechamento)return '<span class="estoque-tag estoque-tag-warning">Em fechamento</span>';
    return '<span class="estoque-tag">'+(loc.tipo==='estoque'?'Estoque disponível':'Obra em andamento')+'</span>';
  }
  function stockCard(s,loc){
    var rows=Estoque.balances(s,loc.id),pending=transfers(s,loc.id),received=pending.filter(function(m){return m.destino_id===loc.id;}).length;
    return '<article class="estoque-location-card estoque-warehouse"><div class="estoque-location-heading"><span class="estoque-location-icon" aria-hidden="true">▤</span><div><span class="estoque-eyebrow">Estoque da '+(loc.id==='estoque-go'?'sede':'filial')+'</span><h2>'+h(loc.nome)+'</h2></div></div><div class="estoque-card-stats"><div><strong>'+sumTypes(rows,'disponivel')+'</strong><span>tipos de peça em estoque</span></div><div><strong>'+pending.length+'</strong><span>remanejos em trânsito</span></div></div>'+(received?'<p class="estoque-attention">'+received+' recebimento(s) para conferir</p>':'<p class="estoque-help">'+(loc.id==='estoque-go'?'Peças prontas para abastecer as obras.':'Peças disponíveis para os condomínios da filial.')+'</p>')+button('open','Abrir estoque →',true,'data-id="'+h(loc.id)+'"')+'</article>';
  }
  function folderCard(s,loc){
    var p=loc.pasta||pasta(s,loc.id)||{},rows=Estoque.balances(s,loc.id),pending=transfers(s,loc.id),unapproved=rows.filter(function(b){return b.solicitado>b.aprovado;}).length;
    return '<article class="estoque-location-card" data-e-folder="'+h(loc.id)+'"><div class="estoque-location-heading"><span class="estoque-location-icon estoque-folder-icon" aria-hidden="true">▱</span><div><h3>'+h(loc.nome)+'</h3><p>'+h(p.filial_nome||'Condomínio')+'</p></div></div><div>'+statusTag(loc)+'</div><dl class="estoque-folder-info"><div><dt>Estrutura</dt><dd>'+h(p.cor_estrutura||'—')+'</dd></div><div><dt>Tela</dt><dd>'+h(p.cor_tela||'—')+'</dd></div><div><dt>Vagas</dt><dd>'+num(p.vagas)+'</dd></div></dl><div class="estoque-folder-summary"><span>'+(!loc.conhecido?'Saldo físico a conferir':sumTypes(rows,'disponivel')+' tipos em estoque')+'</span><span>'+pending.length+' em trânsito</span></div>'+(unapproved&&!loc.finalizada?'<p class="estoque-attention">'+unapproved+' tipo(s) aguardando aceite da sede</p>':'')+button('open','Abrir pasta →',false,'data-id="'+h(loc.id)+'"')+'</article>';
  }
  function folderGrid(s){
    var query=homeSearch.trim().toLocaleLowerCase('pt-BR'),list=Estoque.locations(s).filter(function(l){return l.tipo==='condominio'&&visible(l);}).map(function(l){return locationData(s,l.id);});
    list=list.filter(function(l){return (homeStatus==='todas'||(homeStatus==='finalizadas'?l.finalizada:!l.finalizada))&&(!query||[l.nome,l.pasta&&l.pasta.filial_nome].join(' ').toLocaleLowerCase('pt-BR').indexOf(query)>=0);});
    return list.length?list.map(function(l){return folderCard(s,l);}).join(''):'<div class="estoque-empty"><strong>'+((homeSearch||homeStatus==='finalizadas')?'Nenhuma pasta encontrada.':'Comece pela pasta do condomínio.')+'</strong><p>'+((homeSearch||homeStatus==='finalizadas')?'Ajuste a busca ou o filtro para ver outras pastas.':'Cadastre os dados gerais. Depois, lance as peças pelo catálogo.')+'</p>'+(!isSede()&&!homeSearch&&homeStatus==='abertas'?button('create-folder','+ Criar pasta do condomínio',true):'')+'</div>';
  }
  function home(){
    activeId=null;var s=state(),el=document.getElementById('view-'+USER.role+'-pedidos');if(!el)return;
    var stocks=Estoque.locations(s).filter(function(l){return l.tipo==='estoque'&&visible(l);});
    el.innerHTML='<section class="estoque-view"><div class="page-hdr"><div><h1>Pastas e estoques</h1><p>Peças solicitadas, remanejamentos e saldo de cada obra em um só lugar.</p></div><div class="estoque-actions">'+button('refresh','↻ Atualizar')+(!isSede()?button('create-folder','+ Criar pasta do condomínio',true):'')+'</div></div><div class="estoque-stock-grid">'+stocks.map(function(l){return stockCard(s,l);}).join('')+'</div><div class="estoque-section-header"><div><h2>Pastas dos condomínios</h2><p>Abra uma pasta para lançar peças e acompanhar a obra.</p></div><div class="estoque-filters"><input type="search" id="e_folder_search" aria-label="Buscar condomínio" placeholder="Buscar condomínio..." value="'+h(homeSearch)+'"><select id="e_folder_status" aria-label="Filtrar situação da obra"><option value="abertas" '+(homeStatus==='abertas'?'selected':'')+'>Obras em andamento</option><option value="finalizadas" '+(homeStatus==='finalizadas'?'selected':'')+'>Obras finalizadas</option><option value="todas" '+(homeStatus==='todas'?'selected':'')+'>Todas as pastas</option></select></div></div><div class="estoque-folder-grid" id="e_folder_grid">'+folderGrid(s)+'</div></section>';
  }
  function summaryCell(label,value){return '<div><small>'+h(label)+'</small><strong>'+h(value)+'</strong></div>';}
  function balanceTable(loc,rows){
    var folder=loc.tipo==='condominio',body=rows.map(function(b){
      return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td>'+(folder?'<td class="estoque-num">'+num(b.solicitado)+(b.solicitado>b.aprovado?'<small>'+num(b.solicitado-b.aprovado)+' aguardando aceite</small>':'')+'</td>':'')+'<td class="estoque-num estoque-available">'+(loc.conhecido?num(b.disponivel):'A conferir')+'</td><td class="estoque-num">'+num(b.em_transito_entrada)+(b.em_transito_saida?'<small>'+num(b.em_transito_saida)+' saindo</small>':'')+'</td>'+(folder?'<td class="estoque-num">'+(loc.conhecido?num(b.instalado):'A conferir')+'</td>':'')+'</tr>';
    }).join('');
    return '<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th>'+(folder?'<th class="estoque-num">Solicitado</th>':'')+'<th class="estoque-num">Em estoque</th><th class="estoque-num">A receber</th>'+(folder?'<th class="estoque-num">Instalado</th>':'')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
  }
  function canReceive(s,m){var dest=locationData(s,m.destino_id);return dest&&dest.conhecido&&writable(dest)&&owned(dest);}
  function transitSection(s,loc){
    var pending=transfers(s,loc.id);if(!pending.length)return '';
    var cards=pending.map(function(m){
      var incoming=m.destino_id===loc.id;
      return '<article class="estoque-transfer"><header><div><span class="estoque-tag estoque-tag-warning">'+(incoming?'A receber':'Enviado · aguardando recebimento')+'</span><h3>'+h(name(s,m.origem_id))+' → '+h(name(s,m.destino_id))+'</h3><p>'+h(dateTime(m.criado_em||m.data))+' · '+h(m.usuario_nome||'')+'</p></div>'+(incoming&&canReceive(s,m)?button('receive','Conferir recebimento',true,'data-id="'+h(m.id)+'"'):'')+'</header><ul>'+movementItems(m)+'</ul>'+(m.obs?'<p class="estoque-help">'+h(m.obs)+'</p>':'')+'</article>';
    }).join('');
    return '<div class="card estoque-transit"><div class="card-hdr"><h2>Remanejamentos em trânsito</h2><span class="estoque-tag estoque-tag-warning">'+pending.length+'</span></div><div class="card-body"><p class="estoque-help">O saldo do destino aumenta quando quem recebe confirma a chegada das peças.</p>'+cards+'</div></div>';
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
    return '<details class="estoque-legacy-history"><summary>Registros anteriores desta pasta</summary><p class="estoque-help">Histórico preservado do controle anterior. Esses envios não substituem a contagem física inicial.</p>'+(p.remessas||[]).slice().reverse().map(function(r){return '<article><strong>Remessa · '+h(dateTime(r.data))+'</strong><p>'+h(r.user||'')+(r.recebido_em?' · Recebida em '+h(dateTime(r.recebido_em)):' · Sem confirmação no registro anterior')+'</p><ul>'+movementItems(r)+'</ul>'+(r.obs?'<p>'+h(r.obs)+'</p>':'')+'</article>';}).join('')+'<ul>'+(p.log||[]).slice().reverse().map(function(l){return '<li>'+h(dateTime(l.data))+' · '+h(l.user||'')+' · '+h(l.obs||l.status||'Registro')+'</li>';}).join('')+'</ul></details>';
  }
  function closureStatus(s,loc,rows){
    var p=loc.pasta||pasta(s,loc.id),left=sumTypes(rows,'disponivel'),moving=transfers(s,loc.id).length;
    return {left:left,moving:moving,conferred:!!(p&&p.conferencia_fechamento),ready:loc.conhecido&&left===0&&moving===0&&!!(p&&p.conferencia_fechamento)};
  }
  function closureNotice(s,loc,rows){
    if(loc.tipo!=='condominio')return '';
    if(loc.finalizada)return '<div class="estoque-notice estoque-notice-success"><strong>Obra finalizada em '+h(dateTime(loc.pasta.finalizado_em))+'.</strong><p>O relatório final preserva a conferência e todas as movimentações deste fechamento.</p>'+button('report','Ver relatório final',true)+'</div>';
    if(!loc.pasta.conferencia_fechamento)return '';
    var check=closureStatus(s,loc,rows);
    return '<div class="estoque-notice '+(check.ready?'estoque-notice-success':'')+'"><strong>'+(check.ready?'Conferência salva. A obra está pronta para finalizar.':'Conferência salva. Ainda há pendências para finalizar.')+'</strong><p>'+(check.left?check.left+' tipo(s) de peça ainda em estoque. Remaneje as sobras. ':'')+(check.moving?check.moving+' remanejamento(s) aguardando recebimento. ':check.ready?'O estoque está zerado e não há remanejamentos em trânsito.':'')+'</p><div class="estoque-actions">'+(owned(loc)&&check.left?button('transfer','Remanejar sobras',true):'')+(canClose(loc)?button(check.ready?'finalize':'reconcile',check.ready?'Finalizar e gerar relatório':'Revisar conferência',check.ready):'')+'</div></div>';
  }
  function detail(id){
    activeId=id;window._pedidoId=id;var s=state(),loc=locationData(s,id),el=document.getElementById('view-'+USER.role+'-pedido');if(!el)return;
    if(!visible(loc)){el.innerHTML='<div class="estoque-empty">Pasta ou estoque não encontrado.</div>';return;}
    var folder=loc.tipo==='condominio',p=loc.pasta||{},rows=Estoque.balances(s,id),active=writable(loc),unapproved=rows.some(function(b){return b.solicitado>b.aprovado;}),canMove=active&&owned(loc)&&loc.conhecido&&sumTypes(rows,'disponivel')>0;
    var actions=button('refresh','↻ Atualizar');
    if(active&&((folder&&!isSede())||(!folder&&owned(loc))))actions+=button('add-items','+ Adicionar peças',true,'data-mode="'+(folder?'demanda':'estoque')+'"');
    if(canMove)actions+=button('transfer','Remanejar peças');
    if(folder&&active&&isSede()&&unapproved)actions+=button('approve','Aceitar peças pendentes',true);
    if(folder&&canClose(loc)&&loc.conhecido)actions+=button('reconcile','Finalizar obra');
    if(folder)actions+=button('report',loc.finalizada?'Relatório final':'Conferência / PDF');
    if(folder&&loc.finalizada&&isSede())actions+=button('reopen','Reabrir obra');
    var summary=folder?summaryCell('Cor da estrutura',p.cor_estrutura||'—')+summaryCell('Cor da tela',p.cor_tela||'—')+summaryCell('Número de vagas',num(p.vagas))+summaryCell('Tipos de peça em estoque',loc.conhecido?sumTypes(rows,'disponivel'):'A conferir'):summaryCell('Tipos de peça em estoque',sumTypes(rows,'disponivel'))+summaryCell('Remanejamentos em trânsito',transfers(s,id).length);
    var initial=!loc.conhecido?'<div class="estoque-notice"><strong>Confira o estoque físico inicial desta obra.</strong><p>Esta pasta pode receber envios, que ficam em trânsito. Antes de confirmar o recebimento ou remanejar peças desta obra, informe o saldo anterior e as peças já instaladas. Não inclua nessa contagem as remessas que ainda aguardam confirmação.</p>'+(active?button('baseline','Conferir estoque inicial',true):'')+'</div>':'';
    var noRows='<div class="estoque-empty"><strong>'+(folder?'Nenhuma peça lançada nesta pasta.':'O estoque ainda está vazio.')+'</strong><p>'+(folder?'A filial pode adicionar as peças do condomínio usando o catálogo.':'Registre as peças prontas para disponibilizá-las aos condomínios.')+'</p>'+((active&&((folder&&!isSede())||(!folder&&owned(loc))))?button('add-items','+ Adicionar peças',true,'data-mode="'+(folder?'demanda':'estoque')+'"'):'')+'</div>';
    var details=folder?'<details class="card estoque-general"><summary class="card-hdr">Informações do condomínio</summary><div class="card-body"><div class="form-grid">'+['endereco','cnpj','sindico','contato','email','tipo','chumbacao','pilares'].map(function(k,i){return '<div><small>'+['Endereço','CNPJ','Responsável','Telefone','E-mail','Cobertura','Chumbação','Pilares'][i]+'</small><p>'+h(p[k]||'—')+'</p></div>';}).join('')+'</div></div></details>':'';
    el.innerHTML='<section class="estoque-view"><div class="page-hdr"><div><button type="button" class="btn btn-ghost btn-sm" data-e-action="list">← Pastas e estoques</button><h1>'+h(loc.nome)+'</h1><p>'+h(folder?(p.filial_nome||'Condomínio'):(loc.id==='estoque-go'?'Sede · peças prontas':'Filial · peças disponíveis'))+'</p></div>'+statusTag(loc)+'</div><div class="estoque-actions estoque-main-actions">'+actions+'</div><div class="estoque-summary '+(!folder?'estoque-summary-compact':'')+'">'+summary+'</div>'+initial+closureNotice(s,loc,rows)+'<div class="card"><div class="card-hdr"><div><h2>'+ (folder?'Peças do condomínio':'Peças em estoque')+'</h2><p class="estoque-help">'+(folder?'Solicitado é a necessidade da obra. Em estoque é o saldo físico disponível. Instalado é informado no fechamento.':'Somente as peças recebidas e disponíveis podem ser remanejadas.')+'</p></div></div><div class="estoque-table-body">'+(rows.length?balanceTable(loc,rows):noRows)+'</div></div>'+transitSection(s,loc)+'<div class="card"><div class="card-hdr"><h2>Histórico de movimentações</h2></div><div class="card-body">'+historyHtml(s,Estoque.history(s,id))+legacyHistory(p)+'</div></div>'+details+'</section>';
  }
  function render(){if(location.hash.slice(1)===USER.role+'-pedido')detail(window._pedidoId);else home();}
  function openTransfer(){
    var s=state(),loc=current(s);if(!loc||!writable(loc)||!owned(loc)||!loc.conhecido)return;
    var rows=Estoque.balances(s,loc.id).filter(function(b){return b.disponivel>0;}),targets=Estoque.locations(s).filter(function(l){return l.id!==loc.id&&l.id!=='estoque-go'&&writable(locationData(s,l.id))&&(isSede()||l.filial_id===USER.filial_id);});
    if(!rows.length){error('Não há peças disponíveis para remanejar.');return;}
    if(!targets.length){error('Não há destino disponível. Crie uma pasta ativa na filial para remanejar as peças.');return;}
    modalDraft={type:'transfer',locationId:loc.id,rows:rows,id:crypto.randomUUID()};
    modal('Remanejar peças — '+loc.nome,'<p class="estoque-help">Escolha o destino e informe o que está saindo. As peças ficam em trânsito até a confirmação de quem recebe.</p><div class="form-grid"><div class="fg"><label for="e_transfer_destino">Destino *</label><select id="e_transfer_destino"><option value="">Selecione o estoque ou condomínio</option>'+targets.map(function(l){return '<option value="'+h(l.id)+'">'+h(l.nome)+(l.conhecido?'':' — estoque inicial a conferir')+'</option>';}).join('')+'</select></div>'+field('Observações / transporte','e_transfer_obs','','placeholder="Ex.: motorista, veículo ou motivo do remanejamento"')+'</div><div id="e_transfer_notice" class="estoque-notice" role="status" hidden></div><div class="tbl-wrap"><table class="estoque-table estoque-input-table"><thead><tr><th>Peça</th><th>Unid.</th><th class="estoque-num">Disponível</th><th>Enviar agora</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td class="estoque-num">'+num(b.disponivel)+'</td><td><input type="number" min="0" max="'+b.disponivel+'" step="any" value="0" aria-label="Enviar '+h(b.peca.desc)+'" data-e-transfer-key="'+h(b.key)+'"></td></tr>';}).join('')+'</tbody></table></div>'+inlineError(),button('cancel','Cancelar')+button('save-transfer','Registrar remanejamento',true));
  }
  function updateTransferNotice(){
    var select=document.getElementById('e_transfer_destino'),notice=document.getElementById('e_transfer_notice');
    if(!select||!notice)return;
    var destination=Estoque.getLocation(state(),select.value),pending=destination&&!destination.conhecido;
    notice.hidden=!pending;
    notice.textContent=pending?'Você pode enviar para este condomínio agora. As peças ficarão em trânsito; a filial deverá conferir o estoque inicial antes de confirmar o recebimento.':'';
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
  function openReceive(id){
    var s=state(),m=transfers(s,activeId).find(function(t){return t.id===id;});if(!m||!canReceive(s,m))return;
    modalDraft={type:'receive',movement:m,id:crypto.randomUUID()};
    modal('Conferir recebimento','<p class="estoque-help">Confirme após conferir a chegada de todas as peças abaixo. O recebimento será registrado no histórico e acrescentado ao estoque de destino.</p><div class="estoque-notice"><strong>'+h(name(s,m.origem_id))+' → '+h(name(s,m.destino_id))+'</strong><ul>'+movementItems(m)+'</ul></div><p class="estoque-help">Se houver divergência na entrega, confira com a origem antes de confirmar o recebimento completo.</p>'+field('Observações do recebimento','e_receive_obs','','placeholder="Conferência, comprovante ou observações"')+inlineError(),button('cancel','Voltar')+button('confirm-receive','Confirmar recebimento completo',true));
  }
  async function receive(){
    var d=modalDraft;if(!d||d.type!=='receive')return;var ctx=context(),meta={id:d.id,obs:document.getElementById('e_receive_obs').value};
    await commit(function(s){return Estoque.receive(s,d.movement.id,ctx,meta);},function(){close();detail(activeId);showToast('Recebimento confirmado. Peças disponíveis no destino.','success');});
  }
  function openBaseline(){
    var s=state(),loc=current(s);if(!loc||loc.conhecido||!writable(loc))return;
    var rows=Estoque.balances(s,loc.id);modalDraft={type:'baseline',locationId:loc.id,rows:rows,id:crypto.randomUUID()};
    modal('Conferir estoque inicial — '+loc.nome,'<p class="estoque-help">Faça uma contagem física. Informe o que está disponível na obra e o que já foi instalado antes deste controle. Preencha 0 quando não houver peças; os envios antigos ficam preservados no histórico. Não inclua as peças dos remanejamentos que ainda aguardam confirmação de recebimento, mesmo que já tenham chegado fisicamente. Elas entrarão no estoque ao confirmar o recebimento.</p><div class="tbl-wrap"><table class="estoque-table estoque-input-table"><thead><tr><th>Peça</th><th>Unid.</th><th>Disponível na obra *</th><th>Já instalado *</th></tr></thead><tbody>'+rows.map(function(b){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td>'+['disponivel','instalado'].map(function(k){return '<td><input type="number" min="0" step="any" placeholder="Informe" aria-label="'+(k==='disponivel'?'Disponível de ':'Já instalado de ')+h(b.peca.desc)+'" data-e-baseline-key="'+h(b.key)+'" data-e-baseline-field="'+k+'"></td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>'+field('Observações da contagem','e_baseline_obs','','placeholder="Referência da contagem física"')+'<label class="estoque-check"><input type="checkbox" id="e_baseline_confirm"> Conferi as quantidades físicas e instaladas desta obra.</label>'+inlineError(),button('cancel','Cancelar')+button('save-baseline','Confirmar estoque inicial',true));
  }
  async function saveBaseline(){
    var d=modalDraft;if(!d||d.type!=='baseline')return;
    if(!document.getElementById('e_baseline_confirm').checked){error('Confirme que as quantidades foram conferidas fisicamente.');return;}
    var entries=d.rows.map(function(b){return {key:b.key};});
    try{document.querySelectorAll('[data-e-baseline-key]').forEach(function(input){var key=input.dataset.eBaselineKey,b=d.rows.find(function(r){return r.key===key;});if(input.value==='')throw new Error('Informe as duas quantidades de cada peça. Use 0 quando não houver saldo.');entries.find(function(e){return e.key===key;})[input.dataset.eBaselineField]=numeric(input.value,b.peca.un);});}catch(e){error(e.message);return;}
    var ctx=context(),meta={id:d.id,obs:document.getElementById('e_baseline_obs').value};
    await commit(function(s){return Estoque.legacyInitial(s,d.locationId,entries,ctx,meta);},function(){close();detail(d.locationId);showToast('Estoque inicial conferido e registrado no histórico.','success');});
  }
  function openReconcile(){
    var s=state(),loc=locationData(s,activeId);if(!loc||loc.tipo!=='condominio'||!canClose(loc)||!loc.conhecido)return;
    var rows=Estoque.balances(s,loc.id),check=closureStatus(s,loc,rows);modalDraft={type:'reconcile',locationId:loc.id,rows:rows,id:crypto.randomUUID(),dirty:false};
    modal('Fechamento da obra — '+loc.nome,'<p class="estoque-help">Informe o total realmente instalado de cada peça. Salvar a conferência desconta essas peças do estoque. Antes de finalizar, remaneje todas as sobras e aguarde a confirmação dos remanejamentos.</p>'+(check.moving?'<div class="estoque-notice"><strong>'+check.moving+' remanejamento(s) em trânsito.</strong><p>É possível salvar a conferência agora. A obra só poderá ser finalizada depois dos recebimentos.</p></div>':'')+'<div class="tbl-wrap"><table class="estoque-table estoque-input-table"><thead><tr><th>Peça</th><th>Unid.</th><th class="estoque-num">Em estoque</th><th>Total instalado *</th><th class="estoque-num">Sobra após conferir</th></tr></thead><tbody>'+rows.map(function(b,i){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td class="estoque-num">'+num(b.disponivel)+'</td><td><input type="number" min="0" max="'+(b.disponivel+b.instalado)+'" step="any" value="'+b.instalado+'" data-e-installed-key="'+h(b.key)+'" aria-label="Total instalado de '+h(b.peca.desc)+'"></td><td class="estoque-num" id="e_leftover_'+i+'">'+num(b.disponivel)+'</td></tr>';}).join('')+'</tbody></table></div><div id="e_closure_preview" class="estoque-closure-preview"></div>'+field('Observações da conferência','e_reconcile_obs','','placeholder="Observações sobre a instalação final"')+inlineError(),button('cancel','Voltar')+(check.left&&owned(loc)?button('transfer','Remanejar sobras'):'')+button('save-reconcile','Salvar conferência',true)+(check.ready?button('finalize','Finalizar e gerar relatório',true,'id="e_finalize_ready"'):''));
    updateClosurePreview(false);
  }
  function updateClosurePreview(dirty){
    var d=modalDraft;if(!d||d.type!=='reconcile')return;
    if(dirty)d.dirty=true;var left=0,invalid=false;
    document.querySelectorAll('[data-e-installed-key]').forEach(function(input,i){var b=d.rows.find(function(r){return r.key===input.dataset.eInstalledKey;}),value=Number(input.value),remaining=Math.round((b.disponivel+b.instalado-value)*1000)/1000,bad=input.value===''||!Number.isFinite(value)||value<0||remaining<0;
      invalid=invalid||bad;if(remaining>0)left++;var out=document.getElementById('e_leftover_'+i);if(out){out.textContent=bad?'Revise a quantidade':num(remaining);out.classList.toggle('estoque-error-text',bad);}});
    var message=invalid?'Revise as quantidades instaladas. Elas não podem ultrapassar o estoque recebido.':left?left+' tipo(s) de peça permanecerão em estoque e precisarão ser remanejados.':'Após salvar esta conferência, não haverá sobras de peças no estoque.';
    var el=document.getElementById('e_closure_preview');if(el)el.textContent=message;
    var finish=document.getElementById('e_finalize_ready');if(finish)finish.disabled=d.dirty;
  }
  async function saveReconcile(){
    var d=modalDraft;if(!d||d.type!=='reconcile')return;var totals=[];
    try{document.querySelectorAll('[data-e-installed-key]').forEach(function(input){var b=d.rows.find(function(r){return r.key===input.dataset.eInstalledKey;});if(input.value==='')throw new Error('Informe o total instalado de todas as peças, inclusive 0 quando não houve instalação.');var qtd=numeric(input.value,b.peca.un);if(qtd>b.instalado+b.disponivel)throw new Error('O instalado de '+b.peca.desc+' supera o material disponível.');totals.push({key:b.key,qtd:qtd});});}catch(e){error(e.message);return;}
    var ctx=context(),meta={id:d.id,obs:document.getElementById('e_reconcile_obs').value};
    await commit(function(s){return Estoque.reconcile(s,d.locationId,totals,ctx,meta);},function(){close();detail(d.locationId);openReconcile();showToast('Conferência salva. Confira as sobras antes de finalizar.','success');});
  }
  function openFinalize(){
    var s=state(),loc=locationData(s,activeId);if(!loc||!canClose(loc))return;var check=closureStatus(s,loc,Estoque.balances(s,loc.id));
    if(!check.ready){openReconcile();return;}
    if(modalDraft&&modalDraft.type==='reconcile'&&modalDraft.dirty){error('Salve a conferência atualizada antes de finalizar.');return;}
    modalDraft={type:'finalize',locationId:loc.id,id:crypto.randomUUID()};
    modal('Finalizar obra','<div class="estoque-notice estoque-notice-success"><strong>'+h(loc.nome)+'</strong><p>A conferência está salva, o estoque está zerado e não há remanejamentos em trânsito.</p></div><p class="estoque-help">Ao finalizar, a pasta fica disponível para consulta e o sistema registra o relatório final com o total instalado e o histórico completo. Uma eventual reabertura exige justificativa da sede.</p>'+inlineError(),button('cancel','Voltar')+button('confirm-finalize','Finalizar e gerar relatório',true));
  }
  async function finalize(){
    var d=modalDraft;if(!d||d.type!=='finalize')return;var ctx=context();
    await commit(function(s){return Estoque.finalize(s,d.locationId,ctx,{id:d.id});},function(){close();detail(d.locationId);openReport();showToast('Obra finalizada. Relatório final gerado.','success');});
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
    return '<h3>'+h(r.condominio)+'</h3><p>'+h(r.filial_nome||'')+' · Estrutura: '+h(r.cor_estrutura||'—')+' · Tela: '+h(r.cor_tela||'—')+' · Vagas: '+num(r.vagas)+'</p><p>'+ (finalReport?'Finalizada em '+h(dateTime(r.finalizado_em))+' · '+h(typeof r.finalizado_por==='object'?(r.finalizado_por.nome||r.finalizado_por.usuario_nome||''):r.finalizado_por||''):'Conferência emitida em '+h(dateTime(r.gerado_em)))+'</p>'+(!r.conhecido?'<p>Estoque inicial ainda não conferido. Saldos físicos pendentes de contagem.</p>':'')+'<div class="tbl-wrap"><table class="estoque-table"><thead><tr><th>Peça / medidas / cores</th><th>Unid.</th><th>Solicitado</th><th>Recebido</th><th>Remanejado</th><th>Instalado</th><th>Saldo</th><th>Diferença *</th></tr></thead><tbody>'+(r.itens||[]).map(function(b){return '<tr><td class="estoque-piece">'+piece(b.peca)+'</td><td>'+h(b.peca.un)+'</td><td>'+num(b.solicitado)+'</td><td>'+num(b.recebido)+'</td><td>'+num(b.enviado)+'</td><td>'+(r.conhecido?num(b.instalado):'A conferir')+'</td><td>'+(r.conhecido?num(b.disponivel):'A conferir')+'</td><td>'+(r.conhecido?num(b.diferenca):'—')+'</td></tr>';}).join('')+'</tbody></table></div><p class="estoque-help">* Diferença entre o solicitado e o instalado. Quantidade positiva indica peças solicitadas que não foram instaladas.</p>'+(finalReport?'<p class="estoque-help">Este relatório corresponde ao fechamento registrado. Estoque físico zerado e nenhuma peça em trânsito.</p>':'');
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
  async function approve(){var id=activeId,ctx=context();await commit(function(s){return Estoque.approveDemand(s,id,ctx);},function(){detail(id);showToast('Peças aceitas pela sede.','success');});}
  async function refresh(){
    if(working)return;try{await app().refresh(location.hash.slice(1),true);}catch(e){error(e.message||'Não foi possível atualizar.');}
  }
  document.addEventListener('input',function(e){
    if(e.target.id==='e_folder_search'){homeSearch=e.target.value;var grid=document.getElementById('e_folder_grid');if(grid)grid.innerHTML=folderGrid(state());}
    if(e.target.hasAttribute('data-e-installed-key'))updateClosurePreview(true);
  });
  document.addEventListener('change',function(e){if(e.target.id==='e_transfer_destino')updateTransferNotice();if(e.target.id==='e_folder_status'){homeStatus=e.target.value;var grid=document.getElementById('e_folder_grid');if(grid)grid.innerHTML=folderGrid(state());}});
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
    else if(action==='receive')openReceive(target.dataset.id);
    else if(action==='confirm-receive')receive();
    else if(action==='baseline')openBaseline();
    else if(action==='save-baseline')saveBaseline();
    else if(action==='reconcile')openReconcile();
    else if(action==='save-reconcile')saveReconcile();
    else if(action==='finalize')openFinalize();
    else if(action==='confirm-finalize')finalize();
    else if(action==='approve')approve();
    else if(action==='report')openReport();
    else if(action==='print-report')printReport();
    else if(action==='reopen')openReopen();
    else if(action==='save-reopen')reopen();
    else if(action==='cancel')close();
  });
  window.EstoqueUI={home:home,detail:detail,render:render,open:open,close:close,openTransfer:openTransfer,openReconcile:openReconcile,openReport:openReport};
})();
