(function(){
  'use strict';
  var busy=false,loading=false,revision=0;
  var storageKey='pastas_estoques';
  function context(){return Object.assign({},USER,{data:new Date().toLocaleDateString('sv-SE',{timeZone:'America/Sao_Paulo'}),agora:new Date().toISOString()});}
  function getState(){return Estoque.fromRecords(DB_CACHE.pedidos||[],DB.filiais(),DB.catalogo());}
  function reportError(message){
    var el=document.getElementById('estoqueError')||document.getElementById('pedidoError');
    if(el){el.textContent=message;el.scrollIntoView({block:'nearest'});}
    showToast(message,'error');
  }
  async function readKey(key,optional){
    var response=await fetch(SUPA_URL+'/rest/v1/sgps_store?key=eq.'+key+'&select=value,updated_at',{headers:SUPA_HDR,cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível consultar as pastas e os estoques. Tente novamente.');
    var rows=await response.json();
    if(optional&&Array.isArray(rows)&&rows.length===0)return null;
    if(!Array.isArray(rows)||rows.length!==1||!Array.isArray(rows[0].value)||!rows[0].updated_at)throw new Error('Os dados não estão disponíveis. Nenhuma movimentação foi salva.');
    return rows[0];
  }
  async function read(){
    var record=await readKey(storageKey,true);
    if(record)return record;
    record=await readKey('pedidos',false);
    record.initial=true;
    return record;
  }
  async function initialize(){
    var record=await readKey(storageKey,true);
    if(record)DB_CACHE.pedidos=record.value;
  }
  async function save(transform){
    if(busy)return null;
    busy=true;revision++;
    var controls=Array.from(document.querySelectorAll('[data-p-action],[data-e-action]')).map(function(el){return {el:el,disabled:el.disabled};});
    controls.forEach(function(c){c.el.disabled=true;});
    try{
      var record=await read();
      var state=Estoque.fromRecords(record.value,DB.filiais(),DB.catalogo());
      var updated=transform(state);
      var records=Estoque.toRecords(updated);
      // A primeira operação preserva a coleção antiga; abas antigas não podem apagar o histórico novo.
      // Origem, destino, histórico e fechamento são sempre gravados juntos, em um único registro.
      var payload={value:records,updated_at:new Date().toISOString()};
      if(record.initial)payload.key=storageKey;
      var target=record.initial?'?select=key':'?key=eq.'+storageKey+'&updated_at=eq.'+encodeURIComponent(record.updated_at)+'&select=key';
      var response=await fetch(SUPA_URL+'/rest/v1/sgps_store'+target,{
        method:record.initial?'POST':'PATCH',headers:Object.assign({},SUPA_HDR,{Prefer:'return=representation'}),
        body:JSON.stringify(payload)
      });
      if(response.status===409)throw new Error('Outro usuário iniciou o controle de estoque. Tente novamente para carregar os dados mais recentes.');
      if(!response.ok)throw new Error('Não foi possível salvar. Os dados continuam na tela para tentar novamente.');
      var changed=await response.json();
      if(!Array.isArray(changed)||changed.length!==1)throw new Error('Outro usuário atualizou o estoque. Tente novamente para conferir o saldo mais recente.');
      DB_CACHE.pedidos=records;buildSidebar();
      return updated;
    }catch(e){reportError(e.message);return null;}
    finally{busy=false;controls.forEach(function(c){if(c.el.isConnected)c.el.disabled=c.disabled;});}
  }
  async function refresh(hash,manual){
    if(busy||loading||!USER)return;
    if(typeof hash!=='string')hash=location.hash.slice(1);
    if(!manual&&document.getElementById('modalOverlay').classList.contains('open'))return;
    loading=true;var startedAt=revision;
    try{
      var record=await read();
      if(!busy&&startedAt===revision){
        DB_CACHE.pedidos=record.value;buildSidebar();
        if(location.hash.slice(1)===hash)renderView(hash);
      }
      if(manual)showToast('Pastas e estoques atualizados.','success');
    }catch(e){if(manual)reportError(e.message);}
    finally{loading=false;}
  }
  function open(id){
    var loc=Estoque.getLocation(getState(),id);
    if(!loc){reportError('Pasta ou estoque não encontrado.');return;}
    window._pedidoId=id;sessionStorage.setItem('sombrear_local_'+USER.id,id);
    var hash=USER.role+'-pedido';
    if(location.hash==='#'+hash)EstoqueUI.detail(id);
    else location.hash=hash;
  }
  function selected(){return window._pedidoId||sessionStorage.getItem('sombrear_local_'+USER.id);}
  function createFolder(){
    if(USER.role!=='filial'){reportError('O cadastro da pasta é feito pela filial responsável.');return;}
    if(location.hash==='#filial-novo-pedido')PedidosUI.novo();
    else location.hash='filial-novo-pedido';
  }
  window.EstoqueApp={getState:getState,save:save,refresh:refresh,initialize:initialize,context:context,open:open,selected:selected,createFolder:createFolder,editItems:function(mode,id){PedidosUI.editInventory(mode,id);},error:reportError,isBusy:function(){return busy;}};
})();
