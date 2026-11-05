(function(){
  'use strict';
  var draft=null;
  var folderFields=['cliente','vagas','cor_estrutura','cor_tela','tipo','obs','endereco','cnpj','sindico','contato','email','chumbacao','pilares'];
  var h=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var num=function(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});};
  var date=function(){return new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});};
  function ctx(){return EstoqueApp.context();}
  function current(){return DB.getPedido(window._pedidoId);}
  function allowed(p){return p&&(USER.role==='sede'||p.filial_id===USER.filial_id);}
  function price(it){return typeof it.preco_unit==='number'?it.preco_unit:lookupPreco(it.desc);}
  function total(p){return (p.itens||[]).reduce(function(sum,it){return sum+price(it)*(Number(it.qtd)||0);},0);}
  function blank(){return {desc:'',ma:'0,00',mb:'0,00',mc:'0,00',un:'PÇ',qtd:1,prioridade:''};}
  function priorityOptions(value){return ['','P1','P2','P3'].map(function(p,index){return '<option value="'+p+'" '+((value||'')===p?'selected':'')+'>'+(p?p+' · Prioridade 0'+index:'Sem prioridade')+'</option>';}).join('');}
  function folderData(p){var data={};folderFields.forEach(function(key){data[key]=p[key]==null?'':p[key];});return data;}
  function requestSnapshot(state,request){
    if(!request)return null;
    var edits=state.movimentos.filter(function(m){return (m.tipo==='demanda_editada'||m.tipo==='prioridades_alteradas')&&m.referencia_id===request.id;});
    return JSON.stringify({id:request.id,pasta_id:request.pasta_id,obs:request.obs||'',revision:edits.length?edits[edits.length-1].id:request.id,itens:request.itens.map(function(it){return {key:it.key,peca:it.peca,solicitado:it.solicitado,prioridade:it.prioridade||''};})});
  }
  function button(action,label,primary,extra){return '<button type="button" class="btn '+(primary?'btn-primary':'btn-outline')+'" data-p-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function field(label,key,value,type,extra){return '<div class="fg"><label for="p_'+key+'">'+label+'</label><input id="p_'+key+'" data-field="'+key+'" type="'+(type||'text')+'" value="'+h(value)+'" '+(extra||'')+'></div>';}
  function modal(title,body,footer){var creation=document.getElementById('view-filial-novo-pedido');if(creation&&!creation.classList.contains('active'))creation.replaceChildren();openModal(title,body,footer);document.getElementById('modalBox').classList.add('pedido-modal');}
  function close(){closeModal();document.getElementById('modalBody').replaceChildren();document.getElementById('modalBox').classList.remove('pedido-modal');}
  function error(message){
    var el=document.getElementById('pedidoError');
    if(el){el.textContent=message;el.scrollIntoView({block:'nearest'});}
    showToast(message,'error');
  }
  function itemEditor(){
    var rows=draft.items.map(function(it,i){
      var custom=it.custom||(!WZ_CATALOGO.some(function(c){return c.desc===it.desc;})&&!!it.desc);
      var options='<option value="">Selecione a peça</option>'+WZ_CATALOGO.filter(function(c){return c.desc!=='DEIXAR EM BRANCO (EDITÁVEL)';}).map(function(c){return '<option value="'+h(c.desc)+'" '+(c.desc===it.desc?'selected':'')+'>'+h(c.desc)+'</option>';}).join('')+'<option value="__custom__" '+(custom?'selected':'')+'>Outra peça (descrever)</option>';
      var input=function(key){return '<input aria-label="'+h(key==='qtd'?'Quantidade de '+(it.desc||'peças'):'Medida '+key.slice(1).toUpperCase())+'" data-line="'+i+'" data-line-field="'+key+'" value="'+h(it[key])+'" '+(key==='qtd'?'type="number" min="0.001" step="any"':'type="text"')+'>';};
      return '<tr><td><select aria-label="Peça '+(i+1)+'" data-line="'+i+'" data-line-field="desc">'+options+'</select>'+(custom?'<input class="pedido-custom" placeholder="Descrição da peça" aria-label="Descrição da peça" data-line="'+i+'" data-line-field="customDesc" value="'+h(it.desc)+'">':'')+'</td>'+(draft.mode==='estoque'?'<td><input aria-label="Cor da peça" data-line="'+i+'" data-line-field="cor" value="'+h(it.cor||(/^TELA\b/i.test(it.desc)?'Prata':'Branca'))+'"></td>':'')+(draft.mode!=='estoque'?'<td><select aria-label="Prioridade da peça '+(i+1)+'" data-line="'+i+'" data-line-field="prioridade">'+priorityOptions(it.prioridade)+'</select></td>':'')+'<td>'+input('ma')+'</td><td>'+input('mb')+'</td><td>'+input('mc')+'</td><td>'+h(it.un)+'</td><td>'+input('qtd')+'</td><td class="num">'+fmtMoeda(price(it))+'</td><td>'+button('remove','✕',false,'aria-label="Remover peça '+(i+1)+'" data-index="'+i+'"')+'</td></tr>';
    }).join('');
    return '<div class="pedido-actions">'+(draft.mode==='edit'?'':button('add-row','+ Lançar peça',true))+'</div><p class="pedido-help">Escolha no catálogo e informe as medidas e a quantidade. Para braços de 4,60 m, por exemplo, preencha 4,60 na Medida A.</p><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th>'+(draft.mode==='estoque'?'<th>Cor / acabamento</th>':'')+(draft.mode!=='estoque'?'<th>Prioridade da peça</th>':'')+'<th>Med. A</th><th>Med. B</th><th>Med. C</th><th>Unid.</th><th>Quantidade</th><th>V. unit.</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="pedidoDraftTotal" class="pedido-total"></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>';
  }
  function draftTotal(){var el=document.getElementById('pedidoDraftTotal');if(el&&draft)el.textContent=(draft.mode==='estoque'?'Valor de referência: ':'Total solicitado: ')+fmtMoeda(draft.items.reduce(function(s,it){return s+price(it)*(Number(it.qtd)||0);},0));}
  function form(){
    var d=draft.data;
    return '<div class="pedido-form"><div class="form-grid">'+
      field('Nome do condomínio *','cliente',d.cliente,'text','placeholder="Ex.: Condomínio Riacho 33" required')+
      field('Número de vagas *','vagas',d.vagas,'number','min="1" step="1" required')+
      field('Cor da estrutura *','cor_estrutura',d.cor_estrutura,'text','list="pedidoEstruturas" required')+
      field('Tela / cobertura *','cor_tela',d.cor_tela,'text','list="pedidoTelas" required')+
      '<div class="fg"><label for="p_obs">Observações do condomínio</label><textarea id="p_obs" data-field="obs" placeholder="Informações gerais da obra">'+h(d.obs||'')+'</textarea></div>'+
      '</div><datalist id="pedidoEstruturas"><option value="Branca"><option value="Preta"><option value="Cinza"></datalist><datalist id="pedidoTelas"><option value="Prata"><option value="Verde"><option value="Azul"><option value="Vermelha"><option value="Bege"><option value="Não se aplica"></datalist>'+
      '<details class="pedido-options"><summary>Contato e informações técnicas (opcional)</summary><div class="form-grid">'+
      '<div class="fg"><label for="p_tipo">Tipo de cobertura</label><select id="p_tipo" data-field="tipo">'+['Sombrite','Telha','Carport'].map(function(t){return '<option '+(d.tipo===t?'selected':'')+'>'+t+'</option>';}).join('')+'</select></div>'+
      field('Chumbação','chumbacao',d.chumbacao)+field('Pilares','pilares',d.pilares)+field('Endereço','endereco',d.endereco)+field('CNPJ','cnpj',d.cnpj)+field('Síndico / responsável','sindico',d.sindico)+field('Telefone','contato',d.contato)+field('E-mail','email',d.email,'email')+
      '</div></details></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>';
  }
  function renderDraft(){
    if(!draft)return;
    if(draft.mode==='new'){
      document.getElementById('view-filial-novo-pedido').innerHTML='<div class="page-hdr"><div><h1>Nova pasta de condomínio</h1><p>Cadastre os dados gerais. As peças serão lançadas dentro da pasta.</p></div></div><div class="card"><div class="card-hdr"><h2>Dados do condomínio</h2></div><div class="card-body">'+form()+'</div></div><div class="pedido-footer"><span></span>'+button('submit','Criar pasta do condomínio',true)+'</div>';
    }else if(draft.mode==='folder-edit'){
      modal('Editar condomínio — '+draft.originalName,'<p class="pedido-help">As alterações ficam no histórico. Novas cores serão usadas nos próximos lançamentos; as peças já solicitadas mantêm suas cores.</p>'+form(),button('cancel','Cancelar')+button('submit','Salvar dados do condomínio',true));
    }else{
      var stock=draft.mode==='estoque',editing=draft.mode==='request-edit';
      modal((stock?'Adicionar peças ao estoque — ':editing?'Editar peças — ':'Solicitar peças para — ')+draft.data.cliente,
        '<p class="pedido-help">'+(stock?'Informe as peças disponíveis neste depósito, com as medidas e a cor corretas. Esta entrada ficará registrada no histórico.':editing?'Ajuste as peças, medidas e quantidades desta solicitação. A edição é permitida enquanto nenhum envio tiver sido registrado; o conteúdo anterior será preservado no histórico.':'Selecione as peças e quantidades para este condomínio. A solicitação ficará pendente na sede até o envio completo; cada entrega entra no estoque quando a filial clicar em Conferido.')+'</p>'+itemEditor()+
        (stock?'<div class="fg"><label for="p_entrada_obs">Origem / motivo da entrada'+(USER.role==='filial'?' *':'')+'</label><input id="p_entrada_obs" value="'+h(draft.obs||'')+'" placeholder="Ex.: peças prontas da produção ou conferência do depósito"></div>':'<div class="fg"><label for="p_demanda_obs">Etapa / observações da solicitação</label><textarea id="p_demanda_obs" placeholder="Ex.: Etapa 1 — bloco A">'+h(draft.obs||'')+'</textarea></div>'),
        button('cancel','Cancelar')+button('submit',stock?'Registrar entrada no estoque':editing?'Salvar alterações nas peças':'Enviar solicitação à sede',true));
    }
    draftTotal();
  }
  function novo(){
    if(!USER||USER.role!=='filial')return;
    close();
    draft={mode:'new',data:{id:'p'+crypto.randomUUID(),cliente:'',vagas:'',cor_estrutura:'Branca',cor_tela:'Prata',tipo:'Sombrite',chumbacao:'Chumbação Direta em Solo',pilares:'Tipo Direto',endereco:'',cnpj:'',sindico:'',contato:'',email:'',obs:'',prazos:prazoesPadrao()},items:[]};
    renderDraft();
  }
  function editFolder(locationId){
    var state=EstoqueApp.getState(),loc=Estoque.getLocation(state,locationId),p=state.pastas.find(function(item){return item.id===locationId;});
    if(!loc||loc.tipo!=='condominio'||loc.finalizada||loc.ativo===false||!allowed(p))return;
    var data=folderData(p);
    draft={mode:'folder-edit',target:locationId,entryId:'e'+crypto.randomUUID(),originalName:loc.nome,data:data,snapshot:JSON.stringify(data),items:[]};
    renderDraft();
  }
  function editDemand(requestId){
    var state=EstoqueApp.getState(),request=Estoque.requests(state).find(function(r){return r.id===requestId;});
    if(!request||!request.ativo||!(USER.role==='sede'||request.filial_id===USER.filial_id))return;
    if(!request.editavel){error('Esta solicitação já tem envio registrado ou é um registro anterior. Crie uma nova solicitação para complementar as peças.');return;}
    draft={mode:'request-edit',target:request.pasta_id,requestId:requestId,entryId:'e'+crypto.randomUUID(),data:{cliente:request.condominio},snapshot:requestSnapshot(state,request),items:request.itens.map(function(it){return Object.assign({},it.peca,{qtd:it.solicitado,prioridade:it.prioridade||''});}),obs:request.obs||''};
    renderDraft();
  }
  function editInventory(mode,locationId){
    var state=EstoqueApp.getState(),loc=Estoque.getLocation(state,locationId);
    if(!loc)return;
    if(mode==='demanda'&&(loc.tipo!=='condominio'||USER.role!=='filial'||loc.filial_id!==USER.filial_id))return;
    if(mode==='estoque'&&loc.tipo!=='estoque')return;
    draft={mode:mode,target:locationId,entryId:'e'+crypto.randomUUID(),data:{cliente:loc.nome},items:[blank()],obs:''};
    renderDraft();
  }
  async function submit(){
    if(!draft||EstoqueApp.isBusy())return;
    var d=draft,items=d.items.map(function(it){
      var catalog=it.custom?null:DB.catalogo().find(function(c){return c.desc===it.desc;});
      var color=it.cor===undefined?(/^TELA\b/i.test(it.desc)?'Prata':'Branca'):it.cor;
      var data=Object.assign({},it,{catalogo_id:it.custom?null:(catalog?catalog.id:it.catalogo_id),preco_unit:price(it)});
      if(d.mode==='estoque'){delete data.prioridade;data.cor=color;data.cor_tela=/^TELA\b/i.test(it.desc)?color:'';data.cor_estrutura=/^TELA\b/i.test(it.desc)?'':color;}
      else if(d.mode!=='request-edit'){delete data.cor;delete data.cor_tela;delete data.cor_estrutura;}
      return data;
    });
    if(d.mode==='estoque')d.obs=document.getElementById('p_entrada_obs').value;
    else if(d.mode==='demanda'||d.mode==='request-edit')d.obs=document.getElementById('p_demanda_obs').value;
    if(d.mode==='new'||d.mode==='folder-edit'){
      var container=document.getElementById(d.mode==='new'?'view-filial-novo-pedido':'modalBody');
      var invalid=Array.from(container.querySelectorAll('.pedido-form input,.pedido-form select,.pedido-form textarea')).find(function(control){return !control.reportValidity();});
      if(invalid)return;
    }
    var meta={id:d.entryId,data:ctx().data,obs:d.obs||''};
    var state=await EstoqueApp.save(function(current){
      if(d.mode==='new')return Estoque.createFolder(current,d.data,ctx());
      if(d.mode==='folder-edit'){
        var latestFolder=current.pastas.find(function(p){return p.id===d.target;});
        if(!latestFolder||JSON.stringify(folderData(latestFolder))!==d.snapshot)throw new Error('Os dados deste condomínio foram alterados por outro operador. Feche o formulário, atualize a pasta e reabra a edição para conferir os dados mais recentes.');
        return Estoque.editFolder(current,d.target,d.data,ctx(),meta);
      }
      if(d.mode==='request-edit'){
        var latestRequest=Estoque.requests(current,d.target).find(function(r){return r.id===d.requestId;});
        if(requestSnapshot(current,latestRequest)!==d.snapshot)throw new Error('Esta solicitação foi alterada por outro operador. Feche o formulário, atualize a pasta e reabra a edição para conferir as peças mais recentes.');
        return Estoque.editDemand(current,d.requestId,items,ctx(),meta);
      }
      if(d.mode==='estoque')return Estoque.addStock(current,d.target,items,ctx(),meta);
      return Estoque.addDemand(current,d.target,items,ctx(),meta);
    });
    if(!state)return;
    var target=d.mode==='new'?d.data.id:d.target;
    draft=null;close();EstoqueApp.open(target);
    if(location.hash==='#'+USER.role+'-pedido')EstoqueUI.detail(target);
    showToast(d.mode==='new'?'Pasta criada. Agora você pode lançar as peças.':d.mode==='estoque'?'Entrada de estoque registrada.':d.mode==='folder-edit'?'Dados do condomínio atualizados.':d.mode==='request-edit'?'Solicitação atualizada. A versão anterior ficou no histórico.':'Solicitação enviada à sede. Acompanhe os envios nesta pasta.','success');
  }
  async function approve(orderId){
    var state=await EstoqueApp.save(function(s){return Estoque.approveDemand(s,orderId,ctx());});
    if(state){showToast('Peças aceitas pela sede.','success');renderView(location.hash.slice(1));}
  }
  document.addEventListener('input',function(e){
    var t=e.target;
    if(draft&&(t.id==='p_entrada_obs'||t.id==='p_demanda_obs'))draft.obs=t.value;
    if(draft&&t.dataset.field)draft.data[t.dataset.field]=t.value;
    if(draft&&t.dataset.lineField&&t.dataset.lineField!=='desc'){
      var it=draft.items[Number(t.dataset.line)];if(!it)return;
      it[t.dataset.lineField==='customDesc'?'desc':t.dataset.lineField]=t.value;
      draftTotal();
    }
  });
  document.addEventListener('change',function(e){
    var t=e.target;
    if(draft&&t.dataset.field)draft.data[t.dataset.field]=t.value;
    if(draft&&t.dataset.lineField==='prioridade'){var row=draft.items[Number(t.dataset.line)];if(row)row.prioridade=t.value;}
    if(draft&&t.dataset.lineField==='desc'){
      var it=draft.items[Number(t.dataset.line)],cat=WZ_CATALOGO.find(function(c){return c.desc===t.value;});
      if(it.desc!==t.value){delete it.catalogo_id;if(draft.mode==='request-edit'){delete it.cor;delete it.cor_estrutura;delete it.cor_tela;}}
      if(cat){Object.assign(it,cat,{custom:false,preco_unit:lookupPreco(cat.desc)});if(draft.mode==='estoque')it.cor=/^TELA\b/i.test(cat.desc)?'Prata':'Branca';}
      else Object.assign(it,{desc:'',custom:t.value==='__custom__',catalogo_id:null,preco_unit:0});
      renderDraft();
    }
  });
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-p-action]');if(!t||EstoqueApp.isBusy())return;
    var action=t.dataset.pAction;
    if(action==='add-row'&&draft){draft.items.push(blank());renderDraft();}
    else if(action==='remove'&&draft){draft.items.splice(Number(t.dataset.index),1);renderDraft();}
    else if(action==='submit')submit();
    else if(action==='cancel'){close();draft=null;}
  });
  window.PedidosUI={novo:novo,editInventory:editInventory,editFolder:editFolder,editDemand:editDemand,approve:approve,refresh:function(hash,manual){return EstoqueApp.refresh(hash,manual);},detail:function(id){EstoqueUI.detail(id);},close:close};
})();
