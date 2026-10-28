(function(root){
  'use strict';
  var api={};
  function copy(v){return JSON.parse(JSON.stringify(v));}
  function fail(message){throw new Error(message);}
  function round(n){return Math.round(n*1000)/1000;}
  function id(){return 'i'+crypto.randomUUID();}
  function qty(value,unit,allowZero){
    var n=typeof value==='number'?value:Number(String(value).trim().replace(',','.'));
    if(!Number.isFinite(n)||n<0||(!allowZero&&n===0))fail('Informe uma quantidade válida e maior que zero.');
    if(/^(PÇ|PC|PEÇA|PEÇAS|UN|UNID|UNIDADE|UNIDADES)$/i.test(unit||'')&&!Number.isInteger(n))fail('A quantidade de peças deve ser um número inteiro.');
    if(round(n)!==n)fail('Use no máximo três casas decimais na quantidade.');
    return n;
  }
  function normalized(p){
    var out=copy(p);
    out.itens=(out.itens||[]).map(function(it,i){
      it.id=it.id||'legado-'+i;
      if(!it.item_status)it.item_status=it.os_status==='fabricado'?'pronto_envio':it.os_status==='em_os'?'em_fabricacao':'aguardando';
      return it;
    });
    out.remessas=out.remessas||[];
    out.log=out.log||[];
    out.saldo_inicial_confirmado=p.versao_pedido===2&&p.saldo_inicial_confirmado!==false;
    out.versao_pedido=2;
    return out;
  }
  function known(p){return p.versao_pedido===2&&p.saldo_inicial_confirmado!==false;}
  function balances(p){
    var sent={},received={};
    (p.remessas||[]).forEach(function(r){
      (r.itens||[]).forEach(function(it){
        sent[it.item_id]=round((sent[it.item_id]||0)+Number(it.qtd));
        if(r.recebido_em)received[it.item_id]=round((received[it.item_id]||0)+Number(it.qtd));
      });
    });
    return (p.itens||[]).map(function(it,i){
      var key=it.id||'legado-'+i, requested=Number(it.qtd)||0;
      return {id:key,item:it,pedido:requested,enviado:sent[key]||0,recebido:received[key]||0,saldo:round(Math.max(0,requested-(sent[key]||0)))};
    });
  }
  function access(p,ctx,role){
    if(!ctx||ctx.role!==role||(role==='filial'&&p.filial_id!==ctx.filial_id))fail('Seu perfil não pode realizar esta ação neste pedido.');
    if(p.inativo||p.status==='cancelado')fail('Este pedido está inativo.');
  }
  function status(p){
    var rows=balances(p).filter(function(b){return b.pedido>0;});
    if(rows.some(function(b){return b.item.item_status==='aguardando';}))return 'aguardando';
    if(known(p)&&rows.length&&rows.every(function(b){return b.recebido>=b.pedido;}))return 'entregue';
    if(known(p)&&rows.length&&rows.every(function(b){return b.saldo===0;}))return 'em_transito';
    return 'em_fabricacao';
  }
  function finish(p,ctx,message){
    p.status=status(p);p.atualizado=ctx.data;
    p.log.push({status:p.status,data:ctx.data,user:ctx.nome,obs:message});
    return p;
  }
  function makeItems(items,ctx,complement){
    if(!Array.isArray(items)||!items.length)fail('Adicione pelo menos uma peça ao pedido.');
    return items.map(function(it){
      if(!String(it.desc||'').trim())fail('Selecione a peça em todas as linhas.');
      var n=qty(it.qtd,it.un,false),price=Number(it.preco_unit)||0;
      return {id:id(),desc:String(it.desc).trim(),ma:String(it.ma||'0,00'),mb:String(it.mb||'0,00'),mc:String(it.mc||'0,00'),un:it.un||'PÇ',qtd:n,preco_unit:price,subtotal:price*n,item_status:'aguardando',complemento:!!complement,solicitado_em:ctx.data,solicitado_por:ctx.nome};
    });
  }
  api.create=function(details,items,ctx){
    if(ctx.role!=='filial'||!ctx.filial_id)fail('O pedido deve ser criado por uma filial.');
    if(!String(details.cliente||'').trim())fail('Informe o nome do condomínio.');
    if(!details.cor_estrutura||!details.cor_tela)fail('Informe as cores da estrutura e da tela.');
    var vagas=qty(details.vagas,'PÇ',false);
    var p=Object.assign({},details,{id:'p'+crypto.randomUUID(),cliente:details.cliente.trim(),vagas:vagas,filial_id:ctx.filial_id,filial_nome:ctx.filial_nome,versao_pedido:2,saldo_inicial_confirmado:true,status:'aguardando',criado:ctx.data,atualizado:ctx.data,itens:makeItems(items,ctx,false),remessas:[],log:[]});
    return finish(p,ctx,'Pedido inicial enviado à sede.');
  };
  api.add=function(p,items,ctx){
    access(p,ctx,'filial');p=normalized(p);
    p.itens=p.itens.concat(makeItems(items,ctx,true));
    return finish(p,ctx,'Peças complementares enviadas para conferência da sede.');
  };
  api.edit=function(p,items,ctx,originals){
    access(p,ctx,'filial');p=normalized(p);
    if(!known(p))fail('A sede precisa conferir os envios anteriores antes de editar peças.');
    var changes=new Map(items.map(function(it){return [it.id,it];}));
    if(changes.size!==items.length)fail('Há peças repetidas na edição.');
    var targets=new Set((originals||items).map(function(it){return it.id;}));
    (originals||items).forEach(function(before){
      var now=p.itens.find(function(it){return it.id===before.id;});
      if(!now||now.item_status!=='aguardando')fail('Uma peça foi alterada ou aprovada. Reabra a revisão antes de salvar.');
      if(originals&&['desc','ma','mb','mc','un','qtd'].some(function(k){return String(now[k])!==String(before[k]);}))fail('Uma peça foi alterada por outro usuário. Reabra a revisão antes de salvar.');
    });
    changes.forEach(function(it,key){
      var existing=p.itens.find(function(x){return x.id===key;});
      if(!existing||!targets.has(key)||existing.item_status!=='aguardando')fail('Uma peça já foi aprovada. Atualize o pedido antes de editar.');
    });
    p.itens=p.itens.flatMap(function(it){
      if(it.item_status!=='aguardando'||!targets.has(it.id))return [it];
      if(!changes.has(it.id))return [];
      var change=makeItems([changes.get(it.id)],ctx,it.complemento)[0];
      return [Object.assign({},it,change,{id:it.id})];
    });
    if(!p.itens.length)fail('O pedido precisa ter pelo menos uma peça.');
    return finish(p,ctx,'Peças pendentes revisadas pela filial.');
  };
  api.approve=function(p,ctx,keys){
    access(p,ctx,'sede');p=normalized(p);var count=0;
    p.itens.forEach(function(it){
      if(it.qtd>0&&it.item_status==='aguardando'&&(!keys||keys.indexOf(it.id)>=0)){
        it.item_status='aprovado';it.os_status='';it.aprovado_em=ctx.data;count++;
      }
    });
    if(!count)fail('Não há peças pendentes de conferência.');
    return finish(p,ctx,count+' item(ns) conferido(s) e aceito(s) pela sede.');
  };
  function shipment(p,entries,ctx,meta,baseline){
    if(!entries.length)fail('Informe a quantidade de pelo menos uma peça.');
    var seen=new Set(),rows=balances(p);
    var items=entries.map(function(entry){
      if(seen.has(entry.item_id))fail('A mesma peça aparece duas vezes no envio.');
      seen.add(entry.item_id);
      var b=rows.find(function(x){return x.id===entry.item_id;});
      if(!b)fail('Peça não encontrada. Atualize o pedido.');
      var n=qty(entry.qtd,b.item.un,false);
      if(!baseline&&b.item.item_status==='aguardando')fail('A sede precisa aceitar a peça antes de enviá-la.');
      if(n>b.saldo)fail('A quantidade enviada de '+b.item.desc+' ultrapassa o saldo de '+b.saldo+'.');
      return {item_id:b.id,desc:b.item.desc,ma:b.item.ma,mb:b.item.mb,mc:b.item.mc,un:b.item.un,qtd:n};
    });
    if(!meta.id||p.remessas.some(function(r){return r.id===meta.id;}))fail('Este envio já foi registrado. Atualize o pedido.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(meta.data||'')||!Number.isFinite(Date.parse(meta.data))||meta.data>ctx.data)fail('Informe uma data de envio válida, até hoje.');
    p.remessas.push({id:meta.id,data:meta.data,obs:String(meta.obs||'').trim(),user:ctx.nome,anterior:!!baseline,itens:items,recebido_em:null});
  }
  api.send=function(p,entries,ctx,meta){
    access(p,ctx,'sede');p=normalized(p);
    if(!known(p))fail('Confira os envios anteriores para iniciar o controle de saldo.');
    shipment(p,entries,ctx,meta,false);
    return finish(p,ctx,'Remessa registrada pela sede.');
  };
  api.baseline=function(p,entries,ctx,meta){
    access(p,ctx,'sede');p=normalized(p);
    if(known(p))fail('O saldo inicial deste pedido já foi conferido.');
    if(entries.length){
      shipment(p,entries,ctx,meta,true);
      entries.forEach(function(e){var it=p.itens.find(function(i){return i.id===e.item_id;});if(it.item_status==='aguardando')it.item_status='aprovado';});
    }
    p.saldo_inicial_confirmado=true;
    return finish(p,ctx,'Saldo inicial conferido: envios anteriores registrados pela sede.');
  };
  api.receive=function(p,shipmentId,ctx){
    access(p,ctx,'filial');p=normalized(p);
    var r=p.remessas.find(function(x){return x.id===shipmentId;});
    if(!r)fail('Remessa não encontrada.');
    if(r.recebido_em)fail('O recebimento desta remessa já foi confirmado.');
    r.recebido_em=ctx.data;r.recebido_por=ctx.nome;
    return finish(p,ctx,'Recebimento da remessa de '+r.data+' confirmado pela filial.');
  };
  api.production=function(p,key,next,ctx){
    access(p,ctx,'sede');p=normalized(p);
    if(['aprovado','em_fabricacao','pronto_envio'].indexOf(next)<0)fail('Use as remessas para registrar envios e recebimentos.');
    var it=p.itens.find(function(x){return x.id===key;});
    if(!it)fail('Peça não encontrada.');
    it.item_status=next;it.os_status=next==='em_fabricacao'?'em_os':'';
    return finish(p,ctx,it.desc+': '+next.replace(/_/g,' ')+'.');
  };
  api.normalize=normalized;api.balances=balances;api.known=known;api.qty=qty;api.status=status;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.Pedidos=api;
})(typeof window!=='undefined'?window:globalThis);
