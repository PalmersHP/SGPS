(function(root){
  'use strict';
  var api={},META_ID='__estoques_sombrear';
  function copy(v){return JSON.parse(JSON.stringify(v));}
  function fail(message){throw new Error(message);}
  function round(n){return Math.round(n*1000)/1000;}
  function uid(prefix){return (prefix||'m')+crypto.randomUUID();}
  function text(v){return String(v==null?'':v).trim().replace(/\s+/g,' ');}
  function canonical(v){return text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();}
  function unit(v){var u=canonical(v||'PÇ');if(['PC','PÇ','PECA','PECAS'].indexOf(u)>=0)return 'PÇ';if(['UN','UNID','UNIDADE','UNIDADES'].indexOf(u)>=0)return 'UNID';if(u==='M2')return 'M²';return u;}
  function quantity(value,un,zero){
    if(value===null||value===undefined||text(value)==='')fail('Informe uma quantidade válida.');
    var n=typeof value==='number'?value:Number(text(value).replace(',','.'));
    if(!Number.isFinite(n)||n<0||(!zero&&n===0)||round(n)!==n)fail('Informe uma quantidade válida, positiva e com até três casas decimais.');
    if(['PÇ','UNID'].indexOf(unit(un))>=0&&!Number.isInteger(n))fail('A quantidade de peças deve ser inteira.');
    return n;
  }
  function dimension(v){
    var s=text(v);if(!s||s==='—'||s==='-')return '0';
    var n=Number(s.replace(',','.'));return Number.isFinite(n)?String(n):canonical(s);
  }
  function color(v){return text(v).replace(/^(?:estrutura|tela)\s+/i,'').trim();}
  function normalizeItem(item,pasta){
    item=item||{};pasta=pasta||{};
    var desc=text(item.desc||item.descricao||item.nome),tela=/^TELA\b/i.test(desc);
    var cor=color(item.cor||(tela?(item.cor_tela||pasta.cor_tela):(item.cor_estrutura||pasta.cor_estrutura))||'');
    return {catalogo_id:item.catalogo_id==null?null:String(item.catalogo_id),desc:desc,un:unit(item.un),ma:text(item.ma)||'0,00',mb:text(item.mb)||'0,00',mc:text(item.mc)||'0,00',cor:cor,cor_estrutura:tela?'':cor,cor_tela:tela?cor:''};
  }
  function keyOf(item,pasta){
    var p=normalizeItem(item,pasta);
    return 'sku:'+[(p.catalogo_id?'id:'+p.catalogo_id:'desc:'+canonical(p.desc)),p.un,dimension(p.ma),dimension(p.mb),dimension(p.mc),canonical(p.cor)].map(encodeURIComponent).join('|');
  }
  function piece(state,item,pasta){
    var p=normalizeItem(item,pasta);
    // A missing legacy ID may be resolved by description. Explicit null denotes
    // a custom piece and must stay stable even if the catalogue later grows.
    if(!p.catalogo_id&&!(Object.prototype.hasOwnProperty.call(item,'catalogo_id')&&item.catalogo_id===null)){
      var matches=(state.catalogo||[]).filter(function(c){return canonical(c.desc)===canonical(p.desc);});
      if(matches.length===1)p.catalogo_id=String(matches[0].id);
    }
    return p;
  }
  function folder(state,id){return state.pastas.find(function(p){return p.id===id;});}
  function known(p){return p.estoque_inicial_conferido===true;}
  function descriptors(state){
    return state.estoques.map(function(e){return {id:e.id,tipo:'estoque',nome:e.nome,filial_id:e.filial_id||null,conhecido:true,finalizada:false,ativo:e.ativo!==false};}).concat(state.pastas.map(function(p){return {id:p.id,tipo:'condominio',nome:p.cliente||p.nome,filial_id:p.filial_id,conhecido:known(p),finalizada:p.status_obra==='finalizada',ativo:!p.inativo&&p.status!=='cancelado',pasta:p};}));
  }
  function location(state,id){
    if(id==='origem-legada')return {id:id,tipo:'historico',nome:'Envio anterior da sede',filial_id:null,conhecido:true,finalizada:false,ativo:false};
    return descriptors(state).find(function(l){return l.id===id;})||null;
  }
  function ensureLocation(state,id){var l=location(state,id);if(!l||l.tipo==='historico')fail('Local de estoque não encontrado.');return l;}
  function ensureOpen(state,id){var l=ensureLocation(state,id);if(!l.ativo)fail('Este local está inativo.');if(l.finalizada)fail('A obra está finalizada. Reabra antes de alterar o estoque.');return l;}
  function ensureKnown(state,id){var l=ensureOpen(state,id);if(!l.conhecido)fail('Confira o estoque inicial do condomínio antes de movimentar peças.');return l;}
  function owns(ctx,l){return ctx&&ctx.role==='filial'&&!!ctx.filial_id&&l.filial_id===ctx.filial_id;}
  function actor(ctx){if(!ctx||['sede','filial'].indexOf(ctx.role)<0)fail('Perfil sem permissão para esta ação.');if(!validDay(ctx.data))fail('Informe a data da operação.');}
  function validDay(day){return /^\d{4}-\d{2}-\d{2}$/.test(day||'')&&Number.isFinite(Date.parse(day+'T00:00:00Z'))&&new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day;}
  function ownFolder(state,id,ctx){actor(ctx);var l=ensureOpen(state,id);if(l.tipo!=='condominio'||!owns(ctx,l))fail('Somente a filial responsável pode alterar esta pasta.');return l.pasta;}
  function fresh(state,meta){var id=meta&&meta.id||uid();if(state.movimentos.some(function(m){return m.id===id;}))fail('Já registrado. Atualize a tela antes de continuar.');return id;}
  function event(state,type,ctx,meta,fields){
    actor(ctx);meta=meta||{};var d=meta.data||ctx.data;
    if(!validDay(d)||d>ctx.data)fail('Informe uma data válida, até hoje.');
    return Object.assign({id:fresh(state,meta),tipo:type,data:d,criado_em:ctx.agora||ctx.data,usuario_id:ctx.id||null,usuario_nome:ctx.nome||'Usuário',obs:text(meta.obs)},copy(fields||{}));
  }
  function append(state,m){
    state.movimentos.push(m);
    var ids=new Set([m.pasta_id,m.origem_id,m.destino_id].filter(Boolean));
    ids.forEach(function(id){
      var p=folder(state,id);if(!p)return;
      p.atualizado=m.data;p.log=p.log||[];
      p.log.push({status:p.status||'rascunho',data:m.data,user:m.usuario_nome,obs:m.obs||({pasta_criada:'Pasta do condomínio criada.',demanda:'Peças solicitadas pela filial.',aceite:'Peças aceitas pela sede.',entrada:'Entrada no estoque.',transferencia:'Remanejamento despachado.',recebimento:'Recebimento de peças confirmado.',conferencia_inicial:'Estoque inicial conferido.',conferencia_fechamento:'Peças instaladas conferidas no fechamento.',finalizacao:'Obra finalizada.',reabertura:'Obra reaberta.'}[m.tipo]||m.tipo),movimento_id:m.id});
    });
  }
  function receiptIds(state){return new Set(state.movimentos.filter(function(m){return m.tipo==='recebimento';}).map(function(m){return m.referencia_id;}));}
  function pending(state,id){
    var received=receiptIds(state);
    return state.movimentos.filter(function(m){return m.tipo==='transferencia'&&!received.has(m.id)&&(!id||m.origem_id===id||m.destino_id===id);});
  }
  function balances(state,id){
    var l=ensureLocation(state,id),p=l.tipo==='condominio'?l.pasta:null,rows=new Map(),received=receiptIds(state);
    function get(peca,key){
      key=key||keyOf(peca);
      if(!rows.has(key))rows.set(key,{key:key,peca:copy(peca),solicitado:0,aprovado:0,disponivel:0,em_transito_entrada:0,em_transito_saida:0,instalado:0,entradas:0,saidas:0,historico_enviado:0,historico_recebido:0,conhecido:l.conhecido});
      return rows.get(key);
    }
    if(p){
      (p.itens||[]).forEach(function(it){
        var n=Number(it.qtd)||0;if(n<=0)return;
        var row=get(piece(state,it,p));row.solicitado=round(row.solicitado+n);
        if(it.item_status&&['aguardando','rascunho','cancelado'].indexOf(it.item_status)<0||it.os_status==='em_os'||it.os_status==='fabricado')row.aprovado=round(row.aprovado+n);
      });
      (p.remessas||[]).forEach(function(r){(r.itens||[]).forEach(function(it){
        var original=(p.itens||[]).find(function(i,index){return (i.id||'legado-'+index)===it.item_id;});
        var row=get(piece(state,Object.assign({},original||{},it),p)),n=Number(it.qtd)||0;
        row.historico_enviado=round(row.historico_enviado+n);if(r.recebido_em)row.historico_recebido=round(row.historico_recebido+n);
      });});
    }
    state.movimentos.forEach(function(m){
      if([m.pasta_id,m.origem_id,m.destino_id].indexOf(id)<0)return;
      if(['entrada','transferencia','recebimento','conferencia_inicial','conferencia_fechamento'].indexOf(m.tipo)<0)return;
      (m.itens||[]).forEach(function(it){
        var row=get(it.peca,it.key),q=Number(it.qtd)||0;
        if(m.tipo==='entrada'&&m.destino_id===id){row.disponivel+=q;row.entradas+=q;}
        else if(m.tipo==='conferencia_inicial'&&m.destino_id===id){row.disponivel+=it.disponivel;row.instalado+=it.instalado;row.entradas+=it.disponivel+it.instalado;}
        else if(m.tipo==='transferencia'){
          if(m.origem_id===id){row.disponivel-=q;row.saidas+=q;if(!received.has(m.id))row.em_transito_saida+=q;}
          if(m.destino_id===id&&!received.has(m.id))row.em_transito_entrada+=q;
        }else if(m.tipo==='recebimento'&&m.destino_id===id){row.disponivel+=q;row.entradas+=q;}
        else if(m.tipo==='conferencia_fechamento'&&m.pasta_id===id){row.disponivel-=it.delta;row.instalado+=it.delta;}
      });
    });
    return Array.from(rows.values()).map(function(r){['solicitado','aprovado','disponivel','em_transito_entrada','em_transito_saida','instalado','entradas','saidas'].forEach(function(k){r[k]=round(r[k]);});return r;});
  }
  function recalc(state,p){
    if(p.status_obra==='finalizada'){p.status='concluido';return;}
    if((p.itens||[]).some(function(i){return i.qtd>0&&(!i.item_status||i.item_status==='aguardando');})){p.status='aguardando';return;}
    if(pending(state,p.id).some(function(m){return m.destino_id===p.id;})){p.status='em_transito';return;}
    p.status=(p.itens||[]).some(function(i){return i.qtd>0;})?'em_fabricacao':'rascunho';
  }
  function demandItems(state,p,items,ctx,complement){
    if(!Array.isArray(items)||!items.length)fail('Selecione pelo menos uma peça.');
    return items.map(function(it){
      var normalized=piece(state,it,p);if(!normalized.desc)fail('Selecione a peça em todas as linhas.');
      var n=quantity(it.qtd,normalized.un,false),price=Number(it.preco_unit)||0;
      return Object.assign({},normalized,{id:uid('i'),qtd:n,preco_unit:price,subtotal:round(n*price),item_status:'aguardando',complemento:!!complement,solicitado_em:ctx.data,solicitado_por:ctx.nome});
    });
  }
  function priceFolder(p){p.subtotal_pecas=round((p.itens||[]).reduce(function(n,it){return n+(Number(it.preco_unit)||0)*(Number(it.qtd)||0);},0));p.frete=p.frete||0;p.valor=p.subtotal_pecas+p.frete;}
  api.fromRecords=function(records,filiais,catalogo){
    if(!Array.isArray(records))fail('Os registros do sistema não estão disponíveis.');
    var metas=records.filter(function(r){return r&&r.id===META_ID;});
    if(metas.length>1||metas.length&&metas[0].tipo_registro!=='controle_estoque')fail('O registro de controle de estoque está inconsistente.');
    var meta=metas[0]||{};
    var state={versao:1,pastas:copy(records.filter(function(r){return r&&r.id!==META_ID;})),estoques:copy(meta.estoques||[]),movimentos:copy(meta.movimentos||[]),catalogo:copy(catalogo||[])};
    if(new Set(state.movimentos.map(function(m){return m.id;})).size!==state.movimentos.length)fail('Há movimentações duplicadas no histórico.');
    if(!state.estoques.some(function(e){return e.id==='estoque-go';}))state.estoques.unshift({id:'estoque-go',tipo:'estoque',nome:'Estoque Sombrear GO',filial_id:null,ativo:true});
    (filiais||[]).forEach(function(f){
      // GO already has the central warehouse. Keep any persisted warehouse as-is,
      // but do not generate a second one from the sede's filial registration.
      if(canonical(f.nome)==='SOMBREAR GO')return;
      var id='estoque-filial-'+f.id;
      if(!state.estoques.some(function(e){return e.id===id;}))state.estoques.push({id:id,tipo:'estoque',nome:'Estoque '+text(f.nome||f.id),filial_id:f.id,ativo:f.ativo!==false});
    });
    state.pastas.forEach(function(p){
      p.status_obra=p.status_obra||'aberta';p.itens=p.itens||[];p.log=p.log||[];
      p.itens.forEach(function(it,index){if(!it.id)it.id='legado-'+index;var normalized=piece(state,it,p);if(!it.catalogo_id&&normalized.catalogo_id)it.catalogo_id=normalized.catalogo_id;});
      (p.remessas||[]).forEach(function(r,index){
        if(r.recebido_em)return;
        var id='legado:'+p.id+':'+(r.id||index);
        if(state.movimentos.some(function(m){return m.id===id;}))return;
        var itens=(r.itens||[]).filter(function(it){return Number(it.qtd)>0;}).map(function(it){
          var old=p.itens.find(function(i){return i.id===it.item_id;}),peca=piece(state,Object.assign({},old||{},it),p);
          return {key:keyOf(peca),peca:peca,qtd:Number(it.qtd)};
        });
        if(itens.length)state.movimentos.push({id:id,tipo:'transferencia',legado:true,remessa_legada_id:r.id||null,origem_id:'origem-legada',origem_nome:'Envio anterior da sede',destino_id:p.id,destino_nome:p.cliente,itens:itens,data:r.data||p.criado,criado_em:r.data||p.criado,usuario_id:null,usuario_nome:r.user||'Sede (histórico)',obs:r.obs||'Remessa anterior ao controle de estoque, ainda aguardando recebimento.'});
      });
    });
    return state;
  };
  api.toRecords=function(state){return copy(state.pastas).concat([{id:META_ID,tipo_registro:'controle_estoque',versao_estoque:1,estoques:copy(state.estoques),movimentos:copy(state.movimentos)}]);};
  api.createFolder=function(input,details,ctx){
    actor(ctx);if(ctx.role!=='filial'||!ctx.filial_id)fail('A pasta deve ser criada pela filial responsável.');
    var state=copy(input),id=details.id||uid('p');
    if(id===META_ID||location(state,id))fail('Já registrado. Esta pasta já existe.');
    var name=text(details.cliente||details.nome);if(!name)fail('Informe o nome do condomínio.');
    if(state.pastas.some(function(p){return p.filial_id===ctx.filial_id&&canonical(p.cliente||p.nome)===canonical(name);}))fail('Já existe uma pasta para este condomínio. Abra a pasta existente para lançar as peças.');
    var vagas=quantity(details.vagas,'PÇ',false);
    if(!text(details.cor_estrutura)||!text(details.cor_tela))fail('Informe as cores da estrutura e da tela.');
    var p=Object.assign({},copy(details),{id:id,tipo_registro:'pasta_condominio',cliente:name,filial_id:ctx.filial_id,filial_nome:ctx.filial_nome||'',vagas:vagas,status:'rascunho',status_obra:'aberta',versao_pedido:2,estoque_inicial_conferido:true,criado:ctx.data,atualizado:ctx.data,itens:[],remessas:[],log:[],valor:0,subtotal_pecas:0,frete:0});
    state.pastas.unshift(p);append(state,event(state,'pasta_criada',ctx,{id:'criacao:'+id},{pasta_id:id,itens:[]}));return state;
  };
  api.addDemand=function(input,pastaId,items,ctx,meta){
    var state=copy(input),p=ownFolder(state,pastaId,ctx),m=event(state,'demanda',ctx,meta,{pasta_id:pastaId});
    var additions=demandItems(state,p,items,ctx,p.itens.length>0);p.itens=p.itens.concat(additions);priceFolder(p);recalc(state,p);
    m.itens=additions.map(function(it){var pc=piece(state,it,p);return {key:keyOf(pc),peca:pc,qtd:it.qtd,demanda_id:it.id};});append(state,m);return state;
  };
  api.approveDemand=function(input,pastaId,ctx,keys,meta){
    actor(ctx);if(ctx.role!=='sede')fail('Somente a sede pode aceitar as peças solicitadas.');
    if(keys&&!Array.isArray(keys)){meta=keys;keys=null;}
    var state=copy(input),l=ensureOpen(state,pastaId);if(l.tipo!=='condominio')fail('Selecione uma pasta de condomínio.');
    var p=l.pasta,m=event(state,'aceite',ctx,meta,{pasta_id:pastaId,itens:[]});
    p.itens.forEach(function(it){var pc=piece(state,it,p),key=keyOf(pc);if(it.qtd>0&&(!it.item_status||it.item_status==='aguardando')&&(!keys||keys.indexOf(key)>=0||keys.indexOf(it.id)>=0)){it.item_status='aprovado';it.aprovado_em=ctx.data;m.itens.push({key:key,peca:pc,qtd:it.qtd,demanda_id:it.id});}});
    if(!m.itens.length)fail('Não há peças pendentes de aceite.');recalc(state,p);append(state,m);return state;
  };
  api.addStock=function(input,stockId,items,ctx,meta){
    actor(ctx);var state=copy(input),l=ensureOpen(state,stockId);
    if(l.tipo!=='estoque')fail('Entradas diretas são permitidas apenas nos depósitos.');
    if(stockId==='estoque-go'?ctx.role!=='sede':!owns(ctx,l))fail('Seu perfil não pode adicionar peças neste estoque.');
    if(stockId!=='estoque-go'&&!text(meta&&meta.obs))fail('Informe a origem ou justificativa desta entrada no estoque da filial.');
    if(!Array.isArray(items)||!items.length)fail('Selecione pelo menos uma peça.');
    var m=event(state,'entrada',ctx,meta,{destino_id:stockId,destino_nome:l.nome,itens:items.map(function(it){var pc=piece(state,it);if(!pc.desc)fail('Selecione a peça.');if(!pc.cor)fail('Informe a cor ou o acabamento da peça.');return {key:keyOf(pc),peca:pc,qtd:quantity(it.qtd,pc.un,false)};})});
    append(state,m);return state;
  };
  api.transfer=function(input,from,to,entries,ctx,meta){
    actor(ctx);if(from===to)fail('Escolha um destino diferente da origem.');
    var state=copy(input),origin=ensureKnown(state,from),dest=ensureOpen(state,to);
    if(ctx.role==='sede'){if(from!=='estoque-go')fail('A sede remaneja peças a partir do estoque Sombrear GO.');}
    else if(!owns(ctx,origin)||!owns(ctx,dest)||from==='estoque-go'||to==='estoque-go')fail('A filial só pode remanejar entre seus condomínios e seu próprio estoque.');
    if(!Array.isArray(entries)||!entries.length)fail('Selecione pelo menos uma peça para remanejar.');
    var rows=balances(state,from),seen=new Set(),m=event(state,'transferencia',ctx,meta,{origem_id:from,origem_nome:origin.nome,destino_id:to,destino_nome:dest.nome,itens:entries.map(function(it){
      if(seen.has(it.key))fail('A mesma peça foi selecionada duas vezes.');seen.add(it.key);
      var b=rows.find(function(r){return r.key===it.key;});if(!b)fail('Peça não encontrada no estoque de origem.');
      var n=quantity(it.qtd,b.peca.un,false);if(n>b.disponivel)fail('A quantidade de '+b.peca.desc+' ultrapassa o estoque disponível de '+b.disponivel+'.');
      return {key:b.key,peca:copy(b.peca),qtd:n};
    })});
    append(state,m);[folder(state,from),folder(state,to)].filter(Boolean).forEach(function(p){recalc(state,p);});return state;
  };
  api.receive=function(input,moveId,ctx,meta){
    actor(ctx);var state=copy(input),transfer=state.movimentos.find(function(m){return m.id===moveId&&m.tipo==='transferencia';});
    if(!transfer)fail('Remanejamento não encontrado.');
    if(receiptIds(state).has(moveId))fail('Já registrado. O recebimento deste remanejamento já foi confirmado.');
    var dest=ensureKnown(state,transfer.destino_id);
    if(dest.id==='estoque-go'?ctx.role!=='sede':!owns(ctx,dest))fail('Somente o responsável pelo destino pode confirmar o recebimento.');
    var m=event(state,'recebimento',ctx,meta,{referencia_id:moveId,origem_id:transfer.origem_id,origem_nome:transfer.origem_nome,destino_id:transfer.destino_id,destino_nome:transfer.destino_nome,itens:copy(transfer.itens),legado:!!transfer.legado});
    append(state,m);[folder(state,transfer.origem_id),folder(state,transfer.destino_id)].filter(Boolean).forEach(function(p){recalc(state,p);});return state;
  };
  api.legacyInitial=function(input,pastaId,entries,ctx,meta){
    actor(ctx);var state=copy(input),l=ensureOpen(state,pastaId);
    if(l.tipo!=='condominio'||!(ctx.role==='sede'||owns(ctx,l)))fail('Seu perfil não pode conferir este estoque.');
    if(l.conhecido)fail('O estoque inicial deste condomínio já foi conferido.');
    if(!Array.isArray(entries))fail('Informe a conferência física das peças.');
    var rows=balances(state,pastaId),seen=new Set(),m=event(state,'conferencia_inicial',ctx,meta,{destino_id:pastaId,destino_nome:l.nome,pasta_id:pastaId,itens:entries.map(function(it){
      if(seen.has(it.key))fail('A mesma peça aparece duas vezes na conferência.');seen.add(it.key);
      var row=rows.find(function(r){return r.key===it.key;}),pc=row?row.peca:it.peca?piece(state,it.peca,l.pasta):null;
      if(!pc||keyOf(pc)!==it.key)fail('Peça não encontrada para conferir o saldo inicial.');
      return {key:it.key,peca:copy(pc),disponivel:quantity(it.disponivel,pc.un,true),instalado:quantity(it.instalado,pc.un,true)};
    })});
    l.pasta.estoque_inicial_conferido=true;append(state,m);recalc(state,l.pasta);return state;
  };
  api.reconcile=function(input,pastaId,totals,ctx,meta){
    var state=copy(input),p=ownFolder(state,pastaId,ctx);ensureKnown(state,pastaId);
    if(!Array.isArray(totals))fail('Informe as quantidades realmente instaladas.');
    var rows=balances(state,pastaId),seen=new Set(),m=event(state,'conferencia_fechamento',ctx,meta,{pasta_id:pastaId,itens:[]}),changed=false;
    totals.forEach(function(it){
      if(seen.has(it.key))fail('A mesma peça aparece duas vezes na conferência.');seen.add(it.key);
      var b=rows.find(function(r){return r.key===it.key;});if(!b)fail('Peça não encontrada na pasta.');
      var target=quantity(it.qtd,b.peca.un,true),delta=round(target-b.instalado);
      if(delta>b.disponivel)fail('O total instalado de '+b.peca.desc+' ultrapassa as peças disponíveis no condomínio.');
      if(delta<0&&!text(meta&&meta.obs))fail('Justifique a correção de uma quantidade instalada anteriormente.');
      if(delta!==0)changed=true;
      m.itens.push({key:b.key,peca:copy(b.peca),qtd:target,delta:delta});
    });
    if(p.conferencia_fechamento&&!changed)return state;
    p.conferencia_fechamento={id:m.id,data:m.data,criado_em:m.criado_em,usuario_id:m.usuario_id,usuario_nome:m.usuario_nome,totais:rows.map(function(b){var newValue=m.itens.find(function(it){return it.key===b.key;});return {key:b.key,qtd:newValue?newValue.qtd:b.instalado};})};
    append(state,m);return state;
  };
  function buildReport(state,pastaId,when){
    var p=folder(state,pastaId);if(!p)fail('Pasta não encontrada.');
    var rows=balances(state,pastaId),items=rows.map(function(b){return {key:b.key,peca:copy(b.peca),solicitado:b.solicitado,aprovado:b.aprovado,recebido:b.entradas,enviado:b.saidas,instalado:b.instalado,disponivel:b.disponivel,em_transito_entrada:b.em_transito_entrada,em_transito_saida:b.em_transito_saida,diferenca:round(b.solicitado-b.instalado),historico_enviado:b.historico_enviado,historico_recebido:b.historico_recebido};});
    return {pasta_id:p.id,condominio:p.cliente,filial_id:p.filial_id,filial_nome:p.filial_nome,cor_estrutura:p.cor_estrutura,cor_tela:p.cor_tela,vagas:p.vagas,gerado_em:when||p.finalizado_em||p.atualizado,finalizado_em:p.finalizado_em||null,finalizado_por:p.finalizado_por||null,conhecido:known(p),itens:items,movimentacoes:copy(state.movimentos.filter(function(m){return [m.pasta_id,m.origem_id,m.destino_id].indexOf(pastaId)>=0;})),totais:{linhas:items.length,solicitado:round(items.reduce(function(n,it){return n+it.solicitado;},0)),instalado:round(items.reduce(function(n,it){return n+it.instalado;},0)),disponivel:round(items.reduce(function(n,it){return n+it.disponivel;},0)),em_transito:round(items.reduce(function(n,it){return n+it.em_transito_entrada+it.em_transito_saida;},0))}};
  }
  api.finalize=function(input,pastaId,ctx,meta){
    var state=copy(input),p=ownFolder(state,pastaId,ctx);ensureKnown(state,pastaId);
    if(!p.conferencia_fechamento)fail('Confira as peças realmente instaladas antes de finalizar a obra.');
    if(pending(state,pastaId).length)fail('Há peças em trânsito. Confirme os recebimentos pendentes antes de finalizar.');
    var rows=balances(state,pastaId);
    if(rows.some(function(b){return b.disponivel!==0;}))fail('Ainda há estoque no condomínio. Remaneje todas as sobras antes de finalizar.');
    var m=event(state,'finalizacao',ctx,meta,{pasta_id:pastaId,itens:[]});
    p.status_obra='finalizada';p.status='concluido';p.finalizado_em=m.criado_em;p.finalizado_por=m.usuario_nome;
    append(state,m);p.relatorio_final=buildReport(state,pastaId,m.criado_em);return state;
  };
  api.reopen=function(input,pastaId,ctx,meta){
    actor(ctx);if(ctx.role!=='sede')fail('Somente a sede pode reabrir uma obra finalizada.');
    var state=copy(input),p=folder(state,pastaId);if(!p||p.status_obra!=='finalizada')fail('Esta obra não está finalizada.');
    if(!text(meta&&meta.obs))fail('Informe o motivo da reabertura.');
    var m=event(state,'reabertura',ctx,meta,{pasta_id:pastaId,itens:[]});
    p.relatorios_finais=p.relatorios_finais||[];if(p.relatorio_final)p.relatorios_finais.push(copy(p.relatorio_final));
    delete p.relatorio_final;delete p.finalizado_em;delete p.finalizado_por;delete p.conferencia_fechamento;p.status_obra='aberta';recalc(state,p);append(state,m);return state;
  };
  api.report=function(state,id){var p=folder(state,id);if(!p)fail('Pasta não encontrada.');return p.status_obra==='finalizada'&&p.relatorio_final?copy(p.relatorio_final):buildReport(state,id);};
  api.locations=function(state){return copy(descriptors(state));};
  api.getLocation=function(state,id){var l=location(state,id);return l?copy(l):null;};
  api.balances=balances;
  api.history=function(state,id){return copy(state.movimentos.filter(function(m){return !id||[m.pasta_id,m.origem_id,m.destino_id].indexOf(id)>=0;}));};
  api.pendingTransfers=function(state,id){return copy(pending(state,id));};
  api.normalizeItem=normalizeItem;api.keyOf=keyOf;api.qty=quantity;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Estoque=api;
})(typeof window!=='undefined'?window:globalThis);
