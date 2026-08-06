Desenvolva um aplicativo web para geração rápida de contratos da Sombrear, empresa especializada em coberturas para garagens de condomínios.

O sistema deverá gerar uma minuta contratual em DOCX, com cláusulas padronizadas, campos variáveis e possibilidade de edição manual antes da exportação. O objetivo é que a equipe preencha os dados principais da obra e o sistema monte automaticamente o contrato, mantendo o padrão técnico, jurídico e visual da Sombrear. O arquivo gerado será encaminhado posteriormente ao jurídico para revisão final.

## 1. Objetivo do sistema

Criar um gerador de contratos para coberturas da Sombrear, com foco em:

- Reduzir tempo de elaboração de contratos.
- Padronizar cláusulas contratuais.
- Evitar erros de cópia e edição manual.
- Permitir contratos com mais de um tipo de cobertura e mais de uma fundação.
- Gerar arquivo final em .DOCX editável.
- Permitir configuração futura de cláusulas, dados da empresa, logo e modelo visual.

## 2. Tipos de cobertura que o sistema deve contemplar

O sistema deverá permitir selecionar um ou mais itens de cobertura no mesmo contrato.

Tipos principais:

1. Sombrite em Solo — Chumbação direta
2. Sombrite em Solo — Chumbador parafusado
3. Sombrite em Laje — Parafusado
4. Telha Galvalume em Solo — Chumbação direta
5. Telha Galvalume em Laje — Parafusado
6. Telha Termoacústica com EPS 30 mm
7. Telha Termoacústica com PIR 30 mm

Observação: no cadastro, deixar “PIR” como nomenclatura técnica, mas permitir alias/editável como “Pier”, caso a equipe use esse termo internamente.

## 3. Variáveis técnicas por cobertura

Cada item de cobertura deve permitir preencher:

- Tipo de cobertura.
- Quantidade de vagas/coberturas.
- Quantidade de módulos.
- Módulos de 2, 3 ou 4 vagas.
- Cor da estrutura: Branco ou Preto.
- Tipo de pintura: pintura eletrostática a pó de poliéster.
- Tipo de fundação.
- Altura padrão.
- Medida padrão da vaga.
- Observações específicas.
- Campo para vagas fora do esquadro.
- Campo para vagas especiais com medidas diferentes.
- Campo para anexos/projeto técnico.

### 3.1. Sombrite

Campos específicos:

- Cor da tela:
  - Prata
  - Azul
  - Vermelho
  - Bege
- Tipo de tela: polietileno decorativo/permeável de alta densidade.
- Costura: costura dupla em fio náutico.
- Sistema de travamento: cabo de aço com sistema gripple.
- Variação lateral padrão: 10 cm a 30 cm, com possibilidade de variação maior quando houver empecilhos, desalinhamento ou fora de esquadro.
- Campo para informar se há tela complementar/costura adicional.

### 3.2. Telha Galvalume

Campos específicos:

- Telha: aço galvalume branca.
- Estrutura com pintura eletrostática: branca ou preta.
- Campo para informar se possui backer/inferior branco, quando aplicável.
- Campo para acessórios inclusos ou não inclusos:
  - Calhas
  - Rufos
  - Iluminação
  - Suporte de bicicletas
  - Outros

### 3.3. Telha Termoacústica

Campos específicos:

- Tipo:
  - Termoacústica EPS 30 mm
  - Termoacústica PIR 30 mm
- Acabamento da telha: branca.
- Campo para observações de conforto térmico/acústico.
- Campo para indicar se será aplicada em laje, solo ou área sensível próxima a apartamentos.

## 4. Tipos de fundação

O sistema deverá permitir cadastrar uma ou mais fundações no mesmo contrato.

### 4.1. Solo — Chumbação direta

Texto técnico-base:

“Fundação direta, com execução de estaca moldada no local, profundidade e diâmetro definidos conforme projeto e condições do solo, executada por escavação manual ou mecanizada. A estaca será concretada com concreto estrutural, devidamente adensado, garantindo resistência e durabilidade ao elemento de fundação. Como elemento de armadura, confinamento e transferência de cargas, será utilizado tubo metálico em aço carbono, equipado com travas metálicas soldadas, conforme metodologia executiva da Sombrear.”

Permitir editar:

- Profundidade.
- Diâmetro.
- FCK.
- Tipo de tubo.
- Se haverá sapata complementar.
- Observações de solo.

### 4.2. Solo — Chumbador parafusado

Texto técnico-base:

“Fixação mecânica sobre base de concreto existente, por meio de chapa base metálica nivelada e alinhada, fixada com ancoragens mecânicas estruturais tipo parafuso/chumbador, dimensionadas conforme carga atuante e características do concreto existente, garantindo a transferência segura dos esforços da estrutura para o elemento de apoio.”

Permitir editar:

- Espessura da chapa base.
- Número de chumbadores/parafusos.
- Tipo de ancoragem.
- Observações de base existente.
- Necessidade de teste de arranque.

### 4.3. Laje — Parafusado

Texto técnico-base:

“Fixação em laje por meio de chapa base metálica e ancoragens mecânicas estruturais, dimensionadas conforme carga atuante e características do concreto existente. Após a instalação das ancoragens, será executada a vedação perimetral da chapa base com adesivo selante híbrido monocomponente, à base de polímero modificado silicone–poliuretano, visando proteção e estanqueidade nos pontos de fixação.”

Permitir editar:

- Espessura da chapa base.
- Número de ancoragens.
- Tipo de selante.
- Garantia específica da fixação na laje.
- Campo para informar se há projeto estrutural ou teste de arranque.

### 4.4. Fundação mista

Permitir que o contrato tenha mais de uma fundação no mesmo objeto.

Exemplo:

- Bloco A: Sombrite em solo com chumbação direta.
- Bloco B: Telha Galvalume em laje parafusada.
- Vagas especiais: fundação parafusada em base de concreto existente.

O sistema deverá gerar o objeto do contrato por itens numerados:

Item 1 — Cobertura X  
Item 2 — Cobertura Y  
Item 3 — Fundação específica ou observação técnica adicional.

## 5. Dados cadastrais do contrato

Criar formulário com os seguintes blocos:

### 5.1. Dados do contrato

- Número do contrato.
- Data de emissão.
- Cidade/UF de assinatura.
- Tipo de contrato:
  - Compra e venda
  - Empreitada global
  - Aditivo contratual
- Status:
  - Rascunho
  - Gerado
  - Enviado ao jurídico
  - Revisado
  - Aprovado
  - Assinado

### 5.2. Dados do condomínio/contratante

- Razão social/nome do condomínio.
- CNPJ.
- Endereço completo.
- Cidade.
- Estado.
- CEP.
- Cadastro estadual, se houver.
- Nome do síndico ou representante.
- Nacionalidade.
- Estado civil.
- Profissão/cargo.
- RG.
- CPF.
- Endereço do representante, se necessário.
- Unidade/apartamento do síndico, se necessário.
- Ata de eleição:
  - Tipo de assembleia.
  - Data da assembleia.
  - Mandato até.
  - Campo para observação.
- Assembleia que aprovou a contratação:
  - Data da assembleia.
  - Tipo de assembleia.
  - Texto de aprovação.

### 5.3. Dados da contratada

Criar em “Configurações da Empresa”, para não precisar preencher sempre:

- Razão social 1.
- CNPJ 1.
- Endereço.
- Inscrição estadual.
- Representante legal.
- RG.
- CPF.
- Estado civil.
- Nacionalidade.
- Profissão.

Permitir cadastrar mais de uma empresa contratada, pois os contratos da Sombrear normalmente utilizam:

- Sombrear Indústria Metalúrgica EIRELI-ME / LTDA
- Sombrear Indústria e Montagens Especiais LTDA

O usuário deve poder selecionar se o contrato terá uma ou duas contratadas.

## 6. Dados comerciais e financeiros

O sistema deverá permitir várias formas de pagamento no mesmo contrato.

Campos:

- Valor global do contrato.
- Valor por vaga.
- Quantidade total de vagas.
- Quantidade de vagas pagas.
- Quantidade de vagas bonificadas/isentas.
- Valor total por extenso.
- Primeiro vencimento.
- Número de parcelas.
- Valor da parcela.
- Tipo de cobrança:
  - Boleto
  - Taxa de condomínio
  - Cartão de crédito
  - Pix/dinheiro
  - Financiamento por financeira
  - Pagamento por medição
- Instituição financeira, quando houver.
- CNPJ da financeira.
- Valor financiado.
- Data limite do plantão de pagamentos.
- Data limite para assinatura do aditivo.
- Campo para observação financeira.

### 6.1. Plantão de pagamentos

Criar módulo para cadastrar opções de pagamento:

Exemplo de linhas:

- 01 vaga — R$ X — À vista Pix/Dinheiro
- 01 vaga — R$ X — Cartão até 10x
- 01 vaga — R$ X — 12x na taxa de condomínio
- 01 vaga — R$ X — 36x na taxa de condomínio
- 01 vaga — R$ X — 48x pela financeira
- 01 vaga — R$ X — 60x pela financeira

O sistema deve gerar automaticamente tabela no contrato.

### 6.2. Pagamento por medição

Criar módulo opcional para contratos com financeira ou empreitada por etapas.

Campos de medição:

- Mobilização/entrada.
- Fundações.
- Braços.
- Arcos/X.
- Terças.
- Telhas.
- Telas.
- Finalização.
- Percentual de cada etapa.
- Condição de pagamento após medição.
- Valor da etapa.
- Observação.

O sistema deve permitir escolher o modelo da tabela conforme o tipo de cobertura:
- Sombrite: Mobilização, Fundações, Braços, Arcos e X, Telas.
- Telha: Entrada, Fundações, Braços, Terças, Telhas.
- Personalizado: usuário edita as etapas.

## 7. Bonificações e itens extras

Criar módulo para inserir bonificações.

Campos:

- Tipo de bonificação.
- Descrição.
- Quantidade.
- Valor estimado, se houver.
- Local de execução.
- Se entra ou não na garantia principal.
- Prazo de entrega da bonificação.
- Condição de execução:
  - Após termo de entrega
  - Durante a obra
  - Conforme acordo
  - Sem instalação
- Observação.

Bonificações comuns:

- Vagas isentas.
- Iluminação por sensor de presença.
- Suporte de bicicletas.
- Cobertura de playground.
- Cobertura de bicicletário.
- Cobertura de portaria.
- Repasse financeiro.
- Equipamento/ar-condicionado.
- Outros.

Texto padrão de bonificação:

“As bonificações serão realizadas após a assinatura do termo de entrega do objeto principal do contrato, após vistoria técnica e termo de entrega assinado, salvo disposição expressa em sentido diverso. A presente bonificação não integra o preço principal do contrato e não constitui obrigação de reposição ou substituição futura, salvo garantia legal ou garantia específica do fornecedor.”

## 8. Cláusulas padrão iniciais

O sistema deve ter um banco de cláusulas editável. Nenhuma cláusula deve ser fixa no código. Todas devem estar em um painel de configurações, com variáveis dinâmicas.

### 8.1. Estrutura padrão do contrato

1. Identificação das partes.
2. Objeto do contrato.
3. Bonificações, quando houver.
4. Preço e condições de pagamento.
5. Plantão de pagamentos, quando houver.
6. Obrigações da contratante.
7. Obrigações da contratada.
8. Inadimplemento e descumprimento contratual.
9. Garantia do serviço.
10. Prazo de entrega e execução.
11. Condições gerais.
12. Título executivo extrajudicial.
13. Foro.
14. Assinaturas.

### 8.2. Cláusula de objeto — lógica

O sistema deve montar automaticamente o objeto com base nos itens selecionados.

Exemplo:

“Pelo presente instrumento, as CONTRATADAS se obrigam perante a CONTRATANTE a realizar, com fornecimento de materiais, fabricação, execução e instalação de {{quantidade}} coberturas de garagem em estrutura metálica Sombrear, do tipo {{tipo_cobertura}}, com {{material_cobertura}}, estrutura metálica em aço carbono, pintura eletrostática a pó de poliéster na cor {{cor_estrutura}}, fundação do tipo {{tipo_fundacao}}, conforme especificações técnicas constantes neste contrato e eventuais anexos.”

Depois disso, inserir o texto técnico específico do tipo de cobertura e da fundação escolhida.

### 8.3. Cláusula de fabricação e montagem 80/20

Texto padrão:

“Os serviços desempenhados pela CONTRATADA se dividem em duas fases: a primeira corresponde à fabricação das estruturas metálicas, pintura e preparação dos componentes, representando parcela majoritária do serviço; a segunda corresponde à montagem e instalação no condomínio. Dessa forma, ainda que em alguns períodos não haja equipe de montagem nas dependências da CONTRATANTE, os serviços de fabricação poderão estar em execução nas dependências da CONTRATADA, podendo a CONTRATANTE, mediante prévio agendamento, solicitar informações sobre o andamento da produção.”

Permitir editar o percentual padrão 80%/20%.

### 8.4. Obrigações da contratante

Cláusulas-base:

- Fornecer informações necessárias à execução.
- Disponibilizar plantas, memoriais, DWG e informações técnicas quando houver.
- Liberar acesso ao condomínio.
- Remover veículos e objetos das vagas solicitadas.
- Providenciar alterações de canos, redes elétricas, câmeras, postes, árvores, placas, ar-condicionado ou obstáculos que prejudiquem a instalação.
- Disponibilizar ponto de energia, água e banheiro para colaboradores.
- Disponibilizar local para carga e descarga.
- Disponibilizar área para caçamba quando necessário.
- Entregar relatório de proprietários das vagas.
- Realizar inspeção semanal e comunicar inconformidades por escrito.
- Evitar hostilidade de moradores contra a equipe.
- Efetuar os pagamentos nos prazos contratados.

### 8.5. Obrigações da contratada

Cláusulas-base:

- Fornecer materiais necessários à execução.
- Fornecer mão de obra qualificada.
- Fornecer equipamentos, máquinas, uniformes, EPIs e EPCs.
- Emitir notas fiscais conforme condições contratuais.
- Fornecer ART de fabricação/montagem/execução, quando aplicável.
- Fornecer seguro de obra, quando contratado.
- Acompanhar planejamento, execução, qualidade e controle da obra.
- Prestar esclarecimentos sobre andamento dos serviços.
- Arcar com obrigações trabalhistas, previdenciárias e securitárias da própria equipe.
- Corrigir defeitos decorrentes de falha de fabricação, desídia, negligência ou má execução comprovada.

### 8.6. Inadimplemento

Campos editáveis:

- Multa por atraso.
- Juros.
- Índice de correção.
- Prazo para suspensão dos serviços.
- Necessidade de notificação prévia.
- Possibilidade de protesto/SPC/Serasa.
- Honorários advocatícios.
- Multa contratual por descumprimento.

Texto-base:

“Em caso de inadimplemento por parte da CONTRATANTE quanto ao pagamento dos valores contratados, incidirá sobre o valor em atraso multa de {{multa_percentual}}%, juros de mora de {{juros_percentual}}% ao mês e correção monetária pelo índice {{indice_correcao}}, sem prejuízo das demais medidas contratuais cabíveis.”

### 8.7. Garantia

Criar garantia parametrizável por item:

- Estrutura metálica.
- Tela Sombrite.
- Costura.
- Pintura eletrostática.
- Telha Galvalume.
- Telha Termoacústica.
- Fixação em laje.
- Impermeabilização/vedação de furos.
- Bonificações.
- Materiais elétricos.

Texto-base:

“A garantia consiste nos ajustes e reparos eventualmente necessários no produto e em vícios de fabricação ou execução comprovados, não abrangendo mau uso, vandalismo, depredação, roubo, corrosão por líquidos, vapores ou agentes químicos, danos causados por animais, acidentes, caso fortuito, força maior, eventos extremos da natureza ou intervenções de terceiros não autorizados.”

Atendimento de garantia:

- E-mail de pós-venda configurável.
- Prazo para atendimento inicial.
- Prazo para laudo técnico.
- Prazo para reparo.
- Prazo máximo total.

### 8.8. Prazo de entrega

Campos:

- Prazo em dias úteis.
- Marco inicial:
  - Assinatura do contrato
  - Primeiro pagamento
  - Pagamento da mobilização
  - Assinatura do aditivo
  - Liberação da financeira
- Recesso coletivo.
- Prorrogação por chuva.
- Prorrogação por falta de liberação de vagas.
- Prorrogação por culpa da contratante.
- Prorrogação por falta de insumos.
- Limite percentual de prorrogação, quando houver.

Texto-base:

“A fabricação será iniciada após {{marco_inicial_fabricacao}}, assumindo a CONTRATADA o compromisso de entregar e montar os produtos no prazo de {{prazo_dias_uteis}} dias úteis, contados de {{marco_inicial_prazo}}, salvo eventualidades imprevisíveis, chuvas constantes ou fortes que impossibilitem a instalação, falta de água ou energia, ausência ou preço abusivo de matéria-prima devidamente comprovado, fechamento por decreto público, caso fortuito, força maior ou culpa da CONTRATANTE no cumprimento de suas obrigações.”

### 8.9. Condições gerais

Incluir cláusulas editáveis sobre:

- Inexistência de vínculo trabalhista.
- Responsabilidade civil por atos da contratada e da contratante/moradores.
- Irrevogabilidade e irretratabilidade, ressalvado inadimplemento.
- Responsabilidade por aprovações públicas/licenças/autorização pública.
- Exclusões de garantia.
- Título executivo extrajudicial.
- Foro.
- Assinatura em duas vias e duas testemunhas.

## 9. Configurações do sistema

Criar menu “Configurações” com:

### 9.1. Dados da empresa

- Empresas contratadas.
- Representantes legais.
- CNPJ.
- Endereço.
- Inscrição estadual.
- E-mails.
- Telefones.
- Dados bancários, se necessário.

### 9.2. Logo e identidade visual

- Upload da logo.
- Upload de modelo Word padrão.
- Definição de cabeçalho.
- Definição de rodapé.
- Cores da marca.
- Fonte padrão.

O padrão visual deve seguir:

- Documento formal e neutro.
- Cabeçalho com logo.
- Linha verde discreta.
- Corpo do texto em preto/cinza escuro.
- Títulos com destaque moderado.
- Tabelas com cabeçalho em verde claro.
- Layout limpo, sem poluição visual.

### 9.3. Banco de cláusulas

- Criar, editar, ativar e desativar cláusulas.
- Organizar por categoria.
- Definir variáveis aceitas.
- Definir regras de exibição.
- Versionar alterações de cláusulas.
- Guardar histórico de quem alterou.
- Permitir restaurar versão anterior.

### 9.4. Produtos e especificações

- Cadastro de tipos de cobertura.
- Cadastro de fundações.
- Cadastro de cores.
- Cadastro de garantias padrão.
- Cadastro de acessórios.
- Cadastro de modelos de pagamento.
- Cadastro de modelos de medição.

## 10. Editor manual

Antes de gerar o DOCX, o sistema deve apresentar uma prévia editável.

Recursos:

- Visualização por cláusulas.
- Botão “editar cláusula”.
- Campo “adicionar cláusula manual”.
- Campo “adicionar item técnico manual”.
- Campo “observações adicionais”.
- Campo “anexos mencionados”.
- Destaque de campos obrigatórios pendentes.
- Botão “gerar minuta DOCX”.

O sistema deve permitir inserir um bloco manual no objeto, em bonificações, nas obrigações, no pagamento ou nas condições gerais.

## 11. Geração do DOCX

Requisitos:

- Gerar arquivo .docx editável.
- Usar template Word enviado pelo usuário.
- Substituir placeholders por dados preenchidos.
- Manter tabelas formatadas.
- Gerar valores por extenso.
- Gerar datas por extenso.
- Gerar numeração automática de cláusulas.
- Não deixar placeholders vazios.
- Quando faltar informação, marcar no documento como: “[PREENCHER]”.
- Nome do arquivo:
  CONTRATO_SOMBREAR_{{NOME_CONDOMINIO}}_{{DATA}}.docx

## 12. Placeholders mínimos do template

Usar padrão de variáveis como:

{{contrato.numero}}
{{contrato.data}}
{{contrato.tipo}}
{{contrato.cidade_assinatura}}
{{contratante.nome}}
{{contratante.cnpj}}
{{contratante.endereco}}
{{contratante.representante.nome}}
{{contratante.representante.cpf}}
{{contratante.representante.rg}}
{{contratante.ata.data}}
{{contratante.ata.mandato}}
{{assembleia.data_aprovacao}}
{{contratada.razao_social}}
{{contratada.cnpj}}
{{contratada.representante.nome}}
{{objeto.itens}}
{{pagamento.valor_global}}
{{pagamento.valor_global_extenso}}
{{pagamento.tabela_opcoes}}
{{pagamento.tabela_medicoes}}
{{bonificacoes.lista}}
{{garantia.texto}}
{{prazo.texto}}
{{foro.comarca}}
{{assinaturas.bloco}}

## 13. Fluxo de uso

1. Usuário acessa o sistema.
2. Clica em “Novo contrato”.
3. Preenche dados do condomínio.
4. Preenche dados do síndico/representante.
5. Preenche dados da assembleia.
6. Seleciona uma ou mais coberturas.
7. Seleciona uma ou mais fundações.
8. Define cores, materiais e observações.
9. Define valores e forma de pagamento.
10. Cadastra plantão de pagamento, se houver.
11. Cadastra medições, se houver.
12. Cadastra bonificações, se houver.
13. Define prazo e garantia.
14. Revisa a prévia.
15. Adiciona itens manuais, se necessário.
16. Gera o DOCX.
17. Salva histórico da versão.

## 14. Permissões

Criar ao menos três perfis:

### Administrador

- Edita cláusulas.
- Edita dados da empresa.
- Edita templates.
- Gera contratos.
- Exclui contratos.
- Visualiza histórico.

### Comercial/Engenharia

- Cria contratos.
- Edita contratos em rascunho.
- Gera DOCX.
- Não altera cláusulas padrão globais.

### Jurídico/Revisor

- Visualiza contrato.
- Marca como revisado.
- Insere observações.
- Pode bloquear versão final.

## 15. Dashboard

Tela inicial com:

- Total de contratos gerados.
- Contratos em rascunho.
- Contratos enviados ao jurídico.
- Contratos aprovados.
- Contratos assinados.
- Filtro por condomínio.
- Filtro por tipo de cobertura.
- Filtro por status.
- Botão “Novo contrato”.

## 16. Requisitos técnicos

O desenvolvedor pode escolher a stack, mas o sistema deve ser web, responsivo e estável.

Sugestão:

- Front-end: React, Next.js ou Vue.
- Back-end: Node.js/NestJS, Laravel ou equivalente.
- Banco de dados: PostgreSQL.
- Geração DOCX: docxtemplater, docx.js, python-docx ou biblioteca equivalente.
- Armazenamento de arquivos: local/S3 compatível.
- Autenticação por login e senha.
- Logs de auditoria.
- Backup do banco.
- Controle de versões dos contratos.

## 17. Validações obrigatórias

- Máscara de CNPJ.
- Máscara de CPF.
- Máscara de CEP.
- Valores monetários em padrão brasileiro.
- Datas em padrão brasileiro.
- Conversão automática de valores por extenso.
- Alerta se não houver representante legal.
- Alerta se não houver data de assembleia.
- Alerta se não houver prazo de entrega.
- Alerta se não houver foro.
- Alerta se o contrato tiver mais de um item e algum item estiver sem fundação.
- Alerta se Sombrite estiver sem cor da tela.
- Alerta se Telha Termoacústica estiver sem tipo de núcleo EPS/PIR.
- Alerta se forma de pagamento estiver sem vencimento ou quantidade de parcelas.

## 18. Regras de exibição de cláusulas

- Se houver Sombrite, incluir cláusula de tela, costura, cabo de aço e variação lateral.
- Se houver Telha Galvalume, incluir cláusula de telha galvalume branca.
- Se houver Telha Termoacústica, incluir cláusula do núcleo EPS ou PIR.
- Se houver fundação em laje, incluir cláusula de fixação por chapa base, ancoragens e vedação.
- Se houver fundação em solo com chumbação direta, incluir cláusula de estaca/sapata/concretagem.
- Se houver fundação por chumbador parafusado, incluir cláusula de base existente e ancoragens mecânicas.
- Se houver bonificação, incluir capítulo de bonificações.
- Se não houver bonificação, ocultar capítulo.
- Se houver financiamento, incluir cláusulas da financeira, medições e vinculação de valores.
- Se não houver financiamento, ocultar cláusulas de financeira.
- Se houver plantão de pagamento, incluir tabela e cláusulas de prazo de adesão.
- Se não houver plantão, ocultar esse bloco.
- Se houver medição, incluir tabela de medições.
- Se não houver medição, ocultar esse bloco.

## 19. Observação jurídica

O sistema não deve substituir o jurídico.

Todo contrato gerado deve sair como “MINUTA CONTRATUAL — SUJEITA À REVISÃO JURÍDICA”, salvo quando o perfil jurídico marcar como “revisado”.

## 20. Entregáveis esperados

1. Aplicativo web funcional.
2. Tela de login.
3. Dashboard.
4. Tela de criação de contrato.
5. Tela de configurações da empresa.
6. Tela de banco de cláusulas.
7. Tela de cadastro de produtos/fundações.
8. Tela de prévia/editoração.
9. Geração de DOCX.
10. Histórico de contratos.
11. Controle de versões.
12. Manual rápido de uso.

## 21. Critérios de aceite

O sistema será considerado aprovado quando:

- Conseguir gerar um contrato completo em DOCX.
- Permitir contrato com mais de um tipo de cobertura.
- Permitir contrato com mais de uma fundação.
- Permitir editar cláusulas antes da geração.
- Permitir editar cláusulas padrão no menu de configurações.
- Gerar tabelas de pagamento corretamente.
- Gerar tabela de medições quando aplicável.
- Gerar valores por extenso.
- Aplicar o layout da Sombrear.
- Não deixar variáveis sem preenchimento, salvo marcadas como “[PREENCHER]”.
- O arquivo final abrir corretamente no Microsoft Word.
- O contrato ficar editável para envio ao jurídico.

## COMPLEMENTO — USO DO MODELO WORD OFICIAL DA SOMBREAR

O sistema deverá utilizar o arquivo Word enviado pela Sombrear como TEMPLATE MASTER do contrato.

Nome do template base:
CONTRATO SOMBREAR ITAPOÃ 51.docx

Esse arquivo deve ser importado no sistema e convertido em um modelo dinâmico, mantendo:

- Estrutura visual do documento.
- Cabeçalhos.
- Rodapés.
- Tabelas.
- Blocos de assinatura.
- Numeração das cláusulas.
- Estilo formal de contrato.
- Espaçamentos.
- Fonte.
- Formatação de títulos.
- Quadros descritivos.
- Padrão de tabelas financeiras.
- Rodapé com telefone/e-mail da empresa.

O sistema NÃO deve gerar um contrato em layout novo do zero. Ele deve preencher, substituir e montar o conteúdo dentro do padrão do Word oficial.

## 1. Funcionamento do template DOCX

O desenvolvedor deverá transformar o Word em um arquivo de template com placeholders.

Exemplo:

{{contrato.titulo}}
{{contrato.numero}}
{{contratante.nome}}
{{contratante.cnpj}}
{{contratante.endereco}}
{{contratante.representante.nome}}
{{contratante.representante.cpf}}
{{contratante.representante.rg}}
{{assembleia.data_aprovacao}}
{{objeto.itens}}
{{bonificacoes.bloco}}
{{pagamento.valor_global}}
{{pagamento.valor_global_extenso}}
{{pagamento.tabela_resumo}}
{{pagamento.tabela_medicoes}}
{{pagamento.tabela_opcoes}}
{{garantia.bloco}}
{{prazo.bloco}}
{{foro.comarca}}
{{assinaturas.bloco}}

O sistema deve substituir os placeholders automaticamente e, quando não houver informação preenchida, inserir “[PREENCHER]” em destaque.

## 2. Estrutura padrão do contrato conforme modelo Word

O contrato gerado deve seguir esta ordem:

1. Título do contrato
2. Número do contrato
3. Identificação das partes
4. Texto de introdução e aprovação em assembleia
5. Objeto do contrato
6. Especificações técnicas da cobertura
7. Parágrafo de fabricação e montagem 80%/20%
8. Bonificações, quando houver
9. Preço e condições de pagamento
10. Tabela de resumo inicial dos valores
11. Cláusula de financiamento, quando houver
12. Tabela de medições, quando houver
13. Plantão de pagamentos
14. Tabela de opções de pagamento
15. Obrigações da contratante
16. Obrigações da contratada
17. Inadimplemento e descumprimento contratual
18. Garantia do serviço
19. Prazo de entrega e execução
20. Condições gerais
21. Cláusula de compliance
22. Cláusula de proteção de dados — LGPD
23. Título executivo extrajudicial
24. Foro
25. Bloco de assinaturas
26. Testemunhas
27. Rodapé com contato

## 3. Regras de layout

O sistema deve preservar a identidade visual do contrato, mas permitir ajustes em configurações.

Diretrizes visuais:

- Documento formal e neutro.
- Pouco uso de verde, apenas em elementos de destaque.
- Tabelas com cabeçalho em verde claro.
- Texto em preto ou cinza escuro.
- Fonte compatível com Word, preferencialmente Calibri ou Arial para corpo do contrato.
- Títulos em caixa alta ou negrito.
- Alinhamento justificado no corpo do texto.
- Espaçamento limpo.
- Manter assinatura em bloco semelhante ao modelo Word.

O manual de identidade da Sombrear orienta que contratos devem ter visual mais neutro e formal, com pouco verde, tipografia simples e aparência técnica/limpa. :contentReference[oaicite:1]{index=1}

## 4. Pontos importantes do modelo enviado

O modelo Word atual possui tabelas financeiras que precisam ser dinâmicas:

### 4.1. Quadro descritivo resumido

O sistema deve gerar tabela com colunas equivalentes a:

- Quantidade de vagas
- Valor total por vaga
- Quantidade
- Valor total Contrato

Essa tabela deve aceitar múltiplas linhas, como:

- Pagas à vista diretamente à empresa contratada
- Parcelamento em taxa condominial
- Parcelamento por financeira
- Vagas bonificadas
- Outros planos

### 4.2. Tabela de medições

Quando houver pagamento por medição, gerar tabela com:

- Medições
- Percentual e data
- Valor após finalização do plantão

Modelos pré-configurados:

Para Sombrite:
- Mobilização
- Fundações
- Braços
- Arcos e X
- Telas

Para Telha Galvalume / Termoacústica:
- Mobilização ou Entrada
- Fundações
- Braços
- Terças
- Telhas

O usuário deve poder editar os nomes das etapas, percentuais e condições.

### 4.3. Quadro descritivo de valores

Gerar tabela com:

- Descritivo
- Valores
- Descritivo da condição

Exemplo:

- 01 vaga — R$ X — À vista PIX ou dinheiro
- 01 vaga — R$ X — Cartão até 10x
- 01 vaga — R$ X — Cartão até 12x com juros
- 01 vaga — R$ X — Rateio automático na taxa de condomínio

## 5. Campos obrigatórios para geração do contrato

O sistema deve validar antes de gerar o DOCX:

### Dados do contrato

- Número do contrato
- Data de emissão
- Cidade/UF de assinatura
- Tipo de contrato
- Foro

### Dados da contratante

- Nome do condomínio
- CNPJ
- Endereço completo
- Representante legal/síndico
- CPF do representante
- RG do representante, se houver
- Dados da ata de eleição
- Data da assembleia de aprovação

### Dados da contratada

- Empresa contratada 1
- CNPJ
- Representante
- CPF
- Empresa contratada 2, se aplicável
- CNPJ
- Representante
- CPF

### Dados técnicos

- Tipo de cobertura
- Quantidade de vagas
- Tipo de fundação
- Cor da estrutura
- Cor da tela, quando for Sombrite
- Tipo de telha, quando for Galvalume ou Termoacústica
- Tipo de núcleo, quando for Termoacústica: EPS 30 mm ou PIR 30 mm
- Prazo de execução
- Garantia

### Dados financeiros

- Valor global
- Valor por vaga
- Valor por extenso
- Forma de pagamento
- Primeiro vencimento
- Quantidade de parcelas
- Tabelas de pagamento
- Data de plantão, quando houver
- Data de aditivo, quando houver

## 6. Regras para blocos condicionais

O sistema deve inserir ou ocultar blocos conforme seleção do usuário.

### Se houver bonificações

Inserir capítulo “A CONTRATADA CONCEDE A TÍTULO DE BONIFICAÇÃO”.

### Se não houver bonificações

Remover todo o bloco de bonificações e renumerar as cláusulas.

### Se houver financiamento

Inserir cláusulas sobre:

- Financeira
- Valor financiado
- Conta específica do condomínio
- Pagamento por medições
- Retenção de valores
- Liberação após relatório técnico
- Aditivo pós-plantão

### Se não houver financiamento

Remover cláusulas de financeira e manter apenas cláusula simples de pagamento.

### Se houver Sombrite

Inserir especificações de:

- Tela de polietileno permeável decorativa
- Cor da tela
- Costura dupla em fio náutico
- Cabo de aço
- Sistema gripple
- Variação lateral de 10 cm a 30 cm
- Módulos de 2, 3 ou 4 vagas

### Se houver Telha Galvalume

Inserir especificações de:

- Telha aço galvalume branca
- Estrutura metálica
- Terças
- Pintura eletrostática
- Acessórios inclusos ou não inclusos

### Se houver Telha Termoacústica

Inserir especificações de:

- Telha termoacústica
- EPS 30 mm ou PIR 30 mm
- Cor branca
- Estrutura metálica
- Conforto térmico/acústico
- Aplicação em solo ou laje

### Se houver fundação em solo

Inserir cláusula de fundação direta/chumbação direta.

### Se houver fundação em laje

Inserir cláusula de chapa base, ancoragens mecânicas e vedação perimetral.

### Se houver fundação mista

Gerar objeto por itens:

Item 1 — Cobertura tipo X com fundação Y  
Item 2 — Cobertura tipo Z com fundação W  
Item 3 — Observações técnicas específicas

## 7. Editor de prévia

Antes de exportar, o sistema deve abrir uma prévia editável do contrato, com as cláusulas já montadas.

Funções obrigatórias:

- Editar cláusula individual.
- Adicionar cláusula manual.
- Adicionar item técnico manual.
- Adicionar bonificação manual.
- Adicionar observação financeira.
- Adicionar observação de prazo.
- Marcar cláusula como “revisar pelo jurídico”.
- Destacar campos pendentes.
- Visualizar tabelas antes de gerar o DOCX.

## 8. Exportação

Ao clicar em “Gerar DOCX”, o sistema deve:

- Usar o Word oficial como base.
- Substituir placeholders.
- Gerar tabelas dinâmicas.
- Preservar cabeçalho, rodapé e assinaturas.
- Gerar valores por extenso.
- Gerar datas por extenso quando necessário.
- Renumerar cláusulas automaticamente.
- Gerar arquivo editável.
- Salvar histórico da versão.

Nome do arquivo:

CONTRATO_SOMBREAR_{{NOME_CONDOMINIO}}_{{DATA}}.docx

## 9. Observação crítica para o desenvolvedor

O DOCX gerado precisa abrir corretamente no Microsoft Word, mantendo a formatação. Após a geração, o sistema deve evitar:

- Quebrar tabelas financeiras.
- Desalinhar assinaturas.
- Duplicar cláusulas.
- Manter placeholders sem substituição.
- Inserir textos de rodapé dentro do corpo do contrato.
- Perder formatação do template.
- Misturar dados de outro contrato.

## 10. Versão do template

Criar controle de versões para o modelo Word.

Exemplo:

- Template Contrato Sombrear v1.0 — base Itapoã 51
- Data de upload
- Usuário responsável
- Status: ativo/inativo
- Observações da versão

O administrador deve conseguir substituir o template futuramente sem afetar contratos já gerados.