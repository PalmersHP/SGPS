# Plano — App Web Sombrear: Sistema de Pedidos de Fabricação

**Versão:** 2.0 | **Data:** 21/04/2026  
**Objetivo:** Sistema completo de pedidos entre Filial → Sede (Indústria), com rastreamento de status, dashboard de KPIs e relatórios gerenciais.

---

## 1. VISÃO GERAL DO FLUXO

```
[FILIAL (Sombrear DF)]
  → Cadastra condomínio + vagas vendidas
  → Sistema calcula peças automaticamente
  → Engenheiro revisa/edita quantidades
  → Preenche diretrizes (cor estrutura, tela, chumbação)
  → Envia pedido para a SEDE

[SEDE (Sombrear Indústria — Goiânia)]
  → Recebe pedido com notificação
  → Analisa e aprova (ou devolve com obs.)
  → Atualiza status: Em Fabricação → Pronto para Envio → Entregue
  → Gera Ordem de Serviço da Indústria (PDF)

[FILIAL]
  → Acompanha status em tempo real
  → Confirma recebimento → ciclo encerrado

[DASHBOARD / RELATÓRIOS]
  → Sede: visão geral de todas filiais, KPIs, valores
  → Filial: seus próprios pedidos e histórico
```

---

## 2. PERFIS DE USUÁRIO

| Perfil | Quem | O que pode fazer |
|--------|------|-----------------|
| **SEDE** (admin master) | Sombrear Indústria — Goiânia | Criar/gerenciar filiais, aprovar pedidos, atualizar status, dashboard completo, relatórios |
| **FILIAL** | Sombrear DF (e futuras filiais) | Criar pedidos, acompanhar status, relatórios da própria filial |
| **MONTAGEM LOCAL** | Equipe de montagem | Fazer pedido de peças avulsas à Sede (fluxo simplificado) |

---

## 3. TECH STACK RECOMENDADO

### Por que essa escolha?
O sistema precisa de: autenticação multiusuário, banco de dados persistente, tempo real (status) e custo zero para começar.

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| **Frontend** | HTML + CSS + Vanilla JS (igual à calculadora) | Sem curva de aprendizado, abre no browser |
| **Backend / Banco** | **Supabase** (gratuito) | PostgreSQL + Auth + Realtime + Storage — tudo num só lugar |
| **Hospedagem** | **Vercel** (já configurado) | Deploy automático pelo GitHub |
| **PDF** | `window.print()` (já funcionando) | Confiável, sem CDN |

### Supabase — o que oferece gratuitamente:
- Banco PostgreSQL
- Autenticação (email/senha, por perfil)
- Atualizações em tempo real (status do pedido muda sem refresh)
- 500MB storage (para logos, documentos)
- 50.000 usuários ativos/mês

---

## 4. ESTRUTURA DE PÁGINAS

### 4.1 Telas Públicas
- `/` → Tela de Login (logo Sombrear, verde #9ACD32)

### 4.2 Telas da FILIAL
| Página | Descrição |
|--------|-----------|
| `/filial/dashboard` | Cards: pedidos ativos, em fabricação, entregues, vagas vendidas no mês |
| `/filial/novo-pedido` | Fluxo em 4 etapas (wizard) |
| `/filial/pedidos` | Lista de todos os pedidos com status e filtros |
| `/filial/pedido/:id` | Detalhe do pedido + timeline de status |
| `/filial/relatorios` | Gráficos mensais/anuais |

### 4.3 Telas da SEDE
| Página | Descrição |
|--------|-----------|
| `/sede/dashboard` | KPIs de todas as filiais: volume, valor, peças produzidas |
| `/sede/pedidos` | Fila de pedidos pendentes de aprovação |
| `/sede/pedido/:id` | Aprovação, edição, atualização de status, PDF da O.S. |
| `/sede/filiais` | Gerenciar perfis de filiais (criar, ativar, desativar) |
| `/sede/relatorios` | Relatórios consolidados: mês a mês, por tipo (sombrite/telha), por filial |
| `/sede/catalogo` | Gerenciar catálogo de peças e preços |

---

## 5. FLUXO DO NOVO PEDIDO (Wizard em 4 Etapas)

### Etapa 1 — Dados do Cliente
- Nome do Condomínio
- Endereço completo (Rua, número, cidade/UF)
- CNPJ
- Telefone de contato
- Nome do Síndico Responsável
- E-mail

### Etapa 2 — Tipo de Cobertura e Dimensionamento
Selecionar tipo:
- **Sombrite** (cálculo automático pelos módulos MA/MT, já implementado)
- **Telha em Solo**
- **Telha em Laje**

Campos de entrada:
- Quantidade de vagas
- Alinhamentos (ou "Sem parâmetro")
- Módulos 2V/3V MA e MT (para sombrite)

O sistema calcula automaticamente e preenche a tabela de peças.

### Etapa 3 — Diretrizes Técnicas (seleção no app)

**Informações Importantes (4 campos obrigatórios):**

| Campo | Opções |
|-------|--------|
| Cor da Estrutura | Estrutura Branca / Estrutura Preta / Cor Especial (descrever) |
| Cor da Tela | Tela Verde / Tela Prata / Tela Azul / Tela Vermelha / Tela Bege / Cor Especial (descrever) |
| Tipo de Chumbação | Chumbação em Laje / Chumbação Direta em Solo / Chumbação por Chumbador |
| Pilares | Padrão / Pilares com Chapa |

### Etapa 4 — Revisão e Confirmação da Ficha de Fabricação

**Tabela editável de peças** (todos os valores calculados podem ser ajustados):

| Descrição Item | Medida A | Medida B | Medida C | Unidade | Qtde |
|----------------|----------|----------|----------|---------|------|
| Chumbador para Pilar MA | — | — | — | PÇ | auto |
| Pilar Sombrite MA | auto | 0,00 | 0,00 | PÇ | auto |
| Pilar Sombrite MT | auto | 0,00 | 0,00 | PÇ | auto |
| Braço Sombrite Simples | auto | 0,00 | 0,00 | PÇ | auto |
| Arcos de 1VG | 1,20 | 0,00 | 0,00 | PÇ | auto |
| Arcos de 2VG | 1,50 | 0,00 | 0,00 | PÇ | auto |
| Arcos de 3VG | 1,80 | 0,00 | 0,00 | PÇ | auto |
| Estrela 1VG | 1,20 | 0,00 | 0,00 | PÇ | auto |
| Estrela 2VG | 1,50 | 0,00 | 0,00 | PÇ | auto |
| Estrela 3VG | 1,80 | 0,00 | 0,00 | PÇ | auto |
| Tela Completa Sombrite 1VG | auto | auto | 0,00 | UNID | auto |
| Tela Completa Sombrite 2VG | auto | auto | 0,00 | UNID | auto |
| Tela Completa Sombrite 3VG | auto | auto | 0,00 | UNID | auto |
| Tela Completa Sombrite 4VG | auto | auto | 0,00 | UNID | auto |
| Tela Completa Sombrite Tam Especial | — | — | — | M² | — |
| Pilar Liso | auto | 0,00 | 0,00 | PÇ | — |
| Braço PVC *(telha)* | — | — | — | PÇ | — |
| Braço PVC Painel Solar | — | — | — | PÇ | — |
| Base PVC *(telha)* | — | — | — | PÇ | — |
| Base PVC Painel Solar | — | — | — | PÇ | — |
| Terças para Telha Galvalume | auto | 0,00 | 0,00 | PÇ | — |
| Terças para Telha Isotérmica | auto | 0,00 | 0,00 | PÇ | — |
| Terças para Painel Solar | auto | 0,00 | 0,00 | PÇ | — |
| Suporte Duplo para Bicicletas | 0,00 | 0,00 | 0,00 | UNID | — |
| Deixar em Branco (Editável) | — | — | — | INS UNID | — |

**Prazo Previsto para Entrega (selecionável por grupo):**

| Grupo | Prazo padrão | Opções |
|-------|-------------|--------|
| Conjunto de Fundação | 10 dias | 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90 |
| Conjunto de Braços | 15 dias | idem |
| Conjunto de Arcos + Estrelas | 25 dias | idem |
| Conjunto de Telas | 30 dias | idem |
| Conjunto de Terças | 35 dias | idem |
| Conjunto de Acabamentos | 35 dias | idem |
| Peças Especiais | 60 dias | idem + DA DATA DO PAGAMENTO |

Botão: **Enviar Pedido para a Sede**

---

## 6. STATUS DO PEDIDO (Timeline)

```
RASCUNHO → AGUARDANDO APROVAÇÃO → APROVADO → EM FABRICAÇÃO
  → PRONTO PARA ENVIO → EM TRÂNSITO → ENTREGUE (ciclo encerrado)
```

Cada mudança de status gera:
- Notificação visual no dashboard da filial
- Registro de data/hora + usuário que alterou

---

## 7. PDF GERADO PELO SISTEMA

### 7.1 Pedido de Materiais (gerado pela Filial ao enviar)
- Cabeçalho: "Pedido de Materiais Sombrear Indústria" | "Sombrear Coberturas Inteligentes DF"
- Dados do cliente (nome, endereço, CNPJ, contato, síndico, e-mail)
- Objeto do Pedido (ex: "Insumos industrializados para 200 vagas em Sombrite")
- Composição do Pedido: tabela com descrição, unidade, qtde, VL Unit, Sub Total, Total do Pedido
- Ficha Técnica para Produção: texto padrão + Informações Importantes (4 diretrizes escolhidas)
- Prazo previsto por grupo
- Assinaturas: Sombrear Indústria | Sombrear DF

### 7.2 Ordem de Serviço (gerada pela Sede ao aprovar)
- Ficha de Fabricação: tabela com Descrição, Medida A, B, C, Unidade, Qtde
- Todos os campos das diretrizes técnicas
- Assinaturas

---

## 8. DASHBOARD E RELATÓRIOS

### Dashboard Filial
- Cards: Pedidos Abertos | Em Fabricação | Prontos para Envio | Entregues este mês
- Gráfico de barras: Vagas vendidas mês a mês (Sombrite vs Telha)
- Lista dos últimos pedidos com status colorido

### Dashboard Sede
- Total de pedidos por status (todas as filiais)
- Vagas vendidas total mês/ano
- Valor total dos pedidos (R$)
- Ranking de filiais por volume
- Peças mais produzidas (top 5)
- Gráfico de linha: evolução mensal

### Relatórios
- **Mensal/Anual:** Pedidos por período, por filial, por tipo
- **Por tipo de cobertura:** Sombrite vs Telha em Solo vs Telha em Laje
- **Por peça:** Quantas unidades de cada peça foram fabricadas
- **Financeiro:** Valor total por filial, por mês

---

## 9. BANCO DE DADOS (Supabase — PostgreSQL)

```sql
-- Usuários e perfis
profiles (id, email, role: 'sede'|'filial'|'montagem', filial_id, nome, ativo)
filiais (id, nome, cidade, cnpj, telefone, email, ativo)

-- Catálogo de peças
pecas (id, codigo, descricao, unidade, preco_unitario, categoria, ativo)

-- Pedidos
pedidos (id, filial_id, status, tipo_cobertura, qtd_vagas,
         cliente_nome, cliente_cnpj, cliente_endereco,
         cliente_contato, cliente_sindico, cliente_email,
         cor_estrutura, cor_tela, tipo_chumbacao, obs_tecnicas,
         valor_total, created_at, updated_at)

-- Itens do pedido
pedido_itens (id, pedido_id, peca_id, descricao_livre,
              medida_a, medida_b, medida_c,
              unidade, quantidade, valor_unitario, subtotal)

-- Prazos do pedido
pedido_prazos (id, pedido_id, grupo, prazo_dias, referencia_data)

-- Histórico de status
pedido_status_log (id, pedido_id, status_anterior, status_novo,
                   usuario_id, observacao, created_at)
```

---

## 10. FASES DE DESENVOLVIMENTO

### Fase 1 — MVP (2-3 semanas) ✅ PRIORIDADE
- [ ] Tela de login com dois perfis (Sede / Filial)
- [ ] Cadastro de novo pedido (wizard 4 etapas)
- [ ] Ficha de fabricação editável com cálculo automático (Sombrite)
- [ ] Envio do pedido para a Sede
- [ ] Aprovação e controle de status pela Sede
- [ ] PDF do pedido e da O.S.
- [ ] Dashboard básico (filial + sede)

### Fase 2 — Expansão (após validar MVP)
- [ ] Tipos: Telha em Solo e Telha em Laje
- [ ] Notificações em tempo real (Supabase Realtime)
- [ ] Relatórios completos
- [ ] Módulo Montagem Local
- [ ] Gestão de filiais pela Sede

### Fase 3 — Integrações
- [ ] Integrar calculadora_sombrear.html como módulo interno
- [ ] Exportação Excel dos relatórios
- [ ] Histórico de preços

---

## 11. IDENTIDADE VISUAL

Seguir manual da Sombrear:
- **Verde Principal:** `#9ACD32`
- **Verde Escuro:** `#6FAE2E`
- **Cinza Texto:** `#5A5A5A`
- **Fundo:** `#FFFFFF` / `#F3F3F3`
- **Tipografia:** Poppins (títulos) + Arial/Calibri (tabelas)
- Logo: `logo.png` já disponível

---

## 12. PRÓXIMO PASSO IMEDIATO

Construir o **App Web completo (Fase 1)** usando:
- `index.html` como entry point com roteamento via hash (`#/filial/dashboard`)
- `app.js` com toda a lógica de estado e navegação
- Supabase JS SDK (CDN) para auth + banco
- CSS modular seguindo identidade visual Sombrear

**Aguardando confirmação para iniciar o desenvolvimento.**
