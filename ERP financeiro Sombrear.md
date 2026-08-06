# PLANO FUNCIONAL DO SISTEMA FINANCEIRO SOMBREAR

## 1. Visão Geral do Sistema

O Sistema Financeiro Sombrear será um módulo de gestão financeira e gerencial voltado para controlar toda a jornada financeira da empresa, desde a venda de uma cobertura até o recebimento, pagamento de despesas, compras, mão de obra, comissões, impostos, relatórios e DRE.

A Sombrear atua com coberturas de garagem e soluções para áreas externas, com produtos como Sombrite, Telha Galvalume, Telha Isotérmica, Carport Solar, manutenções e vendas de varejo. O sistema precisa respeitar essa realidade operacional, permitindo que cada venda, condomínio ou cliente seja controlado como um Projeto.

O sistema deverá permitir a análise financeira tanto da empresa como um todo quanto de cada projeto individualmente, possibilitando que a diretoria enxergue:

* quanto tem a receber;
* quanto tem a pagar;
* o que vence no dia, semana, quinzena, mês, trimestre, semestre e ano;
* o resultado por obra;
* o resultado geral da empresa;
* a margem real por projeto;
* despesas por categoria;
* comissões a pagar;
* impostos pagos e provisionados;
* produtividade e custo de mão de obra;
* compras por fornecedor;
* fluxo de caixa previsto e realizado.

## 2. Objetivos Principais

O sistema deverá:

1. Centralizar a gestão financeira da Sombrear e da Manzzano.
2. Controlar contas a receber por projeto, contrato, plantão de vendas, medição, parcela ou financiamento.
3. Controlar contas a pagar por categoria, fornecedor, projeto, empresa e conta bancária.
4. Permitir o lançamento de recebimentos de plantão pelos vendedores, com validação posterior do financeiro.
5. Controlar compras e cotações, exigindo três orçamentos antes da aprovação.
6. Gerar Ordem de Pagamento — OP — para validação física pelo Wilson.
7. Controlar despesas com funcionários CLT, PJs, diaristas, representantes e terceirizados.
8. Controlar produtividade de mão de obra por m², vaga, módulo, diária ou etapa.
9. Calcular comissões de vendedores com base no valor bruto recebido.
10. Provisionar impostos no momento do lançamento da nota fiscal.
11. Gerar DRE gerencial por empresa, projeto e período.
12. Gerar fluxo de caixa geral e por projeto.
13. Gerar relatórios gerenciais automáticos para tomada de decisão.
14. Permitir visão com ou sem rateio de despesas administrativas.
15. Criar uma base organizada para futura integração com outros módulos do ecossistema da empresa.

## 3. Premissas Funcionais Fechadas

As seguintes premissas foram definidas:

* O sistema controlará compras e despesas, sem controle de estoque neste primeiro momento.
* Cada condomínio, cliente ou venda relevante será tratado como Projeto.
* O plantão de vendas será controlado por unidade, apartamento, bloco e vaga.
* O vendedor terá acesso simplificado apenas para lançar recebimentos do plantão.
* Os recebimentos lançados pelo vendedor entrarão como pendentes de validação no Contas a Receber.
* O financeiro será responsável por validar recebimentos e dar baixa nos pagamentos.
* A nota fiscal será anexada manualmente.
* A Ordem de Pagamento impressa será usada como validação física para o Wilson.
* As compras serão aprovadas pelo financeiro.
* A comissão do vendedor será calculada sobre o valor bruto recebido.
* A produtividade poderá ser lançada por m², vaga, módulo, diária ou etapa.
* O DRE por obra poderá ser emitido com ou sem despesas administrativas rateadas.
* A inadimplência será controlada apenas por relatório.

## 4. Estrutura Geral do Sistema

O sistema deverá ter uma navegação clara, com abas superiores e menus laterais.

### 4.1. Abas superiores sugeridas

1. Dashboard
2. Contas a Receber
3. Contas a Pagar
4. Plantão de Vendas
5. Compras
6. RH / Mão de Obra
7. Relatórios
8. Cadastros
9. Configurações

### 4.2. Menus laterais sugeridos

Dentro de Cadastros:

* Empresas
* Contas bancárias
* Projetos / Condomínios
* Clientes / Moradores
* Síndicos / Responsáveis
* Vendedores
* Funcionários CLT
* Trabalhadores PJ
* Fornecedores
* Categorias financeiras
* Centros de custo
* Formas de pagamento
* Tipos de cobertura
* Tipos de produtividade
* Usuários e permissões

## 5. Empresas Controladas

O sistema deverá permitir o cadastro de múltiplas empresas, inicialmente:

* Sombrear
* Manzzano

Cada empresa deverá conter:

* razão social;
* nome fantasia;
* CNPJ;
* inscrição estadual, se houver;
* inscrição municipal, se houver;
* endereço completo;
* contatos;
* e-mail financeiro;
* contas bancárias vinculadas;
* regime tributário, se necessário;
* observações.

Todos os lançamentos financeiros deverão estar vinculados a uma empresa.

## 6. Contas Bancárias

O sistema deverá permitir cadastrar contas bancárias utilizadas pela empresa.

Campos sugeridos:

* empresa vinculada;
* banco;
* agência;
* conta;
* tipo de conta;
* chave PIX;
* titular;
* CNPJ/CPF do titular;
* saldo inicial;
* status da conta: ativa ou inativa.

As contas bancárias serão usadas para:

* registrar entrada de receitas;
* registrar saída de pagamentos;
* filtrar fluxo de caixa;
* gerar relatórios por banco;
* controlar saldo previsto e realizado.

## 7. Projetos

Cada condomínio, contrato, cliente de varejo ou obra será cadastrado como Projeto.

### 7.1. Tipos de projeto

* Condomínio — Sombrite
* Condomínio — Telha Galvalume
* Condomínio — Telha Isotérmica
* Condomínio — Carport Solar
* Condomínio — Manutenção
* Varejo — Pessoa Física
* Varejo — Pessoa Jurídica
* Administrativo Geral
* Comercial Geral
* Produção Geral
* Frota Geral
* Marketing Geral

### 7.2. Campos do projeto

* nome do projeto;
* tipo de projeto;
* condomínio/cliente;
* CNPJ/CPF do cliente principal;
* síndico ou responsável;
* telefone;
* e-mail;
* endereço da obra;
* empresa responsável: Sombrear ou Manzzano;
* vendedor responsável;
* percentual de comissão;
* valor contratado;
* valor recebido via plantão;
* saldo a contratar/aditivar;
* forma de recebimento principal;
* data de início;
* data prevista de término;
* status do projeto;
* observações;
* anexos: contrato, aditivos, notas, boletos, comprovantes, projetos, documentos.

### 7.3. Status do projeto

* Pré-cadastro
* Em negociação
* Contratado
* Em plantão de vendas
* Em execução
* Em recebimento
* Concluído
* Suspenso
* Cancelado

## 8. Módulo de Plantão de Vendas

## 8.1. Objetivo

Permitir que vendedores lancem recebimentos realizados durante plantões em condomínios, com acesso simplificado e limitado, sem visualizar informações financeiras estratégicas da empresa.

Esses lançamentos deverão entrar no Contas a Receber como recebíveis pendentes de validação.

## 8.2. Perfil: Vendedor de Plantão

O vendedor deverá acessar apenas:

* formulário de lançamento de recebimento;
* lista dos lançamentos que ele realizou;
* status dos próprios lançamentos;
* projeto/condomínio ao qual foi vinculado.

O vendedor não poderá acessar:

* contas a pagar;
* DRE;
* saldo bancário;
* contas bancárias;
* despesas;
* fornecedores;
* compras;
* RH;
* relatórios gerenciais;
* dados de outros vendedores, salvo autorização específica.

## 8.3. Cadastro do plantão

Antes do vendedor lançar os recebimentos, o financeiro ou administrador deverá criar um plantão.

Campos do plantão:

* projeto/condomínio;
* data do plantão;
* vendedor responsável;
* produto vendido;
* valor por vaga, se aplicável;
* meta de vagas;
* observações comerciais;
* status: ativo, encerrado ou cancelado.

## 8.4. Formulário de recebimento do vendedor

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
* descrição ou observação.

Campos adicionais recomendados:

* telefone do morador;
* e-mail;
* bonificação ou desconto;
* valor do desconto;
* descrição da bonificação;
* anexo do comprovante;
* observação interna do vendedor.

## 8.5. Formas de pagamento no plantão

O vendedor poderá selecionar:

* PIX;
* dinheiro;
* cartão de crédito;
* cartão de débito;
* dois cartões;
* link de pagamento;
* boleto;
* transferência;
* outro.

## 8.6. Campos condicionais por forma de pagamento

### PIX

* banco de destino, se conhecido;
* chave PIX utilizada;
* anexo do comprovante.

### Dinheiro

* nome de quem recebeu fisicamente;
* observação obrigatória;
* conferência posterior pelo financeiro.

### Cartão

* bandeira;
* quantidade de parcelas;
* taxa, se informada;
* código/autorização da transação;
* comprovante.

### Dois cartões

* valor no cartão 1;
* valor no cartão 2;
* bandeira do cartão 1;
* bandeira do cartão 2;
* parcelas do cartão 1;
* parcelas do cartão 2;
* comprovantes.

### Link de pagamento

* campo obrigatório para colar o link;
* status do link: enviado, pago, expirado ou cancelado.

## 8.7. Fluxo do lançamento no plantão

1. Vendedor seleciona o projeto/condomínio.
2. Preenche os dados do morador.
3. Informa valor e forma de pagamento.
4. Anexa comprovante, se houver.
5. Envia o lançamento.
6. Sistema cria um recebível no Contas a Receber com status Pendente de Validação.
7. Financeiro valida, corrige, recusa ou solicita ajuste.
8. Após validação, o recebimento passa a constar como Receita Confirmada.

## 8.8. Status do lançamento de plantão

* Rascunho
* Enviado para validação
* Pendente de correção
* Validado
* Recusado
* Cancelado

## 8.9. Validação pelo financeiro

O financeiro deverá conferir:

* se o valor entrou na conta;
* se o comprovante é válido;
* se o CPF está correto;
* se o apartamento/bloco/vaga estão corretos;
* se a forma de pagamento está correta;
* se não existe lançamento duplicado;
* se o vendedor está vinculado ao projeto.

Ações disponíveis:

* Validar recebimento
* Corrigir lançamento
* Solicitar correção ao vendedor
* Recusar lançamento
* Cancelar lançamento

## 8.10. Fechamento do plantão

Ao final do plantão, o sistema deverá gerar relatório com:

* condomínio/projeto;
* vendedor;
* data do plantão;
* quantidade de moradores que aderiram;
* quantidade de vagas vendidas;
* valor total bruto lançado;
* valor validado;
* valor pendente de validação;
* valor recusado;
* valor por forma de pagamento;
* descontos concedidos;
* bonificações registradas;
* lista de apartamentos/blocos/vagas;
* resumo para abatimento do contrato/aditivo.

## 9. Contas a Receber

## 9.1. Objetivo

Controlar todos os valores que a Sombrear e a Manzzano têm a receber, sejam oriundos de contrato, aditivo, plantão de vendas, financiamento, boleto, medição ou varejo.

## 9.2. Origem dos recebíveis

* Contrato principal
* Aditivo contratual
* Plantão de vendas
* Financiamento bancário
* Parcelamento próprio
* Medição por etapa
* Entrada
* Entrega de etapa
* Venda avulsa de varejo
* Manutenção
* Outros

## 9.3. Campos do lançamento a receber

* empresa recebedora;
* projeto;
* cliente principal;
* cliente final/morador, quando houver;
* CPF/CNPJ;
* apartamento;
* bloco;
* vaga;
* origem do lançamento;
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
* observações.

## 9.4. Status do Contas a Receber

* Previsto
* Pendente de validação
* Em aberto
* Parcialmente recebido
* Recebido
* Vencido
* Cancelado
* Recusado

## 9.5. Baixa de recebimento

Ao dar baixa em um recebimento, o financeiro deverá informar:

* data efetiva do recebimento;
* conta bancária que recebeu;
* valor recebido;
* forma de pagamento final;
* anexar comprovante, se aplicável;
* anexar nota fiscal, se aplicável;
* informar número da nota fiscal;
* provisionar impostos, quando houver nota fiscal.

## 10. Notas Fiscais e Provisionamento de Impostos

## 10.1. Lançamento da nota fiscal

A nota fiscal será cadastrada manualmente pelo financeiro.

Campos:

* número da nota;
* empresa emissora;
* projeto vinculado;
* cliente;
* valor da nota;
* data de emissão;
* data de recebimento vinculada;
* descrição do serviço/material faturado;
* anexo da nota fiscal.

## 10.2. Descrição da nota

A nota deverá permitir descrever a etapa ou item faturado.

Exemplos:

* fabricação de pés para chumbamento;
* etapa de fundação;
* montagem dos braços;
* instalação de arcos e estrelas;
* instalação de tela;
* entrega parcial da cobertura;
* manutenção preventiva;
* venda avulsa.

## 10.3. Provisionamento de impostos

Ao cadastrar a nota, o sistema deverá permitir lançar manualmente os percentuais de impostos.

Tipos de impostos:

* municipal;
* estadual;
* federal;
* parcelamento de imposto;
* outros.

Campos:

* tipo de imposto;
* percentual;
* valor calculado;
* vencimento;
* categoria financeira;
* empresa responsável;
* projeto vinculado;
* status.

Ao salvar, o sistema deverá gerar automaticamente um lançamento no Contas a Pagar na categoria de impostos.

## 11. Contas a Pagar

## 11.1. Objetivo

Controlar todas as despesas da empresa, vinculadas ou não a projetos específicos.

## 11.2. Tipos de despesas

* despesas administrativas;
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
* retirada dos sócios.

## 11.3. Campos do lançamento a pagar

* empresa pagadora;
* projeto vinculado;
* centro de custo;
* fornecedor ou favorecido;
* categoria mãe;
* categoria filha;
* descrição;
* valor;
* data de competência;
* data de vencimento;
* forma de pagamento;
* conta bancária prevista para saída;
* status;
* recorrência, se houver;
* número de parcelas;
* anexos: nota, boleto, recibo, contrato, comprovante;
* observações.

## 11.4. Status do Contas a Pagar

* Em aberto
* Aguardando aprovação
* OP gerada
* Aprovado para pagamento
* Pago
* Vencido
* Cancelado

## 11.5. Fluxo de pagamento

1. Financeiro lança a despesa.
2. Sistema classifica por empresa, projeto, categoria e vencimento.
3. Financeiro gera a OP.
4. OP é impressa e enviada para validação física pelo Wilson.
5. Wilson realiza o pagamento no banco.
6. Financeiro marca como pago.
7. Financeiro anexa o comprovante.
8. Sistema dá baixa no Contas a Pagar.

## 12. Ordem de Pagamento — OP

## 12.1. Objetivo

Gerar um documento físico de validação e controle interno para pagamento das despesas.

## 12.2. Campos da OP

* número da OP;
* data de emissão;
* empresa pagadora;
* conta bancária de saída;
* favorecido/fornecedor;
* CPF/CNPJ do favorecido;
* dados bancários do favorecido;
* projeto vinculado;
* categoria mãe;
* categoria filha;
* centro de custo;
* descrição da despesa;
* valor;
* vencimento;
* forma de pagamento;
* anexos listados;
* responsável pelo lançamento;
* campo de autorização;
* campo para assinatura;
* campo de observações.

## 12.3. Status da OP

* Gerada
* Impressa
* Paga
* Cancelada

## 12.4. Regras da OP

* Toda despesa deverá permitir gerar OP.
* A OP deverá ter numeração única.
* A OP deverá ficar vinculada ao lançamento financeiro.
* Após pagamento, a OP deverá constar como paga.
* O sistema deverá preservar histórico de emissão e baixa.

## 13. Compras e Cotações

## 13.1. Objetivo

Controlar solicitações de compras de produtos e serviços, exigindo três cotações antes da aprovação e integrando automaticamente a compra aprovada ao Contas a Pagar.

## 13.2. Solicitação de compra

Campos:

* solicitante;
* empresa;
* projeto vinculado ou despesa geral;
* centro de custo;
* produto ou serviço;
* quantidade;
* unidade de medida;
* descrição técnica;
* urgência;
* data de necessidade;
* observações;
* anexos.

## 13.3. Cotações obrigatórias

Para cada solicitação, o sistema deverá permitir cadastrar até três ou mais cotações.

Campos por cotação:

* fornecedor;
* valor unitário;
* valor total;
* prazo de entrega;
* condição de pagamento;
* validade da proposta;
* frete incluso ou não;
* observações;
* anexo do orçamento.

## 13.4. Escolha do fornecedor

O sistema não deverá obrigar a escolha do menor preço.

O usuário deverá selecionar a cotação vencedora e justificar:

* menor preço;
* melhor prazo;
* melhor qualidade;
* fornecedor estratégico;
* melhor custo-benefício;
* disponibilidade imediata;
* outro motivo.

## 13.5. Aprovação da compra

A aprovação será feita pelo financeiro.

Status possíveis:

* Em solicitação
* Em cotação
* Aguardando aprovação
* Aprovada
* Reprovada
* Comprada
* Cancelada

## 13.6. Integração com Contas a Pagar

Após aprovação, o sistema deverá gerar automaticamente os lançamentos no Contas a Pagar com:

* fornecedor;
* projeto;
* centro de custo;
* categoria financeira;
* descrição;
* valor;
* número de parcelas;
* vencimentos;
* forma de pagamento;
* anexos da cotação;
* status inicial: Em aberto ou Aguardando aprovação.

## 14. RH / Mão de Obra

## 14.1. Objetivo

Controlar funcionários CLT, trabalhadores PJ, diaristas, representantes comerciais e terceirizados, vinculando os custos às obras ou despesas gerais.

## 14.2. Tipos de trabalhadores

* Funcionário CLT da indústria
* Trabalhador PJ da montagem/execução
* Diarista
* Representante comercial
* Terceirizado
* Prestador eventual

## 14.3. Cadastro de funcionário/trabalhador

Campos:

* nome;
* CPF ou CNPJ;
* tipo de vínculo;
* função;
* empresa vinculada;
* telefone;
* e-mail;
* dados bancários;
* salário fixo, se houver;
* regra de produtividade;
* status: ativo, inativo, afastado ou desligado;
* observações;
* anexos.

## 14.4. Verbas e despesas vinculadas

O cadastro deverá permitir controlar:

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

## 14.5. Lançamento de produtividade

O sistema deverá permitir lançar produtividade por:

* m²;
* vaga;
* módulo;
* diária;
* etapa concluída;
* valor fixo por medição;
* outra regra manual.

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

## 14.6. Integração com Contas a Pagar

Os valores aprovados de salário, produtividade, vales, bônus, gratificações e encargos deverão gerar lançamentos no Contas a Pagar.

## 15. Comissões de Vendedores

## 15.1. Objetivo

Controlar comissões de vendedores internos e externos, com base no valor bruto recebido pela empresa.

## 15.2. Cadastro de vendedor

Campos:

* nome;
* CPF/CNPJ;
* tipo: interno, externo, síndico, advogado, parceiro, representante;
* telefone;
* e-mail;
* dados bancários;
* percentual padrão de comissão, se houver;
* status;
* observações.

## 15.3. Comissão por projeto

Cada projeto deverá permitir definir:

* vendedor responsável;
* percentual de comissão;
* regra específica;
* observação.

## 15.4. Regra de cálculo

A comissão será calculada sobre o valor bruto recebido.

O vendedor receberá a comissão no mês seguinte ao recebimento pela empresa.

Exemplo:

* valor recebido em maio: R$ 100.000,00;
* comissão: 3%;
* comissão gerada: R$ 3.000,00;
* competência de pagamento: junho.

## 15.5. Status da comissão

* Provisionada
* A pagar
* Paga
* Cancelada
* Ajustada

## 15.6. Relatório de comissão

Filtros:

* período de recebimento;
* vendedor;
* projeto;
* empresa;
* status da comissão.

Campos do relatório:

* vendedor;
* projeto;
* valor recebido;
* percentual;
* valor da comissão;
* data base do recebimento;
* data prevista de pagamento;
* status.

## 16. Categorias Financeiras

## 16.1. Estrutura de categorias

O sistema deverá trabalhar com categoria mãe e categoria filha.

A categoria mãe deverá somar todos os lançamentos das categorias filhas.

Exemplo:

Investimento / Mobilizado — R$ 3.000,00

* Ferramentas — R$ 1.000,00
* Máq. e Equipamentos — R$ 1.000,00
* Mobiliário — R$ 1.000,00

## 16.2. Categorias principais

### Custos Financeiros

* Boletos FK
* Empréstimos
* Juros

### Impostos

* Sombrear 01
* Manzzano
* Parcelamentos S01
* Parcelamento Manzzano

### Gastos com Produção

* Matéria-prima
* Material de consumo

### Gastos com Pessoal

* Adiantamento
* Manzzano Folha
* Sombrear Folha
* Representante Comercial
* PJ
* Diaristas
* Rescisões
* FGTS
* INSS
* Vale Transporte
* Vale Alimentação
* Vale Refeição
* Uniformes / EPIs
* Premiações
* Gratificações
* Horas Extras
* Terceirização de Serviços
* Outros Gastos com Pessoal

### Gastos Fixos

* Aluguel Matriz
* Aluguel Lote
* Aluguel Casa Luziânia
* Aluguel Apartamento Valparaíso
* Assessoria Jurídica
* Contabilidade
* Energia
* Internet
* IPTU
* Material de Limpeza
* Informática
* Monitoramento
* Limpeza
* Seguros
* Sistemas
* ANTT
* Taxas
* Outros Gastos Fixos

### Pintura

* Categoria direta, sem subcategorias iniciais.

### Veículos

* IPVA
* Combustíveis
* Manutenção
* Lava-jato

### Serviços Terceirizados

* Fretes
* Locações
* Retirada de Entulho

### Ações de Marketing

* Categoria direta, sem subcategorias iniciais.

### Investimento / Mobilizado

* Ferramentas
* Máquinas e Equipamentos
* Mobiliário

### Retirada dos Sócios

* Categoria direta.

## 17. Centros de Custo

Além das categorias financeiras, o sistema deverá permitir centros de custo para melhorar a análise gerencial.

Centros de custo sugeridos:

* Administrativo
* Comercial
* Produção
* Montagem
* Engenharia
* Financeiro
* Compras
* RH
* Frota
* Marketing
* Diretoria
* Impostos
* Projeto específico

## 18. Despesas Gerais e Rateio

## 18.1. Projeto Administrativo Geral

Quando uma despesa não pertencer a um condomínio específico, ela deverá ser lançada em um projeto geral, como:

* Administrativo Geral
* Comercial Geral
* Produção Geral
* Frota Geral
* Marketing Geral

## 18.2. Opções de visualização no DRE

O DRE deverá permitir três modos:

### Sem rateio administrativo

Mostra apenas receitas e despesas diretas do projeto.

### Com rateio proporcional ao faturamento

Distribui despesas gerais entre projetos com base na participação de cada projeto no faturamento do período.

### Com rateio manual

Permite definir manualmente quanto de uma despesa geral será atribuído a cada projeto.

## 19. DRE Gerencial

## 19.1. Objetivo

Gerar demonstrativo gerencial com entradas, custos, despesas, impostos e resultado.

## 19.2. Tipos de DRE

* DRE geral da empresa
* DRE por empresa: Sombrear ou Manzzano
* DRE por projeto
* DRE por período
* DRE comparativo entre períodos
* DRE com rateio
* DRE sem rateio

## 19.3. Estrutura sugerida do DRE

1. Receita Bruta
2. Deduções / descontos
3. Receita Líquida
4. Custos Diretos

   * matéria-prima
   * material de consumo
   * mão de obra direta
   * serviços terceirizados diretos
   * fretes vinculados à obra
5. Lucro Bruto
6. Despesas Operacionais

   * administrativo
   * comercial
   * frota
   * marketing
   * sistemas
   * energia
   * aluguel
   * contabilidade
   * jurídico
7. Impostos
8. Custos Financeiros
9. Investimentos / mobilizado
10. Retiradas dos sócios
11. Resultado Final
12. Margem percentual

## 19.4. Filtros do DRE

* período: diário, semanal, quinzenal, mensal, trimestral, semestral, anual ou personalizado;
* empresa;
* projeto;
* categoria;
* centro de custo;
* vendedor;
* com rateio ou sem rateio;
* regime: competência ou caixa.

## 20. Fluxo de Caixa

## 20.1. Objetivo

Mostrar entradas e saídas previstas e realizadas, permitindo visão financeira futura da empresa.

## 20.2. Tipos de fluxo de caixa

* fluxo de caixa geral;
* fluxo de caixa por empresa;
* fluxo de caixa por conta bancária;
* fluxo de caixa por projeto;
* fluxo de caixa semanal;
* fluxo de caixa quinzenal;
* fluxo de caixa mensal;
* fluxo de caixa projetado;
* fluxo de caixa realizado.

## 20.3. Campos principais

* saldo inicial;
* entradas previstas;
* entradas realizadas;
* saídas previstas;
* saídas realizadas;
* saldo previsto;
* saldo realizado;
* diferença entre previsto e realizado.

## 21. Dashboard

## 21.1. Objetivo

Dar à diretoria uma visão rápida do estado financeiro da empresa.

## 21.2. Indicadores principais

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
* comissão a pagar;
* compras pendentes de aprovação;
* OPs geradas e não pagas;
* ranking de fornecedores;
* ranking de projetos por lucro;
* ranking de projetos por faturamento;
* margem média por projeto.

## 21.3. Visão para Wilson

A tela da diretoria deverá destacar:

* o que tem para pagar no dia;
* o que tem para pagar de sábado a sexta-feira;
* o que tem para pagar na quinzena;
* o que tem para pagar no mês;
* o que tem para receber nos mesmos períodos;
* compras/insumos a pagar;
* despesas com funcionários;
* impostos e parcelamentos;
* despesas operacionais;
* saldo projetado por conta bancária;
* OPs pendentes de pagamento.

## 22. Relatórios

## 22.1. Estrutura da seção de relatórios

O sistema deverá ter uma área específica de relatórios, onde o usuário seleciona:

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

Formatos sugeridos:

* visualizar na tela;
* exportar PDF;
* exportar Excel;
* imprimir.

## 22.2. Relatórios obrigatórios

1. Relatório de Contas a Pagar
2. Relatório de Contas a Receber
3. Relatório de Pagamentos do Dia
4. Relatório Semanal para Wilson
5. Relatório Quinzenal
6. Relatório Mensal
7. Fluxo de Caixa Geral
8. Fluxo de Caixa por Projeto
9. DRE Gerencial Geral
10. DRE por Projeto
11. DRE por Empresa
12. Relatório de Despesas por Categoria Mãe
13. Relatório de Despesas por Categoria Filha
14. Relatório de Impostos Pagos
15. Relatório de Impostos a Pagar
16. Relatório de Comissão por Vendedor
17. Relatório de Comissão Geral
18. Relatório de Funcionários e PJs
19. Relatório de Produtividade por Obra
20. Relatório de Adiantamentos e Vales
21. Relatório de Compras por Fornecedor
22. Curva S / Ranking de Fornecedores
23. Relatório de Compras Pendentes
24. Relatório de Cotações Aprovadas
25. Relatório de OPs Geradas
26. Relatório de OPs Pagas
27. Relatório de Plantão de Vendas
28. Relatório de Inadimplência
29. Relatório de Recebimentos por Forma de Pagamento
30. Relatório de Lucro/Prejuízo por Obra

## 23. Relatório de Plantão de Vendas

Filtros:

* projeto;
* vendedor;
* data do plantão;
* forma de pagamento;
* status do lançamento;
* bloco;
* apartamento;
* vaga.

Campos:

* morador;
* CPF;
* apartamento;
* bloco;
* vaga;
* valor pago;
* forma de pagamento;
* desconto;
* bonificação;
* vendedor;
* status financeiro;
* data de lançamento;
* data de validação.

Resumo final:

* total bruto lançado;
* total validado;
* total pendente;
* total recusado;
* total por forma de pagamento;
* quantidade de vagas vendidas;
* quantidade de moradores participantes.

## 24. Relatório de Compras por Fornecedor — Curva S

Objetivo: identificar quais fornecedores mais faturam para a Sombrear e onde há maior oportunidade de negociação.

Filtros:

* período;
* fornecedor;
* categoria;
* projeto;
* empresa;
* produto ou serviço.

Indicadores:

* valor total comprado por fornecedor;
* percentual de participação no total de compras;
* ranking de fornecedores;
* evolução mensal;
* principais categorias compradas;
* concentração de compras.

## 25. Relatório de Funcionário x Valor a Receber

Objetivo: mostrar quanto cada funcionário ou PJ deverá receber.

Filtros:

* período;
* funcionário;
* tipo de vínculo;
* projeto;
* empresa;
* status do pagamento.

Campos:

* salário fixo;
* produtividade;
* adiantamentos;
* vales;
* INSS;
* FGTS;
* vale alimentação;
* vale transporte;
* combustível;
* vale refeição;
* assiduidade;
* bônus;
* EPI;
* gratificação;
* descontos;
* valor líquido a pagar.

## 26. Inadimplência

A inadimplência será controlada por relatório.

Filtros:

* projeto;
* cliente/morador;
* condomínio;
* vencimento;
* status;
* valor;
* forma de pagamento.

Campos:

* cliente;
* CPF/CNPJ;
* projeto;
* apartamento;
* bloco;
* vaga;
* valor vencido;
* dias em atraso;
* origem do recebível;
* observação.

## 27. Usuários e Permissões

## 27.1. Perfis sugeridos

### Administrador

Acesso total ao sistema.

### Financeiro

Pode:

* lançar contas a pagar;
* lançar contas a receber;
* validar recebimentos;
* gerar OP;
* dar baixa em pagamentos;
* dar baixa em recebimentos;
* aprovar compras;
* gerar relatórios;
* cadastrar fornecedores, clientes e projetos.

### Wilson / Diretoria

Pode:

* visualizar dashboard;
* visualizar relatórios;
* visualizar OPs;
* visualizar contas a pagar e receber;
* visualizar DRE e fluxo de caixa;
* não precisa operar a baixa financeira, salvo se definido depois.

### Vendedor de Plantão

Pode:

* acessar apenas o módulo de Plantão de Vendas;
* lançar recebimentos;
* visualizar os próprios lançamentos;
* acompanhar status dos lançamentos.

### Compras

Pode:

* abrir solicitação de compra;
* lançar cotações;
* anexar orçamentos;
* enviar para aprovação.

### RH / Produção

Pode:

* cadastrar produtividade;
* lançar medições de mão de obra;
* lançar vales/adiantamentos, se autorizado;
* visualizar relatórios relacionados ao setor.

## 28. Regras de Negócio Principais

1. Todo lançamento financeiro deverá estar vinculado a uma empresa.
2. Todo lançamento financeiro deverá ter categoria mãe.
3. Quando houver categoria filha, ela deverá estar vinculada à categoria mãe.
4. Todo gasto deverá estar vinculado a um projeto específico ou a um projeto geral.
5. O vendedor só poderá visualizar o plantão ao qual foi vinculado.
6. Recebimento lançado pelo vendedor não entra como receita confirmada até validação do financeiro.
7. Comissão só será gerada após recebimento validado.
8. Comissão será calculada sobre valor bruto recebido.
9. Nota fiscal será cadastrada manualmente.
10. Ao lançar nota fiscal, o sistema deverá permitir provisionar impostos.
11. Imposto provisionado deverá gerar lançamento no Contas a Pagar.
12. Toda despesa deverá permitir gerar OP.
13. O pagamento só será baixado pelo financeiro.
14. Compra aprovada deverá gerar lançamento automático no Contas a Pagar.
15. Cotação vencedora não precisa ser a mais barata, mas deve ter justificativa.
16. DRE por projeto deverá permitir visão com e sem rateio administrativo.
17. Fluxo de caixa deverá separar previsto e realizado.
18. Relatórios deverão permitir filtros por período, empresa, projeto, categoria e status.
19. O sistema deverá preservar histórico de alterações relevantes.
20. Lançamentos pagos ou recebidos não devem ser apagados, apenas cancelados ou estornados com justificativa.

## 29. Modelo Inicial de Dados

## 29.1. Entidades principais

* Empresa
* Conta Bancária
* Projeto
* Cliente
* Morador
* Síndico/Responsável
* Vendedor
* Fornecedor
* Funcionário/Trabalhador
* Categoria Financeira
* Centro de Custo
* Conta a Receber
* Conta a Pagar
* Plantão de Vendas
* Lançamento de Plantão
* Nota Fiscal
* Imposto Provisionado
* Ordem de Pagamento
* Solicitação de Compra
* Cotação
* Compra Aprovada
* Comissão
* Produtividade
* Relatório
* Usuário
* Perfil de Permissão

## 29.2. Relacionamentos principais

* Uma empresa possui várias contas bancárias.
* Uma empresa possui vários projetos.
* Um projeto possui vários recebíveis.
* Um projeto possui várias despesas.
* Um projeto pode ter vários vendedores vinculados, mas deve ter um vendedor principal.
* Um plantão pertence a um projeto.
* Um lançamento de plantão pertence a um plantão.
* Um lançamento de plantão gera um Contas a Receber pendente.
* Um recebimento validado pode gerar comissão.
* Uma nota fiscal pode gerar um imposto provisionado.
* Um imposto provisionado gera um Contas a Pagar.
* Uma compra aprovada gera um ou mais lançamentos no Contas a Pagar.
* Uma despesa pode gerar uma OP.
* Um funcionário pode ter vários lançamentos de produtividade.
* Um lançamento de produtividade pode gerar uma despesa no Contas a Pagar.

## 30. Telas Principais

## 30.1. Dashboard

Tela com cards, gráficos e alertas financeiros.

## 30.2. Projetos

Lista de projetos com filtros e tela individual por projeto.

Dentro da pasta do projeto:

* dados gerais;
* contrato/aditivos;
* recebimentos;
* despesas;
* plantões;
* notas fiscais;
* impostos;
* compras;
* mão de obra;
* comissões;
* DRE do projeto;
* fluxo de caixa do projeto;
* anexos.

## 30.3. Plantão de Vendas

Tela simplificada para vendedor e tela gerencial para financeiro.

## 30.4. Contas a Receber

Tabela com filtros, validação e baixa.

## 30.5. Contas a Pagar

Tabela com filtros, geração de OP e baixa.

## 30.6. Compras

Solicitações, cotações, aprovação e integração com contas a pagar.

## 30.7. RH / Mão de Obra

Cadastro, produtividade, vales, adiantamentos e pagamentos.

## 30.8. Relatórios

Central de relatórios com filtros e exportações.

## 30.9. Cadastros

Cadastros auxiliares do sistema.

## 31. Fases de Desenvolvimento Recomendadas

## Fase 1 — Base financeira essencial

* Empresas
* Contas bancárias
* Projetos
* Fornecedores
* Categorias
* Contas a pagar
* Contas a receber
* OP
* Dashboard básico

## Fase 2 — Plantão de vendas

* Cadastro de plantão
* Acesso simplificado do vendedor
* Lançamento por morador/unidade/vaga
* Validação financeira
* Relatório de fechamento do plantão

## Fase 3 — Compras

* Solicitação de compra
* Três cotações
* Escolha justificada
* Aprovação pelo financeiro
* Integração com contas a pagar

## Fase 4 — RH e produtividade

* Cadastro de funcionários/PJs
* Lançamento de produtividade
* Vales/adiantamentos
* Relatório de pagamento
* Integração com contas a pagar

## Fase 5 — Relatórios gerenciais

* DRE geral
* DRE por projeto
* Fluxo de caixa
* Comissões
* Impostos
* Curva S de fornecedores
* Inadimplência

## Fase 6 — Refinamentos

* Controle avançado de permissões
* Logs de auditoria
* Exportações avançadas
* Comparativo entre períodos
* Melhorias visuais no dashboard

## 32. Critérios de Aceitação do Sistema

O sistema será considerado funcional quando permitir:

1. Cadastrar empresas, contas, projetos, fornecedores, vendedores e categorias.
2. Lançar contas a receber por contrato, plantão, medição ou parcela.
3. Lançar contas a pagar por projeto, categoria e empresa.
4. Gerar OP imprimível para cada despesa.
5. Dar baixa em pagamentos e recebimentos.
6. Permitir vendedor lançar recebimento de plantão com acesso restrito.
7. Permitir financeiro validar recebimentos de plantão.
8. Gerar relatório final de plantão por unidade, apartamento, bloco e vaga.
9. Cadastrar notas fiscais manualmente.
10. Provisionar impostos a partir da nota fiscal.
11. Controlar compras com três cotações.
12. Gerar contas a pagar a partir de compra aprovada.
13. Controlar funcionários, PJs, produtividade e vales.
14. Gerar relatório de comissão por vendedor.
15. Gerar DRE com e sem rateio administrativo.
16. Gerar fluxo de caixa geral e por projeto.
17. Gerar relatórios por período, empresa, projeto, categoria e status.
18. Mostrar no dashboard o que a diretoria precisa pagar e receber.

## 33. Próxima Etapa Recomendada

A próxima etapa deve ser transformar este plano funcional em um PRD técnico para desenvolvimento, contendo:

* requisitos funcionais numerados;
* requisitos não funcionais;
* papéis e permissões em matriz;
* fluxos em formato de jornada;
* modelo de banco de dados mais detalhado;
* telas e componentes;
* regras de validação;
* backlog por sprint;
* prompt final para o engenheiro de software desenvolver o sistema.
