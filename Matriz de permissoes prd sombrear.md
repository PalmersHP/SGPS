# MATRIZ DE PERMISSÕES — SISTEMA FINANCEIRO SOMBREAR

## 1. Objetivo

Esta matriz define os níveis de acesso de cada perfil de usuário dentro do Sistema Financeiro Sombrear.

A regra central é: cada usuário deve acessar apenas as informações necessárias para executar sua função. Dados estratégicos, saldos bancários, DRE, relatórios gerenciais, contas a pagar, contas a receber e informações sensíveis devem ser restritos conforme o perfil.

---

## 2. Legenda de Permissões

| Sigla | Significado |
|---|---|
| NA | Não acessa |
| V | Visualiza |
| C | Cria / cadastra |
| E | Edita |
| EX | Exporta / imprime |
| A | Aprova / valida |
| B | Dá baixa financeira |
| G | Gera documento ou lançamento |
| ADM | Acesso administrativo total |

Quando houver mais de uma sigla, significa que o perfil acumula aquelas permissões.

Exemplo: **V / C / E** = visualiza, cria e edita.

---

## 3. Perfis do Sistema

| Perfil | Descrição |
|---|---|
| Administrador | Usuário com acesso total ao sistema, configurações, permissões e cadastros estruturais. |
| Financeiro | Usuário responsável pela operação financeira: contas a pagar, contas a receber, validações, baixas, OPs, compras aprovadas, notas, impostos e relatórios. |
| Diretoria / Wilson | Usuário de visão gerencial. Visualiza dashboard, relatórios, OPs, contas, DRE e fluxo de caixa, mas não executa a operação financeira diária. |
| Vendedor de Plantão | Usuário restrito ao lançamento de recebimentos de plantão, vinculados aos condomínios/projetos permitidos. |
| Compras | Usuário responsável por solicitações de compras, cotações e envio para aprovação do financeiro. |
| RH / Produção | Usuário responsável por lançamentos de mão de obra, produtividade, vales e informações operacionais vinculadas a trabalhadores. |

---

# 4. Matriz Geral por Módulo

| Módulo / Área | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Dashboard Geral | ADM | V | V | NA | V parcial | V parcial |
| Dashboard Diretoria | ADM | V | V | NA | NA | NA |
| Empresas | ADM | V / C / E | V | NA | NA | NA |
| Contas Bancárias | ADM | V / C / E | V | NA | NA | NA |
| Projetos / Condomínios | ADM | V / C / E | V | V parcial | V parcial | V parcial |
| Clientes / Moradores | ADM | V / C / E | V | C / V parcial | V parcial | NA |
| Síndicos / Responsáveis | ADM | V / C / E | V | V parcial | NA | NA |
| Vendedores | ADM | V / C / E | V | NA | NA | NA |
| Fornecedores | ADM | V / C / E | V | NA | V / C / E | NA |
| Funcionários / PJs | ADM | V / C / E | V gerencial | NA | NA | V / C / E parcial |
| Categorias Financeiras | ADM | V / C / E | V | NA | V | V parcial |
| Centros de Custo | ADM | V / C / E | V | NA | V | V parcial |
| Formas de Pagamento | ADM | V / C / E | V | V | V | V |
| Tipos de Cobertura | ADM | V / C / E | V | V parcial | V parcial | V parcial |
| Tipos de Produtividade | ADM | V / C / E | V | NA | NA | V / C / E |
| Usuários e Permissões | ADM | NA | NA | NA | NA | NA |
| Auditoria / Logs | ADM | V parcial | V parcial | NA | NA | NA |

---

# 5. Matriz — Projetos / Condomínios

| Ação em Projetos | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar lista de projetos | ADM | V | V | V parcial | V parcial | V parcial |
| Criar projeto | ADM | C | NA | NA | NA | NA |
| Editar dados cadastrais do projeto | ADM | E | NA | NA | NA | NA |
| Visualizar pasta do projeto | ADM | V | V | V parcial | V parcial | V parcial |
| Visualizar contrato/aditivos | ADM | V | V | NA | NA | NA |
| Anexar contrato/aditivo | ADM | C / E | NA | NA | NA | NA |
| Visualizar recebimentos do projeto | ADM | V | V | NA | NA | NA |
| Visualizar despesas do projeto | ADM | V | V | NA | NA | NA |
| Visualizar compras do projeto | ADM | V | V | NA | V | NA |
| Visualizar mão de obra do projeto | ADM | V | V | NA | NA | V |
| Visualizar DRE do projeto | ADM | V | V | NA | NA | NA |
| Visualizar fluxo de caixa do projeto | ADM | V | V | NA | NA | NA |
| Encerrar projeto | ADM | E | NA | NA | NA | NA |
| Cancelar projeto | ADM | E | NA | NA | NA | NA |

**Regra:** o Vendedor de Plantão só poderá visualizar o nome do projeto/condomínio ao qual está vinculado e os lançamentos feitos por ele, sem acesso à pasta financeira completa.

---

# 6. Matriz — Plantão de Vendas

| Ação no Plantão de Vendas | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Criar plantão | ADM | C | NA | NA | NA | NA |
| Editar plantão | ADM | E | NA | NA | NA | NA |
| Encerrar plantão | ADM | E | V | NA | NA | NA |
| Cancelar plantão | ADM | E | NA | NA | NA | NA |
| Vincular vendedor ao plantão | ADM | C / E | NA | NA | NA | NA |
| Visualizar plantões ativos | ADM | V | V | V parcial | NA | NA |
| Lançar recebimento de morador | ADM | C | NA | C | NA | NA |
| Editar lançamento em rascunho | ADM | E | NA | E próprio | NA | NA |
| Editar lançamento enviado | ADM | E | NA | NA | NA | NA |
| Corrigir lançamento devolvido | ADM | E | NA | E próprio | NA | NA |
| Anexar comprovante | ADM | C / E | NA | C / E próprio | NA | NA |
| Visualizar lançamentos próprios | ADM | V | NA | V próprio | NA | NA |
| Visualizar todos os lançamentos do plantão | ADM | V | V | NA | NA | NA |
| Validar recebimento | ADM | A | NA | NA | NA | NA |
| Recusar recebimento | ADM | A | NA | NA | NA | NA |
| Devolver para correção | ADM | A | NA | NA | NA | NA |
| Gerar recebível no Contas a Receber | ADM | G | NA | G automático | NA | NA |
| Gerar relatório de fechamento | ADM | V / EX | V / EX | NA | NA | NA |

**Regra crítica:** todo lançamento feito pelo vendedor deve nascer como **Pendente de Validação**. Ele só vira receita confirmada após validação do financeiro.

---

# 7. Matriz — Contas a Receber

| Ação em Contas a Receber | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar contas a receber | ADM | V | V | NA | NA | NA |
| Criar recebível manual | ADM | C | NA | NA | NA | NA |
| Editar recebível em aberto | ADM | E | NA | NA | NA | NA |
| Editar recebível validado | ADM | E com justificativa | NA | NA | NA | NA |
| Criar recebível via plantão | ADM | G | NA | G automático | NA | NA |
| Validar recebível de plantão | ADM | A | NA | NA | NA | NA |
| Baixar recebimento | ADM | B | NA | NA | NA | NA |
| Baixa parcial | ADM | B | NA | NA | NA | NA |
| Marcar como vencido | Automático / ADM | Automático | V | NA | NA | NA |
| Cancelar recebível | ADM | E com justificativa | NA | NA | NA | NA |
| Anexar comprovante | ADM | C / E | NA | C próprio no plantão | NA | NA |
| Anexar nota fiscal | ADM | C / E | NA | NA | NA | NA |
| Visualizar nota fiscal vinculada | ADM | V | V | NA | NA | NA |
| Exportar relatório | ADM | EX | EX | NA | NA | NA |

---

# 8. Matriz — Contas a Pagar

| Ação em Contas a Pagar | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar contas a pagar | ADM | V | V | NA | NA | NA |
| Criar despesa manual | ADM | C | NA | NA | NA | NA |
| Criar despesa a partir de compra aprovada | ADM | G | V | NA | G automático | NA |
| Criar despesa a partir de imposto | ADM | G | V | NA | NA | NA |
| Criar despesa a partir de produtividade | ADM | G | V | NA | NA | G automático após aprovação |
| Editar despesa em aberto | ADM | E | NA | NA | NA | NA |
| Editar despesa com OP gerada | ADM | E com justificativa | NA | NA | NA | NA |
| Editar despesa paga | ADM com estorno | NA | NA | NA | NA | NA |
| Gerar OP | ADM | G | V | NA | NA | NA |
| Visualizar OP | ADM | V | V | NA | NA | NA |
| Imprimir OP | ADM | EX | EX | NA | NA | NA |
| Marcar como pago | ADM | B | NA | NA | NA | NA |
| Anexar comprovante de pagamento | ADM | C / E | NA | NA | NA | NA |
| Cancelar despesa | ADM | E com justificativa | NA | NA | NA | NA |
| Visualizar vencidos | ADM | V | V | NA | NA | NA |
| Exportar relatório | ADM | EX | EX | NA | NA | NA |

**Regra crítica:** Wilson visualiza e usa a OP como validação física, mas a baixa operacional no sistema é feita pelo Financeiro.

---

# 9. Matriz — Ordem de Pagamento — OP

| Ação em OP | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Gerar OP | ADM | G | NA | NA | NA | NA |
| Visualizar OP | ADM | V | V | NA | NA | NA |
| Imprimir OP | ADM | EX | EX | NA | NA | NA |
| Cancelar OP | ADM | E com justificativa | NA | NA | NA | NA |
| Marcar OP como paga | ADM | B automático ao pagar despesa | V | NA | NA | NA |
| Ver histórico da OP | ADM | V | V | NA | NA | NA |
| Exportar PDF da OP | ADM | EX | EX | NA | NA | NA |

---

# 10. Matriz — Compras e Cotações

| Ação em Compras | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar solicitações de compra | ADM | V | V | NA | V | V parcial |
| Criar solicitação de compra | ADM | C | NA | NA | C | C parcial |
| Editar solicitação em rascunho | ADM | E | NA | NA | E própria | E própria |
| Cancelar solicitação | ADM | E | NA | NA | E própria antes de aprovação | NA |
| Lançar cotação 1 | ADM | C / E | NA | NA | C / E | NA |
| Lançar cotação 2 | ADM | C / E | NA | NA | C / E | NA |
| Lançar cotação 3 | ADM | C / E | NA | NA | C / E | NA |
| Anexar orçamento | ADM | C / E | NA | NA | C / E | NA |
| Selecionar cotação recomendada | ADM | E | NA | NA | E | NA |
| Justificar escolha | ADM | E | NA | NA | E | NA |
| Aprovar compra | ADM | A | NA | NA | NA | NA |
| Reprovar compra | ADM | A | NA | NA | NA | NA |
| Gerar contas a pagar após aprovação | ADM | G | V | NA | G automático | NA |
| Visualizar compras aprovadas | ADM | V | V | NA | V | V parcial |
| Exportar relatório de compras | ADM | EX | EX | NA | EX parcial | NA |

**Regra:** a área de Compras pode instruir e cotar, mas a aprovação final é do Financeiro.

---

# 11. Matriz — Notas Fiscais e Impostos

| Ação em Notas / Impostos | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar notas fiscais | ADM | V | V | NA | NA | NA |
| Cadastrar nota fiscal manual | ADM | C | NA | NA | NA | NA |
| Editar nota fiscal | ADM | E | NA | NA | NA | NA |
| Anexar nota fiscal | ADM | C / E | NA | NA | NA | NA |
| Informar descrição da nota | ADM | C / E | NA | NA | NA | NA |
| Provisionar imposto | ADM | C / E | V | NA | NA | NA |
| Informar percentual de imposto | ADM | C / E | NA | NA | NA | NA |
| Gerar contas a pagar de imposto | ADM | G | V | NA | NA | NA |
| Baixar imposto pago | ADM | B | NA | NA | NA | NA |
| Relatório de impostos pagos | ADM | EX | EX | NA | NA | NA |
| Relatório de impostos a pagar | ADM | EX | EX | NA | NA | NA |

---

# 12. Matriz — RH / Mão de Obra / Produtividade

| Ação em RH / Produção | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar trabalhadores | ADM | V | V gerencial | NA | NA | V |
| Cadastrar trabalhador | ADM | C / E | NA | NA | NA | C / E parcial |
| Editar dados do trabalhador | ADM | E | NA | NA | NA | E parcial |
| Lançar produtividade | ADM | C / E | NA | NA | NA | C / E |
| Aprovar produtividade para pagamento | ADM | A | NA | NA | NA | A parcial, se autorizado |
| Gerar contas a pagar de produtividade | ADM | G | V | NA | NA | G automático após aprovação |
| Lançar vale / adiantamento | ADM | C / E | V | NA | NA | C / E parcial |
| Lançar bônus / gratificação | ADM | C / E | V | NA | NA | C / E parcial |
| Lançar desconto | ADM | C / E | V | NA | NA | C / E parcial |
| Visualizar valor a receber por trabalhador | ADM | V | V gerencial | NA | NA | V parcial |
| Exportar relatório RH | ADM | EX | EX | NA | NA | EX parcial |

**Observação:** se a empresa preferir maior controle, a aprovação final da produtividade deve ficar com o Financeiro, e RH/Produção apenas lança a medição.

---

# 13. Matriz — Comissões

| Ação em Comissões | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar comissões gerais | ADM | V | V | NA | NA | NA |
| Visualizar comissão própria | ADM | V | V | V própria, se liberado | NA | NA |
| Configurar percentual por projeto | ADM | C / E | NA | NA | NA | NA |
| Gerar comissão por recebimento validado | ADM | G automático | V | NA | NA | NA |
| Ajustar comissão | ADM | E com justificativa | NA | NA | NA | NA |
| Cancelar comissão | ADM | E com justificativa | NA | NA | NA | NA |
| Marcar comissão como paga | ADM | B | NA | NA | NA | NA |
| Gerar contas a pagar de comissão | ADM | G | V | NA | NA | NA |
| Relatório por vendedor | ADM | EX | EX | V próprio, se liberado | NA | NA |
| Relatório geral de comissões | ADM | EX | EX | NA | NA | NA |

**Regra crítica:** comissão só deve ser gerada sobre recebimento validado e com base no valor bruto recebido.

---

# 14. Matriz — DRE e Fluxo de Caixa

| Ação em DRE / Fluxo de Caixa | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Visualizar DRE geral | ADM | V | V | NA | NA | NA |
| Visualizar DRE por empresa | ADM | V | V | NA | NA | NA |
| Visualizar DRE por projeto | ADM | V | V | NA | NA | NA |
| Gerar DRE com rateio | ADM | G / EX | G / EX | NA | NA | NA |
| Gerar DRE sem rateio | ADM | G / EX | G / EX | NA | NA | NA |
| Gerar DRE com rateio manual | ADM | G / EX | V | NA | NA | NA |
| Visualizar fluxo de caixa geral | ADM | V | V | NA | NA | NA |
| Visualizar fluxo por empresa | ADM | V | V | NA | NA | NA |
| Visualizar fluxo por projeto | ADM | V | V | NA | NA | NA |
| Visualizar fluxo por conta bancária | ADM | V | V | NA | NA | NA |
| Exportar DRE | ADM | EX | EX | NA | NA | NA |
| Exportar fluxo de caixa | ADM | EX | EX | NA | NA | NA |

---

# 15. Matriz — Relatórios

| Relatório | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Contas a Pagar | ADM | EX | EX | NA | NA | NA |
| Contas a Receber | ADM | EX | EX | NA | NA | NA |
| Pagamentos do Dia | ADM | EX | EX | NA | NA | NA |
| Relatório Semanal para Wilson | ADM | EX | EX | NA | NA | NA |
| Relatório Quinzenal | ADM | EX | EX | NA | NA | NA |
| Relatório Mensal | ADM | EX | EX | NA | NA | NA |
| Fluxo de Caixa Geral | ADM | EX | EX | NA | NA | NA |
| Fluxo de Caixa por Projeto | ADM | EX | EX | NA | NA | NA |
| DRE Geral | ADM | EX | EX | NA | NA | NA |
| DRE por Projeto | ADM | EX | EX | NA | NA | NA |
| DRE por Empresa | ADM | EX | EX | NA | NA | NA |
| Despesas por Categoria Mãe | ADM | EX | EX | NA | NA | NA |
| Despesas por Categoria Filha | ADM | EX | EX | NA | NA | NA |
| Impostos Pagos | ADM | EX | EX | NA | NA | NA |
| Impostos a Pagar | ADM | EX | EX | NA | NA | NA |
| Comissão por Vendedor | ADM | EX | EX | V próprio, se liberado | NA | NA |
| Comissão Geral | ADM | EX | EX | NA | NA | NA |
| Funcionários e PJs | ADM | EX | EX | NA | NA | EX parcial |
| Produtividade por Obra | ADM | EX | EX | NA | NA | EX parcial |
| Adiantamentos e Vales | ADM | EX | EX | NA | NA | EX parcial |
| Compras por Fornecedor | ADM | EX | EX | NA | EX parcial | NA |
| Curva S / Ranking de Fornecedores | ADM | EX | EX | NA | EX parcial | NA |
| Compras Pendentes | ADM | EX | EX | NA | EX parcial | NA |
| Cotações Aprovadas | ADM | EX | EX | NA | EX parcial | NA |
| OPs Geradas | ADM | EX | EX | NA | NA | NA |
| OPs Pagas | ADM | EX | EX | NA | NA | NA |
| Plantão de Vendas | ADM | EX | EX | V próprio, se liberado | NA | NA |
| Inadimplência | ADM | EX | EX | NA | NA | NA |
| Recebimentos por Forma de Pagamento | ADM | EX | EX | NA | NA | NA |
| Lucro / Prejuízo por Obra | ADM | EX | EX | NA | NA | NA |

---

# 16. Matriz — Cadastros

| Cadastro | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Empresas | ADM | V / C / E | V | NA | NA | NA |
| Contas Bancárias | ADM | V / C / E | V | NA | NA | NA |
| Projetos / Condomínios | ADM | V / C / E | V | V parcial | V parcial | V parcial |
| Clientes / Moradores | ADM | V / C / E | V | C / V parcial | NA | NA |
| Síndicos / Responsáveis | ADM | V / C / E | V | V parcial | NA | NA |
| Vendedores | ADM | V / C / E | V | NA | NA | NA |
| Fornecedores | ADM | V / C / E | V | NA | V / C / E | NA |
| Funcionários CLT | ADM | V / C / E | V gerencial | NA | NA | V / C / E parcial |
| Trabalhadores PJ | ADM | V / C / E | V gerencial | NA | NA | V / C / E parcial |
| Categorias Financeiras | ADM | V / C / E | V | NA | V | V parcial |
| Centros de Custo | ADM | V / C / E | V | NA | V | V parcial |
| Formas de Pagamento | ADM | V / C / E | V | V | V | V |
| Tipos de Cobertura | ADM | V / C / E | V | V | V | V |
| Tipos de Produtividade | ADM | V / C / E | V | NA | NA | V / C / E |
| Usuários | ADM | NA | NA | NA | NA | NA |
| Perfis de Permissão | ADM | NA | NA | NA | NA | NA |

---

# 17. Matriz — Anexos e Documentos

| Tipo de Anexo / Documento | Administrador | Financeiro | Diretoria / Wilson | Vendedor de Plantão | Compras | RH / Produção |
|---|---:|---:|---:|---:|---:|---:|
| Contratos | ADM | C / E / V | V | NA | NA | NA |
| Aditivos | ADM | C / E / V | V | NA | NA | NA |
| Notas Fiscais | ADM | C / E / V | V | NA | NA | NA |
| Boletos | ADM | C / E / V | V | NA | NA | NA |
| Comprovantes de Pagamento | ADM | C / E / V | V | NA | NA | NA |
| Comprovantes de Recebimento | ADM | C / E / V | V | C próprio no plantão | NA | NA |
| Orçamentos de Fornecedores | ADM | C / E / V | V | NA | C / E / V | NA |
| Documentos de Funcionários/PJs | ADM | C / E / V | V gerencial | NA | NA | C / E / V parcial |
| OP em PDF | ADM | G / EX / V | V / EX | NA | NA | NA |
| Relatórios em PDF | ADM | EX | EX | NA | EX parcial | EX parcial |
| Relatórios em Excel | ADM | EX | EX | NA | EX parcial | EX parcial |

---

# 18. Regras de Restrição por Perfil

## 18.1. Vendedor de Plantão

O vendedor não pode:

- acessar dashboard financeiro;
- acessar contas a pagar;
- acessar contas a receber geral;
- visualizar saldos bancários;
- visualizar DRE;
- visualizar fluxo de caixa;
- visualizar despesas;
- visualizar fornecedores;
- visualizar RH;
- visualizar comissões gerais;
- visualizar relatórios gerenciais;
- editar lançamentos já validados;
- validar recebimentos;
- baixar recebimentos.

O vendedor pode:

- acessar apenas plantões vinculados ao próprio usuário;
- lançar recebimentos de moradores;
- anexar comprovantes;
- visualizar status dos próprios lançamentos;
- corrigir lançamentos devolvidos pelo financeiro.

## 18.2. Diretoria / Wilson

A diretoria pode:

- visualizar informações gerenciais;
- visualizar OPs;
- imprimir OPs;
- visualizar contas a pagar e receber;
- visualizar DRE;
- visualizar fluxo de caixa;
- exportar relatórios.

A diretoria não opera, por padrão:

- baixa de pagamentos;
- baixa de recebimentos;
- edição de lançamentos;
- aprovação técnica de compras dentro do sistema;
- alteração de cadastros financeiros.

## 18.3. Compras

Compras pode:

- solicitar compras;
- lançar cotações;
- anexar orçamentos;
- recomendar fornecedor;
- justificar escolha.

Compras não pode:

- aprovar compra final;
- dar baixa em pagamento;
- acessar DRE;
- acessar fluxo de caixa;
- acessar saldos bancários;
- visualizar contas a pagar gerais, salvo lançamentos originados das próprias compras, se liberado.

## 18.4. RH / Produção

RH/Produção pode:

- cadastrar trabalhadores, se autorizado;
- lançar produtividade;
- lançar vales e adiantamentos, se autorizado;
- gerar dados para pagamento.

RH/Produção não pode:

- dar baixa em pagamentos;
- acessar contas bancárias;
- acessar DRE geral;
- aprovar pagamentos finais;
- visualizar relatórios financeiros completos.

## 18.5. Financeiro

Financeiro pode operar o sistema financeiro, incluindo:

- contas a pagar;
- contas a receber;
- validação de plantões;
- OP;
- baixas;
- notas;
- impostos;
- compras aprovadas;
- relatórios.

Financeiro não deve alterar permissões de usuários, salvo se também tiver perfil de administrador.

---

# 19. Regras de Auditoria por Permissão

As ações abaixo devem gerar log obrigatório:

| Ação | Log obrigatório? | Justificativa obrigatória? |
|---|---:|---:|
| Criar despesa | Sim | Não |
| Editar valor de despesa | Sim | Sim |
| Editar vencimento de despesa | Sim | Sim |
| Gerar OP | Sim | Não |
| Cancelar OP | Sim | Sim |
| Marcar despesa como paga | Sim | Não |
| Estornar pagamento | Sim | Sim |
| Criar recebível | Sim | Não |
| Validar recebimento de plantão | Sim | Não |
| Recusar recebimento de plantão | Sim | Sim |
| Baixar recebimento | Sim | Não |
| Estornar recebimento | Sim | Sim |
| Alterar comissão | Sim | Sim |
| Cancelar comissão | Sim | Sim |
| Aprovar compra | Sim | Não |
| Reprovar compra | Sim | Sim |
| Alterar percentual de imposto | Sim | Sim |
| Cancelar lançamento financeiro | Sim | Sim |
| Alterar permissões de usuário | Sim | Sim |

---

# 20. Regras Técnicas para Implementação

1. Implementar controle de acesso por perfil.
2. Implementar, se possível, permissões granulares por ação.
3. Implementar escopo por projeto para vendedores.
4. O vendedor só pode consultar dados em que `sales_shift.seller_id = current_user.seller_id`.
5. O vendedor só pode editar lançamento com status `Rascunho` ou `Pendente de correção`.
6. Lançamento com status `Validado` não pode ser editado pelo vendedor.
7. Usuários de Compras só podem editar solicitações próprias enquanto não aprovadas.
8. Usuários de RH/Produção só podem alterar produtividade enquanto não transformada em contas a pagar.
9. Lançamentos pagos ou recebidos não podem ser excluídos fisicamente.
10. Cancelamentos e estornos exigem justificativa.
11. Relatórios devem respeitar as permissões do usuário logado.
12. Todos os acessos a dados sensíveis devem passar pelo backend, nunca apenas por bloqueio visual no front-end.

---

# 21. Resumo de Permissões Críticas

| Regra Crítica | Aplicação |
|---|---|
| Vendedor não acessa financeiro geral | Bloqueio total de dashboard, DRE, fluxo, contas a pagar e contas a receber geral. |
| Plantão gera recebível pendente | Todo lançamento do vendedor entra no Contas a Receber como Pendente de Validação. |
| Financeiro valida recebimento | Apenas Financeiro ou Administrador podem validar recebimento de plantão. |
| Wilson visualiza, mas não opera baixa | Diretoria acessa relatórios e OPs, mas não baixa pagamentos por padrão. |
| OP é obrigatoriamente vinculada a uma despesa | Nenhuma OP deve existir solta, sem contas a pagar relacionado. |
| Compra aprovada gera contas a pagar | Após aprovação do Financeiro, o sistema cria as parcelas no Contas a Pagar. |
| Nota fiscal pode gerar imposto | Percentual manual informado gera lançamento de imposto no Contas a Pagar. |
| Comissão nasce após recebimento validado | Comissão calculada sobre valor bruto recebido e validado. |
| DRE pode ter ou não rateio | Usuário escolhe o modo do relatório. |
| Logs obrigatórios | Toda ação crítica deve gerar trilha de auditoria. |
