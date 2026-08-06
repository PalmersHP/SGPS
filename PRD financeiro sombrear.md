# PRD — SISTEMA FINANCEIRO SOMBREAR

## 1. Identificação do Produto

**Nome do produto:** Sistema Financeiro Sombrear
**Empresa:** Sombrear / Manzzano
**Tipo de sistema:** ERP financeiro interno
**Área principal:** Gestão financeira, contas a pagar, contas a receber, compras, RH, produtividade, comissões, impostos, DRE e fluxo de caixa
**Usuários principais:** Diretoria, financeiro, vendedores, compras, RH/produção e administradores
**Versão do PRD:** 1.0

---

## 2. Objetivo do Produto

Desenvolver um sistema financeiro interno para a Sombrear capaz de controlar toda a jornada financeira da empresa, desde a venda de coberturas para condomínios até o recebimento, validação, pagamento de despesas, geração de OP, controle de compras, comissões, impostos, mão de obra, produtividade, DRE, fluxo de caixa e relatórios gerenciais.

O sistema deverá permitir que cada condomínio, cliente ou venda relevante seja controlado como um **Projeto**, centralizando dentro dele receitas, despesas, notas fiscais, impostos, compras, mão de obra, comissões, documentos e relatórios financeiros.

---

## 3. Contexto Operacional

A Sombrear atua com soluções de cobertura para condomínios e clientes menores, incluindo:

* Sombrite;
* Telha Galvalume;
* Telha Isotérmica;
* Carport Solar;
* Manutenções preventivas e corretivas;
* Vendas menores de varejo para pessoa física ou jurídica.

A empresa também utiliza a prática de **plantões de vendas em condomínios**, nos quais moradores realizam pagamentos diretamente para a empresa, geralmente por PIX, cartão, dinheiro ou link de pagamento. Esses valores são posteriormente abatidos do valor final do contrato/aditivo do condomínio.

O sistema precisa refletir essa operação real, permitindo lançamentos por condomínio, unidade, apartamento, bloco, vaga e morador.

---

## 4. Escopo Geral

O sistema deverá contemplar os seguintes módulos:

1. Dashboard financeiro;
2. Projetos / Condomínios;
3. Plantão de Vendas;
4. Contas a Receber;
5. Contas a Pagar;
6. Ordem de Pagamento — OP;
7. Compras e Cotações;
8. RH / Mão de Obra / Produtividade;
9. Comissões;
10. Notas Fiscais e Impostos;
11. Categorias Financeiras e Centros de Custo;
12. DRE Gerencial;
13. Fluxo de Caixa;
14. Relatórios;
15. Cadastros;
16. Usuários e Permissões;
17. Auditoria e Histórico.

---

## 5. Fora do Escopo da Primeira Versão

A primeira versão **não** deverá contemplar:

* controle completo de estoque;
* integração bancária automática;
* emissão automática de nota fiscal;
* cobrança automática de inadimplentes;
* integração direta com sistemas fiscais externos;
* conciliação bancária automática;
* aplicativo mobile nativo.

Observação: o sistema deve ser responsivo para uso em celular, especialmente no módulo de Plantão de Vendas.

---

## 6. Perfis de Usuário

## 6.1. Administrador

Usuário com acesso total.

Permissões:

* gerenciar usuários;
* gerenciar permissões;
* cadastrar empresas;
* cadastrar contas bancárias;
* cadastrar projetos;
* acessar todos os módulos;
* editar lançamentos;
* cancelar lançamentos;
* visualizar relatórios;
* configurar categorias e centros de custo;
* acessar logs de auditoria.

## 6.2. Financeiro

Usuário operacional principal do sistema.

Permissões:

* cadastrar projetos;
* lançar contas a pagar;
* lançar contas a receber;
* validar recebimentos de plantão;
* gerar OP;
* marcar pagamento como pago;
* marcar recebimento como recebido;
* anexar notas fiscais;
* provisionar impostos;
* aprovar compras;
* gerar relatórios financeiros;
* cadastrar fornecedores;
* cadastrar clientes/moradores;
* cadastrar vendedores;
* cadastrar funcionários/PJs;
* exportar relatórios.

## 6.3. Diretoria / Wilson

Usuário de visualização gerencial.

Permissões:

* visualizar dashboard;
* visualizar contas a pagar;
* visualizar contas a receber;
* visualizar OPs;
* visualizar relatórios;
* visualizar DRE;
* visualizar fluxo de caixa;
* visualizar compras aprovadas e pendentes;
* visualizar pagamentos do dia, semana, quinzena, mês, trimestre, semestre e ano.

Observação: a baixa operacional dos pagamentos será feita pelo financeiro. A OP impressa servirá como validação física e controle interno para o Wilson.

## 6.4. Vendedor de Plantão

Usuário com acesso extremamente restrito.

Permissões:

* acessar somente o módulo Plantão de Vendas;
* visualizar apenas os plantões/projetos aos quais foi vinculado;
* lançar recebimentos de moradores;
* anexar comprovantes;
* visualizar status dos próprios lançamentos;
* corrigir lançamentos devolvidos pelo financeiro.

Restrições:

* não pode acessar contas a pagar;
* não pode acessar DRE;
* não pode acessar banco;
* não pode acessar despesas;
* não pode acessar fornecedores;
* não pode acessar RH;
* não pode acessar relatórios gerenciais;
* não pode visualizar lançamentos de outros vendedores, salvo permissão específica.

## 6.5. Compras

Permissões:

* criar solicitação de compra;
* lançar cotações;
* anexar propostas/orçamentos;
* selecionar cotação recomendada;
* enviar para aprovação do financeiro;
* visualizar status das compras solicitadas.

## 6.6. RH / Produção

Permissões:

* cadastrar ou visualizar trabalhadores, conforme permissão;
* lançar produtividade;
* lançar vales/adiantamentos, se autorizado;
* visualizar relatório de mão de obra;
* enviar valores para validação financeira.

---

## 7. Estrutura de Navegação

## 7.1. Menu superior principal

O sistema deverá ter menu superior com as seguintes abas:

1. Dashboard;
2. Contas a Receber;
3. Contas a Pagar;
4. Plantão de Vendas;
5. Compras;
6. RH / Mão de Obra;
7. Relatórios;
8. Cadastros;
9. Configurações.

## 7.2. Menu lateral dentro de Cadastros

* Empresas;
* Contas Bancárias;
* Projetos / Condomínios;
* Clientes / Moradores;
* Síndicos / Responsáveis;
* Vendedores;
* Funcionários CLT;
* Trabalhadores PJ;
* Fornecedores;
* Categorias Financeiras;
* Centros de Custo;
* Formas de Pagamento;
* Tipos de Cobertura;
* Tipos de Produtividade;
* Usuários e Permissões.

---

## 8. Módulo: Empresas

## 8.1. Objetivo

Permitir o cadastro e controle das empresas utilizadas pela operação financeira.

Empresas iniciais:

* Sombrear;
* Manzzano.

## 8.2. Campos

* ID;
* razão social;
* nome fantasia;
* CNPJ;
* inscrição estadual;
* inscrição municipal;
* endereço;
* cidade;
* estado;
* CEP;
* e-mail financeiro;
* telefone;
* regime tributário;
* status: ativa/inativa;
* observações;
* data de criação;
* data de atualização.

## 8.3. Regras

* Todo lançamento financeiro deve estar vinculado a uma empresa.
* Toda conta bancária deve estar vinculada a uma empresa.
* Projetos devem ter uma empresa responsável.

---

## 9. Módulo: Contas Bancárias

## 9.1. Objetivo

Cadastrar as contas bancárias utilizadas para entradas e saídas financeiras.

## 9.2. Campos

* ID;
* empresa vinculada;
* banco;
* agência;
* conta;
* tipo de conta;
* titular;
* CPF/CNPJ do titular;
* chave PIX;
* saldo inicial;
* status: ativa/inativa;
* observações.

## 9.3. Regras

* Recebimentos devem informar a conta bancária de entrada após validação.
* Pagamentos devem informar a conta bancária de saída.
* Relatórios devem permitir filtro por conta bancária.
* Fluxo de caixa deve permitir visão por conta bancária.

---

## 10. Módulo: Projetos / Condomínios

## 10.1. Objetivo

Controlar cada condomínio, obra, contrato, venda de varejo ou projeto interno como um centro de organização financeira.

## 10.2. Tipos de Projeto

* Condomínio — Sombrite;
* Condomínio — Telha Galvalume;
* Condomínio — Telha Isotérmica;
* Condomínio — Carport Solar;
* Condomínio — Manutenção;
* Varejo — Pessoa Física;
* Varejo — Pessoa Jurídica;
* Administrativo Geral;
* Comercial Geral;
* Produção Geral;
* Frota Geral;
* Marketing Geral.

## 10.3. Campos

* ID;
* nome do projeto;
* tipo de projeto;
* empresa responsável;
* cliente principal;
* CNPJ/CPF do cliente principal;
* síndico/responsável;
* telefone;
* e-mail;
* endereço da obra;
* cidade;
* estado;
* vendedor responsável;
* percentual de comissão;
* valor contratado;
* valor recebido por plantão;
* saldo após plantão;
* forma de recebimento principal;
* data de início;
* data prevista de término;
* status;
* observações;
* anexos.

## 10.4. Status

* Pré-cadastro;
* Em negociação;
* Contratado;
* Em plantão de vendas;
* Em execução;
* Em recebimento;
* Concluído;
* Suspenso;
* Cancelado.

## 10.5. Pasta do Projeto

Cada projeto deverá possuir uma tela própria contendo:

* dados gerais;
* contrato/aditivos;
* recebimentos;
* despesas;
* plantões;
* notas fiscais;
* impostos;
* compras;
* mão de obra;
* produtividade;
* comissões;
* DRE do projeto;
* fluxo de caixa do projeto;
* anexos.

---

## 11. Módulo: Plantão de Vendas

## 11.1. Objetivo

Permitir que vendedores cadastrem recebimentos realizados em plantões de venda diretamente dentro do sistema, com validação posterior pelo financeiro.

O lançamento feito pelo vendedor deve gerar automaticamente um item no Contas a Receber com status **Pendente de Validação**.

## 11.2. Cadastro do Plantão

Criado pelo financeiro ou administrador.

Campos:

* ID;
* projeto/condomínio;
* empresa responsável;
* data do plantão;
* vendedor responsável;
* produto vendido;
* valor de referência por vaga;
* meta de vagas;
* observações comerciais;
* status: ativo/encerrado/cancelado;
* data de criação.

## 11.3. Tela do Vendedor

A tela do vendedor deve ser simples, responsiva e rápida para uso em celular.

Elementos:

* seleção do plantão ativo;
* nome do condomínio já marcado quando o vendedor estiver vinculado a apenas um plantão;
* formulário de novo recebimento;
* lista dos lançamentos feitos pelo vendedor;
* status de cada lançamento;
* opção de editar apenas lançamentos em rascunho ou devolvidos para correção.

## 11.4. Formulário de Recebimento do Plantão

Campos obrigatórios:

* nome do cliente/morador;
* CPF;
* valor pago;
* forma de pagamento;
* apartamento;
* bloco;
* número da vaga;
* condomínio/projeto;
* data do pagamento;
* descrição/observação.

Campos recomendados:

* telefone do morador;
* e-mail;
* bonificação;
* desconto;
* valor do desconto;
* observação interna;
* comprovante em anexo.

## 11.5. Formas de Pagamento

Opções:

* PIX;
* dinheiro;
* cartão de crédito;
* cartão de débito;
* dois cartões;
* link de pagamento;
* boleto;
* transferência;
* outro.

## 11.6. Campos Condicionais

### PIX

* chave PIX utilizada;
* banco de destino, se conhecido;
* anexo do comprovante.

### Dinheiro

* nome de quem recebeu;
* observação obrigatória;
* confirmação posterior pelo financeiro.

### Cartão

* tipo de cartão;
* bandeira;
* quantidade de parcelas;
* código de autorização;
* comprovante.

### Dois cartões

* valor cartão 1;
* bandeira cartão 1;
* parcelas cartão 1;
* valor cartão 2;
* bandeira cartão 2;
* parcelas cartão 2;
* comprovantes.

### Link de Pagamento

* campo para colar link;
* status do link: enviado/pago/expirado/cancelado.

## 11.7. Status do Lançamento de Plantão

* Rascunho;
* Enviado para validação;
* Pendente de correção;
* Validado;
* Recusado;
* Cancelado.

## 11.8. Fluxo Funcional

1. Financeiro cria o plantão e vincula o vendedor.
2. Vendedor acessa o módulo Plantão de Vendas.
3. Sistema exibe apenas o condomínio/projeto vinculado ao vendedor.
4. Vendedor cadastra dados do morador, unidade, vaga, valor e forma de pagamento.
5. Vendedor envia o lançamento.
6. Sistema cria um recebível no Contas a Receber com status Pendente de Validação.
7. Financeiro valida o recebimento.
8. Se validado, o recebível passa para Recebido ou Em Aberto, conforme forma de pagamento.
9. Se houver erro, o financeiro devolve para correção ou recusa.
10. No fechamento, o sistema gera relatório do plantão.

## 11.9. Validação pelo Financeiro

O financeiro deverá poder:

* visualizar todos os lançamentos pendentes;
* filtrar por projeto, vendedor, data e forma de pagamento;
* conferir comprovantes;
* corrigir dados;
* validar;
* recusar;
* devolver para correção;
* marcar como recebido.

## 11.10. Relatório de Fechamento do Plantão

Campos:

* projeto/condomínio;
* data do plantão;
* vendedor;
* quantidade de moradores participantes;
* quantidade de vagas vendidas;
* valor total bruto lançado;
* valor validado;
* valor pendente;
* valor recusado;
* total por forma de pagamento;
* descontos concedidos;
* bonificações;
* lista de apartamentos/blocos/vagas;
* resumo para abatimento do contrato/aditivo.

---

## 12. Módulo: Contas a Receber

## 12.1. Objetivo

Controlar todos os valores que a Sombrear e a Manzzano têm a receber.

## 12.2. Origem dos Recebíveis

* Contrato principal;
* Aditivo contratual;
* Plantão de vendas;
* Financiamento bancário;
* Parcelamento próprio;
* Medição por etapa;
* Entrada;
* Entrega de etapa;
* Venda de varejo;
* Manutenção;
* Outros.

## 12.3. Campos

* ID;
* empresa recebedora;
* projeto;
* cliente principal;
* cliente final/morador;
* CPF/CNPJ;
* apartamento;
* bloco;
* vaga;
* origem;
* vendedor vinculado;
* valor bruto;
* desconto;
* valor líquido previsto;
* forma de pagamento;
* data de vencimento;
* data prevista de recebimento;
* data efetiva de recebimento;
* conta bancária de entrada;
* status;
* nota fiscal vinculada;
* anexos;
* observações;
* criado por;
* validado por;
* data de validação.

## 12.4. Status

* Previsto;
* Pendente de validação;
* Em aberto;
* Parcialmente recebido;
* Recebido;
* Vencido;
* Cancelado;
* Recusado.

## 12.5. Requisitos Funcionais

**RF-CR-001** — O sistema deve permitir criar recebíveis manualmente.
**RF-CR-002** — O sistema deve permitir criar recebíveis automaticamente a partir do Plantão de Vendas.
**RF-CR-003** — O sistema deve permitir filtrar recebíveis por status.
**RF-CR-004** — O sistema deve permitir filtrar recebíveis por projeto.
**RF-CR-005** — O sistema deve permitir filtrar recebíveis por empresa.
**RF-CR-006** — O sistema deve permitir filtrar recebíveis por vendedor.
**RF-CR-007** — O sistema deve permitir baixa total ou parcial de recebimento.
**RF-CR-008** — O sistema deve exigir conta bancária de entrada ao marcar como recebido.
**RF-CR-009** — O sistema deve permitir anexar comprovante.
**RF-CR-010** — O sistema deve permitir anexar nota fiscal manualmente.
**RF-CR-011** — O sistema deve permitir provisionar impostos a partir de nota fiscal.
**RF-CR-012** — O sistema deve registrar histórico de alterações.

---

## 13. Módulo: Notas Fiscais e Impostos

## 13.1. Objetivo

Permitir o lançamento manual de notas fiscais e o provisionamento dos impostos correspondentes.

## 13.2. Campos da Nota Fiscal

* ID;
* número da nota;
* empresa emissora;
* projeto;
* cliente;
* valor da nota;
* data de emissão;
* data de recebimento relacionada;
* descrição do serviço/material faturado;
* arquivo anexo;
* observações.

## 13.3. Descrição da Nota

O sistema deve permitir descrever o que está sendo faturado, por exemplo:

* fabricação de pés para chumbamento;
* etapa de fundação;
* montagem dos braços;
* instalação de arcos e estrelas;
* instalação de tela;
* entrega parcial;
* manutenção;
* venda avulsa.

## 13.4. Campos do Imposto Provisionado

* ID;
* nota fiscal vinculada;
* empresa;
* projeto;
* tipo de imposto;
* percentual manual;
* valor calculado;
* vencimento;
* categoria financeira;
* status;
* lançamento de contas a pagar vinculado.

## 13.5. Requisitos Funcionais

**RF-NF-001** — O sistema deve permitir cadastrar nota fiscal manualmente.
**RF-NF-002** — O sistema deve permitir anexar arquivo da nota.
**RF-NF-003** — O sistema deve permitir informar descrição da etapa faturada.
**RF-NF-004** — O sistema deve permitir lançar percentual manual de imposto.
**RF-NF-005** — O sistema deve calcular automaticamente o valor do imposto.
**RF-NF-006** — O sistema deve gerar contas a pagar para imposto provisionado.
**RF-NF-007** — O sistema deve permitir relatórios de impostos pagos e a pagar.

---

## 14. Módulo: Contas a Pagar

## 14.1. Objetivo

Controlar todas as despesas, pagamentos e obrigações da empresa.

## 14.2. Tipos de Despesas

* administrativas;
* mão de obra;
* materiais;
* matéria-prima;
* material de consumo;
* alimentação;
* veículos;
* combustível;
* logística;
* fretes;
* correções em obras;
* serviços de terceiros;
* bonificações;
* impostos;
* parcelamentos;
* despesas fixas;
* investimentos;
* retirada de sócios.

## 14.3. Campos

* ID;
* empresa pagadora;
* projeto;
* centro de custo;
* fornecedor/favorecido;
* categoria mãe;
* categoria filha;
* descrição;
* valor;
* data de competência;
* data de vencimento;
* forma de pagamento;
* conta bancária prevista para saída;
* status;
* recorrência;
* número de parcelas;
* parcela atual;
* anexos;
* observações;
* OP vinculada;
* criado por;
* pago por;
* data de pagamento;
* comprovante de pagamento.

## 14.4. Status

* Em aberto;
* Aguardando aprovação;
* OP gerada;
* Aprovado para pagamento;
* Pago;
* Vencido;
* Cancelado.

## 14.5. Fluxo

1. Financeiro lança despesa.
2. Sistema classifica por empresa, projeto, categoria e vencimento.
3. Financeiro gera OP.
4. OP é impressa para validação física.
5. Wilson realiza pagamento no banco.
6. Financeiro marca como pago.
7. Financeiro informa conta bancária de saída.
8. Financeiro anexa comprovante.
9. Sistema dá baixa.

## 14.6. Requisitos Funcionais

**RF-CP-001** — O sistema deve permitir criar despesa manualmente.
**RF-CP-002** — O sistema deve exigir empresa pagadora.
**RF-CP-003** — O sistema deve exigir categoria mãe.
**RF-CP-004** — O sistema deve permitir vincular projeto específico ou projeto geral.
**RF-CP-005** — O sistema deve permitir selecionar conta bancária de saída.
**RF-CP-006** — O sistema deve permitir anexar boleto, nota, recibo ou contrato.
**RF-CP-007** — O sistema deve permitir gerar OP.
**RF-CP-008** — O sistema deve permitir marcar como pago.
**RF-CP-009** — O sistema deve exigir comprovante ao marcar como pago, salvo permissão de exceção.
**RF-CP-010** — O sistema deve permitir filtros por status: aberto, pago, vencido e todos.
**RF-CP-011** — O sistema deve permitir criação de parcelas.
**RF-CP-012** — O sistema deve preservar histórico de alterações.

---

## 15. Módulo: Ordem de Pagamento — OP

## 15.1. Objetivo

Gerar documento físico para validação e controle interno dos pagamentos.

## 15.2. Campos da OP

* ID;
* número sequencial;
* data de emissão;
* empresa pagadora;
* conta bancária de saída;
* favorecido;
* CPF/CNPJ do favorecido;
* dados bancários do favorecido;
* projeto;
* categoria mãe;
* categoria filha;
* centro de custo;
* descrição da despesa;
* valor;
* vencimento;
* forma de pagamento;
* responsável pelo lançamento;
* campo de autorização;
* campo de assinatura;
* observações;
* status.

## 15.3. Status

* Gerada;
* Impressa;
* Paga;
* Cancelada.

## 15.4. Requisitos Funcionais

**RF-OP-001** — O sistema deve gerar OP a partir de uma despesa.
**RF-OP-002** — A OP deve possuir numeração única.
**RF-OP-003** — A OP deve ser exportável/imprimível em PDF.
**RF-OP-004** — A OP deve estar vinculada ao lançamento de contas a pagar.
**RF-OP-005** — A OP deve alterar status quando o pagamento for baixado.
**RF-OP-006** — O sistema deve manter histórico da OP.

---

## 16. Módulo: Compras e Cotações

## 16.1. Objetivo

Controlar solicitações de compras de produtos e serviços, exigindo três cotações e integrando a compra aprovada ao Contas a Pagar.

## 16.2. Solicitação de Compra

Campos:

* ID;
* solicitante;
* empresa;
* projeto;
* centro de custo;
* produto/serviço;
* quantidade;
* unidade de medida;
* descrição técnica;
* urgência;
* data de necessidade;
* observações;
* anexos;
* status.

## 16.3. Cotação

Campos:

* ID;
* solicitação de compra;
* fornecedor;
* valor unitário;
* valor total;
* prazo de entrega;
* condição de pagamento;
* quantidade de parcelas;
* vencimentos;
* validade da proposta;
* frete incluso;
* observações;
* anexo do orçamento;
* status.

## 16.4. Escolha da Cotação

O usuário poderá escolher a cotação vencedora mesmo que não seja a mais barata.

Justificativas possíveis:

* menor preço;
* melhor prazo;
* melhor qualidade;
* fornecedor estratégico;
* melhor custo-benefício;
* disponibilidade imediata;
* outro motivo.

## 16.5. Aprovação

A aprovação será feita pelo financeiro.

Status:

* Em solicitação;
* Em cotação;
* Aguardando aprovação;
* Aprovada;
* Reprovada;
* Comprada;
* Cancelada.

## 16.6. Integração com Contas a Pagar

Após aprovação, o sistema deverá gerar um ou mais lançamentos no Contas a Pagar, conforme número de parcelas e vencimentos informados.

## 16.7. Requisitos Funcionais

**RF-COM-001** — O sistema deve permitir criar solicitação de compra.
**RF-COM-002** — O sistema deve permitir cadastrar três cotações.
**RF-COM-003** — O sistema deve permitir anexar propostas.
**RF-COM-004** — O sistema deve permitir escolher cotação vencedora.
**RF-COM-005** — O sistema deve exigir justificativa da escolha.
**RF-COM-006** — O sistema deve permitir aprovação pelo financeiro.
**RF-COM-007** — O sistema deve gerar contas a pagar após aprovação.
**RF-COM-008** — O sistema deve respeitar parcelas e vencimentos da cotação aprovada.
**RF-COM-009** — O sistema deve permitir relatório de compras por fornecedor.

---

## 17. Módulo: RH / Mão de Obra / Produtividade

## 17.1. Objetivo

Controlar funcionários CLT, trabalhadores PJ, diaristas, representantes, terceirizados, produtividade, vales, adiantamentos e despesas vinculadas.

## 17.2. Tipos de Trabalhadores

* Funcionário CLT da indústria;
* Trabalhador PJ da montagem/execução;
* Diarista;
* Representante comercial;
* Terceirizado;
* Prestador eventual.

## 17.3. Cadastro de Trabalhador

Campos:

* ID;
* nome;
* CPF/CNPJ;
* tipo de vínculo;
* função;
* empresa vinculada;
* telefone;
* e-mail;
* dados bancários;
* salário fixo;
* regra de produtividade padrão;
* status;
* observações;
* anexos.

## 17.4. Verbas e Despesas

O sistema deve controlar:

* salário fixo;
* produtividade;
* adiantamentos;
* vales;
* vale transporte;
* vale alimentação;
* vale refeição;
* combustível;
* INSS;
* FGTS;
* assiduidade;
* bônus;
* EPI;
* gratificação;
* horas extras;
* rescisões;
* descontos;
* outros.

## 17.5. Produtividade

Opções de lançamento:

* m²;
* vaga;
* módulo;
* diária;
* etapa concluída;
* valor fixo por medição;
* regra manual.

Campos:

* trabalhador;
* projeto;
* tipo de produtividade;
* quantidade;
* valor unitário;
* valor total;
* período de referência;
* etapa executada;
* observação;
* status.

## 17.6. Integração com Contas a Pagar

Valores aprovados devem gerar despesa no Contas a Pagar.

## 17.7. Requisitos Funcionais

**RF-RH-001** — O sistema deve permitir cadastrar trabalhador.
**RF-RH-002** — O sistema deve permitir classificar tipo de vínculo.
**RF-RH-003** — O sistema deve permitir lançar produtividade por diferentes critérios.
**RF-RH-004** — O sistema deve permitir lançar vales e adiantamentos.
**RF-RH-005** — O sistema deve gerar relatório de valor a receber por trabalhador.
**RF-RH-006** — O sistema deve permitir vincular produtividade a projeto.
**RF-RH-007** — O sistema deve gerar contas a pagar após aprovação dos valores.

---

## 18. Módulo: Comissões

## 18.1. Objetivo

Controlar comissão de vendedores internos e externos sobre o valor bruto recebido.

## 18.2. Cadastro de Vendedor

Campos:

* ID;
* nome;
* CPF/CNPJ;
* tipo: interno, externo, síndico, advogado, parceiro, representante;
* telefone;
* e-mail;
* dados bancários;
* percentual padrão;
* status;
* observações.

## 18.3. Comissão por Projeto

Campos:

* projeto;
* vendedor;
* percentual;
* regra específica;
* observação.

## 18.4. Regra de Cálculo

* Base da comissão: valor bruto recebido.
* Pagamento: mês seguinte ao recebimento pela empresa.
* Comissão só é gerada sobre recebimento validado.

## 18.5. Status

* Provisionada;
* A pagar;
* Paga;
* Cancelada;
* Ajustada.

## 18.6. Requisitos Funcionais

**RF-COMIS-001** — O sistema deve calcular comissão sobre recebimento validado.
**RF-COMIS-002** — O sistema deve permitir percentual por projeto.
**RF-COMIS-003** — O sistema deve permitir relatório por vendedor.
**RF-COMIS-004** — O sistema deve permitir relatório geral de comissões.
**RF-COMIS-005** — O sistema deve gerar previsão de pagamento no mês seguinte.
**RF-COMIS-006** — O sistema deve permitir marcar comissão como paga.
**RF-COMIS-007** — O sistema deve permitir ajuste manual com justificativa.

---

## 19. Categorias Financeiras

## 19.1. Objetivo

Classificar receitas e despesas por categoria mãe e categoria filha.

## 19.2. Regra

A categoria mãe deve somar os valores de suas categorias filhas.

Exemplo:

Investimento / Mobilizado — R$ 3.000,00

* Ferramentas — R$ 1.000,00;
* Máq. e Equipamentos — R$ 1.000,00;
* Mobiliário — R$ 1.000,00.

## 19.3. Categorias Iniciais

### Custos Financeiros

* Boletos FK;
* Empréstimos;
* Juros.

### Impostos

* Sombrear 01;
* Manzzano;
* Parcelamentos S01;
* Parcelamento Manzzano.

### Gastos com Produção

* Matéria-prima;
* Material de consumo.

### Gastos com Pessoal

* Adiantamento;
* Manzzano Folha;
* Sombrear Folha;
* Representante Comercial;
* PJ;
* Diaristas;
* Rescisões;
* FGTS;
* INSS;
* Vale Transporte;
* Vale Alimentação;
* Vale Refeição;
* Uniformes / EPIs;
* Premiações;
* Gratificações;
* Horas Extras;
* Terceirização de Serviços;
* Outros Gastos com Pessoal.

### Gastos Fixos

* Aluguel Matriz;
* Aluguel Lote;
* Aluguel Casa Luziânia;
* Aluguel Apartamento Valparaíso;
* Assessoria Jurídica;
* Contabilidade;
* Energia;
* Internet;
* IPTU;
* Material de Limpeza;
* Informática;
* Monitoramento;
* Limpeza;
* Seguros;
* Sistemas;
* ANTT;
* Taxas;
* Outros Gastos Fixos.

### Pintura

* Categoria direta.

### Veículos

* IPVA;
* Combustíveis;
* Manutenção;
* Lava-jato.

### Serviços Terceirizados

* Fretes;
* Locações;
* Retirada de Entulho.

### Ações de Marketing

* Categoria direta.

### Investimento / Mobilizado

* Ferramentas;
* Máquinas e Equipamentos;
* Mobiliário.

### Retirada dos Sócios

* Categoria direta.

## 19.4. Requisitos Funcionais

**RF-CAT-001** — O sistema deve permitir categoria mãe e categoria filha.
**RF-CAT-002** — O sistema deve somar categorias filhas dentro da categoria mãe.
**RF-CAT-003** — O sistema deve permitir relatório por categoria mãe.
**RF-CAT-004** — O sistema deve permitir relatório por categoria filha.
**RF-CAT-005** — O sistema deve permitir edição das categorias por administrador.

---

## 20. Centros de Custo

## 20.1. Centros Sugeridos

* Administrativo;
* Comercial;
* Produção;
* Montagem;
* Engenharia;
* Financeiro;
* Compras;
* RH;
* Frota;
* Marketing;
* Diretoria;
* Impostos;
* Projeto específico.

## 20.2. Requisitos

**RF-CC-001** — O sistema deve permitir cadastrar centros de custo.
**RF-CC-002** — O sistema deve permitir vincular centro de custo em contas a pagar.
**RF-CC-003** — O sistema deve permitir filtrar relatórios por centro de custo.

---

## 21. Despesas Gerais e Rateio

## 21.1. Projeto Geral

Quando a despesa não pertencer a cliente específico, deverá ser lançada em projeto geral:

* Administrativo Geral;
* Comercial Geral;
* Produção Geral;
* Frota Geral;
* Marketing Geral.

## 21.2. Modos de DRE

O DRE deverá permitir:

1. **Sem rateio:** mostra apenas despesas diretas do projeto.
2. **Com rateio proporcional ao faturamento:** distribui despesas gerais conforme participação de cada projeto no faturamento.
3. **Com rateio manual:** permite definir manualmente quanto de uma despesa geral será atribuída a cada projeto.

## 21.3. Requisitos

**RF-RAT-001** — O sistema deve permitir lançar despesas em projetos gerais.
**RF-RAT-002** — O sistema deve permitir DRE sem rateio.
**RF-RAT-003** — O sistema deve permitir DRE com rateio proporcional ao faturamento.
**RF-RAT-004** — O sistema deve permitir DRE com rateio manual.
**RF-RAT-005** — O sistema deve indicar claramente o modo de rateio usado no relatório.

---

## 22. DRE Gerencial

## 22.1. Objetivo

Gerar demonstrativo de resultado gerencial com entradas, custos, despesas, impostos e resultado final.

## 22.2. Tipos

* DRE geral;
* DRE por empresa;
* DRE por projeto;
* DRE por período;
* DRE comparativo;
* DRE com rateio;
* DRE sem rateio;
* DRE por regime de caixa;
* DRE por regime de competência.

## 22.3. Estrutura

1. Receita Bruta;
2. Descontos / Deduções;
3. Receita Líquida;
4. Custos Diretos;

   * matéria-prima;
   * material de consumo;
   * mão de obra direta;
   * serviços terceirizados diretos;
   * fretes vinculados à obra;
5. Lucro Bruto;
6. Despesas Operacionais;

   * administrativo;
   * comercial;
   * frota;
   * marketing;
   * sistemas;
   * energia;
   * aluguel;
   * contabilidade;
   * jurídico;
7. Impostos;
8. Custos Financeiros;
9. Investimentos / mobilizado;
10. Retiradas dos sócios;
11. Resultado final;
12. Margem percentual.

## 22.4. Filtros

* período;
* empresa;
* projeto;
* categoria;
* centro de custo;
* vendedor;
* com rateio ou sem rateio;
* regime: caixa ou competência.

## 22.5. Requisitos

**RF-DRE-001** — O sistema deve gerar DRE geral.
**RF-DRE-002** — O sistema deve gerar DRE por projeto.
**RF-DRE-003** — O sistema deve gerar DRE por empresa.
**RF-DRE-004** — O sistema deve permitir comparar períodos.
**RF-DRE-005** — O sistema deve permitir visão com e sem rateio.
**RF-DRE-006** — O sistema deve permitir exportar DRE em PDF e Excel.
**RF-DRE-007** — O sistema deve calcular margem percentual.

---

## 23. Fluxo de Caixa

## 23.1. Objetivo

Mostrar entradas e saídas previstas e realizadas.

## 23.2. Tipos

* geral;
* por empresa;
* por conta bancária;
* por projeto;
* semanal;
* quinzenal;
* mensal;
* trimestral;
* semestral;
* anual;
* projetado;
* realizado.

## 23.3. Campos

* saldo inicial;
* entradas previstas;
* entradas realizadas;
* saídas previstas;
* saídas realizadas;
* saldo previsto;
* saldo realizado;
* diferença previsto x realizado.

## 23.4. Requisitos

**RF-FC-001** — O sistema deve gerar fluxo de caixa geral.
**RF-FC-002** — O sistema deve gerar fluxo de caixa por projeto.
**RF-FC-003** — O sistema deve gerar fluxo de caixa por empresa.
**RF-FC-004** — O sistema deve gerar fluxo de caixa por conta bancária.
**RF-FC-005** — O sistema deve separar previsto e realizado.
**RF-FC-006** — O sistema deve permitir filtro semanal, quinzenal, mensal, trimestral, semestral e anual.

---

## 24. Dashboard

## 24.1. Objetivo

Exibir visão gerencial rápida para financeiro e diretoria.

## 24.2. Indicadores

* receita anual;
* receita mensal;
* despesa anual;
* despesa mensal;
* saldo previsto da semana;
* saldo previsto do mês;
* contas a pagar hoje;
* contas a pagar na semana;
* contas a receber hoje;
* contas a receber na semana;
* pagamentos vencidos;
* recebimentos vencidos;
* valor em aberto por projeto;
* valor recebido por projeto;
* despesas por categoria mãe;
* despesas por categoria filha;
* impostos a pagar;
* impostos pagos;
* comissões a pagar;
* compras pendentes de aprovação;
* OPs geradas e não pagas;
* ranking de fornecedores;
* ranking de projetos por lucro;
* ranking de projetos por faturamento;
* margem média por projeto.

## 24.3. Visão Diretoria

A tela do Wilson deve destacar:

* o que tem para pagar hoje;
* o que tem para pagar de sábado a sexta-feira;
* o que tem para pagar na quinzena;
* o que tem para pagar no mês;
* o que tem para receber nos mesmos períodos;
* compras/insumos a pagar;
* despesas com funcionários;
* impostos e parcelamentos;
* despesas operacionais;
* saldo projetado por conta bancária;
* OPs pendentes.

## 24.4. Requisitos

**RF-DASH-001** — O sistema deve exibir cards financeiros principais.
**RF-DASH-002** — O sistema deve permitir filtro por período.
**RF-DASH-003** — O sistema deve permitir filtro por empresa.
**RF-DASH-004** — O sistema deve permitir visão específica da diretoria.
**RF-DASH-005** — O sistema deve destacar vencimentos do dia.
**RF-DASH-006** — O sistema deve destacar contas vencidas.
**RF-DASH-007** — O sistema deve exibir OPs pendentes.

---

## 25. Relatórios

## 25.1. Estrutura

A área de relatórios deve permitir selecionar:

* tipo de relatório;
* período;
* empresa;
* projeto;
* categoria mãe;
* categoria filha;
* centro de custo;
* fornecedor;
* vendedor;
* funcionário;
* conta bancária;
* status;
* formato de exportação.

Formatos:

* visualizar na tela;
* PDF;
* Excel;
* imprimir.

## 25.2. Relatórios Obrigatórios

1. Contas a Pagar;
2. Contas a Receber;
3. Pagamentos do Dia;
4. Relatório Semanal para Wilson;
5. Relatório Quinzenal;
6. Relatório Mensal;
7. Fluxo de Caixa Geral;
8. Fluxo de Caixa por Projeto;
9. DRE Geral;
10. DRE por Projeto;
11. DRE por Empresa;
12. Despesas por Categoria Mãe;
13. Despesas por Categoria Filha;
14. Impostos Pagos;
15. Impostos a Pagar;
16. Comissão por Vendedor;
17. Comissão Geral;
18. Funcionários e PJs;
19. Produtividade por Obra;
20. Adiantamentos e Vales;
21. Compras por Fornecedor;
22. Curva S / Ranking de Fornecedores;
23. Compras Pendentes;
24. Cotações Aprovadas;
25. OPs Geradas;
26. OPs Pagas;
27. Plantão de Vendas;
28. Inadimplência;
29. Recebimentos por Forma de Pagamento;
30. Lucro/Prejuízo por Obra.

## 25.3. Requisitos

**RF-REL-001** — O sistema deve possuir central de relatórios.
**RF-REL-002** — O sistema deve permitir múltiplos filtros.
**RF-REL-003** — O sistema deve permitir exportar PDF.
**RF-REL-004** — O sistema deve permitir exportar Excel.
**RF-REL-005** — O sistema deve permitir imprimir.
**RF-REL-006** — O sistema deve respeitar permissões de usuário nos relatórios.

---

## 26. Auditoria e Histórico

## 26.1. Objetivo

Preservar histórico das alterações relevantes.

## 26.2. Eventos que devem gerar log

* criação de lançamento;
* edição de valor;
* edição de vencimento;
* alteração de status;
* baixa de pagamento;
* baixa de recebimento;
* cancelamento;
* geração de OP;
* validação de recebimento de plantão;
* recusa de recebimento;
* aprovação de compra;
* alteração de comissão;
* alteração de percentual de imposto;
* exclusão lógica/inativação.

## 26.3. Campos do Log

* ID;
* usuário;
* ação;
* entidade alterada;
* ID da entidade;
* valor anterior;
* valor novo;
* data e hora;
* justificativa, quando aplicável.

---

## 27. Requisitos Não Funcionais

## 27.1. Segurança

* autenticação por usuário e senha;
* controle de permissões por perfil;
* proteção contra acesso indevido entre perfis;
* logs de auditoria;
* possibilidade futura de autenticação em dois fatores.

## 27.2. Responsividade

* sistema deve funcionar em desktop;
* módulo Plantão de Vendas deve funcionar muito bem em celular;
* telas principais devem ser responsivas.

## 27.3. Performance

* listagens devem carregar com paginação;
* filtros devem ser rápidos;
* relatórios grandes devem permitir exportação assíncrona ou processamento otimizado em versão futura.

## 27.4. Integridade

* lançamentos pagos ou recebidos não devem ser apagados fisicamente;
* usar cancelamento/estorno com justificativa;
* preservar anexos;
* preservar histórico financeiro.

## 27.5. Exportação

* relatórios devem ser exportáveis em PDF e Excel;
* OP deve ser exportável/imprimível em PDF.

## 27.6. Usabilidade

* formulários objetivos;
* máscaras para CPF, CNPJ, moeda e datas;
* filtros claros;
* status visíveis por cor/etiqueta;
* botões de ação evidentes.

---

## 28. Modelo de Dados Inicial

## 28.1. Tabelas / Entidades

### users

* id;
* name;
* email;
* password_hash;
* role_id;
* status;
* created_at;
* updated_at.

### roles

* id;
* name;
* description.

### companies

* id;
* legal_name;
* trade_name;
* cnpj;
* state_registration;
* municipal_registration;
* address;
* city;
* state;
* zip_code;
* email;
* phone;
* tax_regime;
* status;
* created_at;
* updated_at.

### bank_accounts

* id;
* company_id;
* bank_name;
* agency;
* account_number;
* account_type;
* holder_name;
* holder_document;
* pix_key;
* initial_balance;
* status;
* created_at;
* updated_at.

### projects

* id;
* company_id;
* name;
* project_type;
* client_id;
* responsible_person_id;
* seller_id;
* commission_percentage;
* contract_value;
* received_from_sales_shift;
* remaining_contract_value;
* main_payment_method;
* start_date;
* expected_end_date;
* status;
* notes;
* created_at;
* updated_at.

### clients

* id;
* name;
* document;
* type;
* phone;
* email;
* address;
* city;
* state;
* notes;
* created_at;
* updated_at.

### residents

* id;
* project_id;
* name;
* cpf;
* phone;
* email;
* apartment;
* block;
* parking_space;
* created_at;
* updated_at.

### sellers

* id;
* name;
* document;
* type;
* phone;
* email;
* bank_data;
* default_commission_percentage;
* status;
* created_at;
* updated_at.

### suppliers

* id;
* name;
* document;
* type;
* phone;
* email;
* bank_data;
* address;
* status;
* created_at;
* updated_at.

### financial_categories

* id;
* parent_id;
* name;
* type;
* status;
* created_at;
* updated_at.

### cost_centers

* id;
* name;
* description;
* status;
* created_at;
* updated_at.

### receivables

* id;
* company_id;
* project_id;
* client_id;
* resident_id;
* seller_id;
* origin;
* gross_amount;
* discount_amount;
* net_expected_amount;
* payment_method;
* due_date;
* expected_receipt_date;
* actual_receipt_date;
* bank_account_id;
* status;
* invoice_id;
* notes;
* created_by;
* validated_by;
* validated_at;
* created_at;
* updated_at.

### payables

* id;
* company_id;
* project_id;
* cost_center_id;
* supplier_id;
* category_id;
* parent_category_id;
* description;
* amount;
* competence_date;
* due_date;
* payment_method;
* bank_account_id;
* status;
* recurrence_id;
* installment_number;
* total_installments;
* payment_order_id;
* created_by;
* paid_by;
* paid_at;
* notes;
* created_at;
* updated_at.

### payment_orders

* id;
* number;
* payable_id;
* company_id;
* bank_account_id;
* supplier_id;
* project_id;
* category_id;
* cost_center_id;
* description;
* amount;
* due_date;
* payment_method;
* status;
* generated_by;
* generated_at;
* paid_at;
* notes;
* created_at;
* updated_at.

### sales_shifts

* id;
* project_id;
* company_id;
* date;
* seller_id;
* product_type;
* reference_value_per_space;
* target_spaces;
* notes;
* status;
* created_at;
* updated_at.

### sales_shift_payments

* id;
* sales_shift_id;
* project_id;
* seller_id;
* resident_id;
* client_name;
* cpf;
* amount_paid;
* payment_method;
* payment_link;
* apartment;
* block;
* parking_space;
* discount_amount;
* bonus_description;
* description;
* status;
* receivable_id;
* created_by;
* validated_by;
* validated_at;
* created_at;
* updated_at.

### invoices

* id;
* number;
* company_id;
* project_id;
* client_id;
* amount;
* issue_date;
* description;
* file_url;
* created_at;
* updated_at.

### tax_provisions

* id;
* invoice_id;
* company_id;
* project_id;
* tax_type;
* percentage;
* amount;
* due_date;
* category_id;
* payable_id;
* status;
* created_at;
* updated_at.

### purchase_requests

* id;
* requester_id;
* company_id;
* project_id;
* cost_center_id;
* item_description;
* quantity;
* unit;
* technical_description;
* urgency;
* needed_at;
* notes;
* status;
* created_at;
* updated_at.

### quotations

* id;
* purchase_request_id;
* supplier_id;
* unit_price;
* total_amount;
* delivery_deadline;
* payment_terms;
* installments;
* validity_date;
* freight_included;
* file_url;
* notes;
* is_winner;
* choice_reason;
* status;
* created_at;
* updated_at.

### workers

* id;
* name;
* document;
* worker_type;
* role;
* company_id;
* phone;
* email;
* bank_data;
* fixed_salary;
* default_productivity_rule;
* status;
* notes;
* created_at;
* updated_at.

### productivity_entries

* id;
* worker_id;
* project_id;
* productivity_type;
* quantity;
* unit_value;
* total_value;
* reference_period_start;
* reference_period_end;
* executed_stage;
* status;
* payable_id;
* notes;
* created_at;
* updated_at.

### commissions

* id;
* seller_id;
* project_id;
* receivable_id;
* gross_received_amount;
* commission_percentage;
* commission_amount;
* base_receipt_date;
* expected_payment_date;
* status;
* payable_id;
* notes;
* created_at;
* updated_at.

### attachments

* id;
* entity_type;
* entity_id;
* file_name;
* file_url;
* uploaded_by;
* created_at.

### audit_logs

* id;
* user_id;
* action;
* entity_type;
* entity_id;
* old_value;
* new_value;
* justification;
* created_at.

---

## 29. APIs / Endpoints Sugeridos

A estrutura abaixo é sugestiva e pode ser adaptada à stack escolhida.

### Autenticação

* POST /auth/login
* POST /auth/logout
* GET /auth/me

### Empresas

* GET /companies
* POST /companies
* GET /companies/:id
* PUT /companies/:id
* DELETE /companies/:id

### Projetos

* GET /projects
* POST /projects
* GET /projects/:id
* PUT /projects/:id
* GET /projects/:id/financial-summary
* GET /projects/:id/dre
* GET /projects/:id/cash-flow

### Plantão de Vendas

* GET /sales-shifts
* POST /sales-shifts
* GET /sales-shifts/:id
* PUT /sales-shifts/:id
* POST /sales-shifts/:id/payments
* GET /sales-shifts/:id/payments
* POST /sales-shift-payments/:id/validate
* POST /sales-shift-payments/:id/reject
* POST /sales-shift-payments/:id/request-correction
* GET /sales-shifts/:id/closing-report

### Contas a Receber

* GET /receivables
* POST /receivables
* GET /receivables/:id
* PUT /receivables/:id
* POST /receivables/:id/receive
* POST /receivables/:id/cancel

### Contas a Pagar

* GET /payables
* POST /payables
* GET /payables/:id
* PUT /payables/:id
* POST /payables/:id/pay
* POST /payables/:id/cancel
* POST /payables/:id/generate-payment-order

### OP

* GET /payment-orders
* GET /payment-orders/:id
* GET /payment-orders/:id/pdf
* POST /payment-orders/:id/cancel

### Compras

* GET /purchase-requests
* POST /purchase-requests
* GET /purchase-requests/:id
* POST /purchase-requests/:id/quotations
* POST /quotations/:id/select-winner
* POST /purchase-requests/:id/approve
* POST /purchase-requests/:id/reject

### RH / Produtividade

* GET /workers
* POST /workers
* GET /workers/:id
* PUT /workers/:id
* POST /productivity-entries
* GET /productivity-entries
* POST /productivity-entries/:id/approve

### Relatórios

* GET /reports/payables
* GET /reports/receivables
* GET /reports/dre
* GET /reports/cash-flow
* GET /reports/commissions
* GET /reports/taxes
* GET /reports/purchases-by-supplier
* GET /reports/sales-shift
* GET /reports/workers

---

## 30. Critérios de Aceitação Gerais

O sistema será considerado apto no MVP quando permitir:

1. Cadastrar empresas, contas bancárias, projetos, fornecedores, vendedores, clientes e categorias.
2. Criar contas a receber manualmente.
3. Criar contas a receber automaticamente via Plantão de Vendas.
4. Validar recebimentos de plantão pelo financeiro.
5. Dar baixa em recebimentos.
6. Criar contas a pagar.
7. Gerar OP imprimível.
8. Dar baixa em pagamentos.
9. Controlar status aberto, pago, vencido, pendente e cancelado.
10. Lançar notas fiscais manualmente.
11. Provisionar impostos manualmente com geração automática de contas a pagar.
12. Criar solicitação de compra com três cotações.
13. Aprovar compra e gerar contas a pagar.
14. Cadastrar trabalhadores e lançar produtividade.
15. Gerar comissão com base em recebimento validado.
16. Gerar dashboard financeiro básico.
17. Gerar DRE geral e por projeto.
18. Gerar fluxo de caixa geral e por projeto.
19. Gerar relatórios básicos com filtros.
20. Controlar permissões por perfil.
21. Registrar logs de auditoria para ações críticas.

---

## 31. Backlog por Fase

## Fase 1 — Fundação do Sistema

* autenticação;
* perfis de usuário;
* empresas;
* contas bancárias;
* categorias;
* centros de custo;
* clientes;
* fornecedores;
* vendedores;
* projetos;
* anexos básicos.

## Fase 2 — Financeiro Essencial

* contas a receber;
* contas a pagar;
* filtros por status;
* baixa de recebimentos;
* baixa de pagamentos;
* geração de OP;
* PDF da OP;
* dashboard básico.

## Fase 3 — Plantão de Vendas

* cadastro de plantão;
* vínculo vendedor x plantão;
* tela simplificada mobile;
* lançamento de recebimento;
* criação automática de recebível;
* validação financeira;
* relatório de fechamento.

## Fase 4 — Notas e Impostos

* cadastro manual de nota fiscal;
* anexos;
* provisionamento de impostos;
* geração de contas a pagar de imposto;
* relatório de impostos.

## Fase 5 — Compras

* solicitação de compra;
* três cotações;
* seleção da cotação vencedora;
* justificativa;
* aprovação pelo financeiro;
* geração automática de contas a pagar.

## Fase 6 — RH e Produtividade

* cadastro de trabalhadores;
* lançamento de produtividade;
* vales e adiantamentos;
* geração de contas a pagar;
* relatório de trabalhador x valor a receber.

## Fase 7 — Comissões

* cálculo automático por recebimento validado;
* relatório por vendedor;
* previsão de pagamento;
* status da comissão;
* geração de contas a pagar, se desejado.

## Fase 8 — Relatórios Gerenciais

* DRE geral;
* DRE por projeto;
* DRE com e sem rateio;
* fluxo de caixa;
* curva S de fornecedores;
* relatório semanal para Wilson;
* inadimplência;
* exportação PDF/Excel.

## Fase 9 — Auditoria e Refinamentos

* logs completos;
* histórico visual por lançamento;
* melhorias no dashboard;
* filtros avançados;
* permissões granulares;
* indicadores comparativos.

---

## 32. Prioridade do MVP

A ordem de prioridade para a primeira entrega deve ser:

1. Cadastros base;
2. Projetos;
3. Contas a Pagar;
4. OP;
5. Contas a Receber;
6. Plantão de Vendas;
7. Dashboard básico;
8. Relatórios essenciais;
9. Notas fiscais e impostos;
10. Compras;
11. RH/produtividade;
12. Comissões;
13. DRE e fluxo de caixa avançado.

---

## 33. Observações de UX

* O sistema deve ter visual limpo, técnico e direto.
* Status devem ser facilmente identificáveis.
* Formulários financeiros devem evitar excesso de campos visíveis ao mesmo tempo.
* Campos condicionais devem aparecer somente quando necessário.
* A tela do vendedor deve ser a mais simples possível.
* Relatórios devem ter filtros no topo e resultado abaixo.
* A pasta do projeto deve funcionar como o centro de controle de cada condomínio.
* Botões principais devem ser claros: Novo lançamento, Gerar OP, Marcar como pago, Validar recebimento, Exportar relatório.

---

## 34. Regras Críticas para o Desenvolvedor

1. Não permitir exclusão física de lançamentos financeiros pagos ou recebidos.
2. Usar cancelamento ou estorno com justificativa.
3. Todo lançamento deve ter empresa.
4. Toda despesa deve ter categoria mãe.
5. Toda despesa deve ter projeto específico ou projeto geral.
6. Todo recebimento de plantão deve nascer como pendente de validação.
7. Comissão só deve nascer após recebimento validado.
8. Imposto provisionado deve gerar contas a pagar.
9. Compra aprovada deve gerar contas a pagar.
10. OP deve ficar vinculada à despesa original.
11. O vendedor não pode visualizar dados financeiros gerais.
12. Relatórios devem respeitar permissões.
13. Todo pagamento baixado deve registrar usuário, data e conta bancária.
14. Todo recebimento baixado deve registrar usuário, data e conta bancária.
15. Todas as ações críticas devem gerar log.

---

## 35. Entrega Esperada do Desenvolvedor

O desenvolvedor deverá entregar:

1. Sistema web responsivo;
2. Banco de dados estruturado;
3. Autenticação e permissões;
4. Cadastros principais;
5. Contas a pagar e receber;
6. Módulo de Plantão de Vendas;
7. Geração de OP em PDF;
8. Upload de anexos;
9. Dashboard básico;
10. Relatórios essenciais;
11. DRE e fluxo de caixa em versão inicial;
12. Logs de auditoria;
13. Documentação técnica mínima;
14. Ambiente de homologação para testes.

---

## 36. Próxima Etapa Após Este PRD

Após validação deste PRD, a próxima etapa recomendada é gerar:

1. Matriz de permissões em tabela;
2. Fluxogramas dos principais processos;
3. Wireframes das telas;
4. Modelo ERD do banco de dados;
5. Backlog detalhado em histórias de usuário;
6. Prompt técnico final para execução em ferramenta de desenvolvimento com IA ou equipe de software.
