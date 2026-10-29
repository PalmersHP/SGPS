(function(){
  'use strict';
  var draft=null;
  var h=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var num=function(v){return Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:3});};
  var date=function(){return new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'});};
  function ctx(){return EstoqueApp.context();}
  function current(){return DB.getPedido(window._pedidoId);}
  function allowed(p){return p&&(USER.role==='sede'||p.filial_id===USER.filial_id);}
  function price(it){return typeof it.preco_unit==='number'?it.preco_unit:lookupPreco(it.desc);}
  function total(p){return (p.itens||[]).reduce(function(sum,it){return sum+price(it)*(Number(it.qtd)||0);},0);}
  function blank(){return {desc:'',ma:'0,00',mb:'0,00',mc:'0,00',un:'PÇ',qtd:1};}
  function button(action,label,primary,extra){return '<button type="button" class="btn '+(primary?'btn-primary':'btn-outline')+'" data-p-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function field(label,key,value,type,extra){return '<div class="fg"><label for="p_'+key+'">'+label+'</label><input id="p_'+key+'" data-field="'+key+'" type="'+(type||'text')+'" value="'+h(value)+'" '+(extra||'')+'></div>';}
  function modal(title,body,footer){openModal(title,body,footer);document.getElementById('modalBox').classList.add('pedido-modal');}
  function close(){closeModal();document.getElementById('modalBox').classList.remove('pedido-modal');}
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
      return '<tr><td><select aria-label="Peça '+(i+1)+'" data-line="'+i+'" data-line-field="desc">'+options+'</select>'+(custom?'<input class="pedido-custom" placeholder="Descrição da peça" aria-label="Descrição da peça" data-line="'+i+'" data-line-field="customDesc" value="'+h(it.desc)+'">':'')+'</td>'+(draft.mode==='estoque'?'<td><input aria-label="Cor da peça" data-line="'+i+'" data-line-field="cor" value="'+h(it.cor||(/^TELA\b/i.test(it.desc)?'Prata':'Branca'))+'"></td>':'')+'<td>'+input('ma')+'</td><td>'+input('mb')+'</td><td>'+input('mc')+'</td><td>'+h(it.un)+'</td><td>'+input('qtd')+'</td><td class="num">'+fmtMoeda(price(it))+'</td><td>'+button('remove','✕',false,'aria-label="Remover peça '+(i+1)+'" data-index="'+i+'"')+'</td></tr>';
    }).join('');
    return '<div class="pedido-actions">'+(draft.mode==='edit'?'':button('add-row','+ Lançar peça',true))+'</div><p class="pedido-help">Escolha no catálogo e informe as medidas e a quantidade. Para braços de 4,60 m, por exemplo, preencha 4,60 na Medida A.</p><div class="tbl-wrap"><table class="pedido-table"><thead><tr><th>Peça</th>'+(draft.mode==='estoque'?'<th>Cor / acabamento</th>':'')+'<th>Med. A</th><th>Med. B</th><th>Med. C</th><th>Unid.</th><th>Quantidade</th><th>V. unit.</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="pedidoDraftTotal" class="pedido-total"></div><p id="pedidoError" class="pedido-inline-error" role="alert"></p>';
  }
  function draftTotal(){var el=document.getElementById('pedidoDraftTotal');if(el&&draft)el.textContent=(draft.mode==='estoque'?'Valor de referência: ':'Total solicitado: ')+fmtMoeda(draft.items.reduce(function(s,it){return s+price(it)*(Number(it.qtd)||0);},0));}
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
    if(draft.mode==='new'){
      document.getElementById('view-filial-novo-pedido').innerHTML='<div class="page-hdr"><div><h1>Nova pasta de condomínio</h1><p>Cadastre os dados gerais. As peças serão lançadas dentro da pasta.</p></div></div><div class="card"><div class="card-hdr"><h2>Dados do condomínio</h2></div><div class="card-body">'+form()+'</div></div><div class="pedido-footer"><span></span>'+button('submit','Criar pasta do condomínio',true)+'</div>';
    }else{
      var stock=draft.mode==='estoque';
      modal((stock?'Adicionar peças ao estoque — ':'Adicionar peças solicitadas — ')+draft.data.cliente,
        '<p class="pedido-help">'+(stock?'Informe as peças disponíveis neste depósito, com as medidas e a cor corretas. Esta entrada ficará registrada no histórico.':'Selecione as peças e a quantidade necessária para esta obra. O lançamento será conferido pela sede; o estoque só aumenta quando houver recebimento.')+'</p>'+itemEditor()+
        (stock?'<div class="fg"><label for="p_entrada_obs">Origem / motivo da entrada'+(USER.role==='filial'?' *':'')+'</label><input id="p_entrada_obs" value="'+h(draft.obs||'')+'" placeholder="Ex.: peças prontas da produção ou conferência do depósito"></div>':''),
        button('cancel','Cancelar')+button('submit',stock?'Registrar entrada no estoque':'Enviar peças para conferência',true));
    }
    draftTotal();
  }
  function novo(){
    if(!USER||USER.role!=='filial')return;
    draft={mode:'new',data:{id:'p'+crypto.randomUUID(),cliente:'',vagas:'',cor_estrutura:'Branca',cor_tela:'Prata',tipo:'Sombrite',chumbacao:'Chumbação Direta em Solo',pilares:'Tipo Direto',endereco:'',cnpj:'',sindico:'',contato:'',email:'',obs:'',prazos:prazoesPadrao()},items:[]};
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
      var catalog=DB.catalogo().find(function(c){return c.desc===it.desc;});
      var color=it.cor===undefined?(/^TELA\b/i.test(it.desc)?'Prata':'Branca'):it.cor;
      var data=Object.assign({},it,{catalogo_id:catalog?catalog.id:it.catalogo_id,preco_unit:price(it)});
      if(d.mode==='estoque'){data.cor=color;data.cor_tela=/^TELA\b/i.test(it.desc)?color:'';data.cor_estrutura=/^TELA\b/i.test(it.desc)?'':color;}
      else{delete data.cor;delete data.cor_tela;delete data.cor_estrutura;}
      return data;
    });
    if(d.mode==='estoque')d.obs=document.getElementById('p_entrada_obs').value;
    var meta={id:d.entryId,data:ctx().data,obs:d.obs||''};
    var state=await EstoqueApp.save(function(current){
      if(d.mode==='new')return Estoque.createFolder(current,d.data,ctx());
      if(d.mode==='estoque')return Estoque.addStock(current,d.target,items,ctx(),meta);
      return Estoque.addDemand(current,d.target,items,ctx(),meta);
    });
    if(!state)return;
    var target=d.mode==='new'?d.data.id:d.target;
    draft=null;close();EstoqueApp.open(target);
    if(location.hash==='#'+USER.role+'-pedido')EstoqueUI.detail(target);
    showToast(d.mode==='new'?'Pasta criada. Agora você pode lançar as peças.':d.mode==='estoque'?'Entrada de estoque registrada.':'Peças enviadas para conferência da sede.','success');
  }
  async function approve(orderId){
    var state=await EstoqueApp.save(function(s){return Estoque.approveDemand(s,orderId,ctx());});
    if(state){showToast('Peças aceitas pela sede.','success');renderView(location.hash.slice(1));}
  }
  document.addEventListener('input',function(e){
    var t=e.target;
    if(draft&&t.id==='p_entrada_obs')draft.obs=t.value;
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
    if(draft&&t.dataset.lineField==='desc'){
      var it=draft.items[Number(t.dataset.line)],cat=WZ_CATALOGO.find(function(c){return c.desc===t.value;});
      if(cat){Object.assign(it,cat,{custom:false,preco_unit:lookupPreco(cat.desc)});if(draft.mode==='estoque')it.cor=/^TELA\b/i.test(cat.desc)?'Prata':'Branca';}
      else Object.assign(it,{desc:'',custom:t.value==='__custom__',preco_unit:0});
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
  window.PedidosUI={novo:novo,editInventory:editInventory,approve:approve,refresh:function(hash,manual){return EstoqueApp.refresh(hash,manual);},detail:function(id){EstoqueUI.detail(id);},close:close};
})();
