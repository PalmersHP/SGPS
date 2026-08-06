Perfeito. Vamos por partes.

## 1. Diferença entre HTML/CSS/JS puro e React/Next.js

### Opção A — HTML, CSS e JavaScript puro

É o jeito mais simples de criar uma aplicação web.

Você teria arquivos como:

```txt
index.html
style.css
script.js
```

O **HTML** monta a estrutura da página, o **CSS** cuida do visual e o **JavaScript** cria as interações. A MDN trata esses três como a base principal do desenvolvimento web: HTML estrutura, CSS estiliza e JavaScript adiciona comportamento dinâmico. ([MDN Web Docs][1])

**Vantagens:**

* Mais simples de entender no começo.
* Bom para telas pequenas ou protótipos rápidos.
* Não precisa de muita configuração inicial.
* Dá para criar um visual bonito.

**Desvantagens para o Ecosistema Sombrear:**

* Conforme o sistema cresce, fica difícil organizar.
* Repetição de código: botão, card, modal, tabela, menu etc.
* Login, permissões, banco de dados e dashboards ficam mais trabalhosos.
* Para CRM com kanban, propostas, usuários, painel público e financeiro, pode virar um sistema difícil de manter.

Eu usaria HTML/CSS/JS puro apenas se o objetivo fosse fazer uma **maquete visual simples**, sem muita lógica real.

---

### Opção B — React

O **React** é uma biblioteca para criar interfaces usando componentes reutilizáveis. Um componente pode ser um botão, card, menu lateral, coluna do kanban, formulário de cliente ou tela inteira. A própria documentação do React explica que interfaces são montadas a partir de pequenos componentes combinados entre si. ([React][2])

Exemplo prático para a Sombrear:

```txt
Componente ClienteCard
Componente ColunaKanban
Componente BotaoVerde
Componente FormularioCondominio
Componente DashboardResumo
```

Você cria uma vez e reaproveita em vários lugares.

**Vantagens:**

* Muito melhor para sistemas grandes.
* Facilita criar telas bonitas e modernas.
* Componentes reaproveitáveis.
* Melhor para CRM, dashboard, filtros, cards, gráficos e formulários.
* Manutenção mais organizada.

**Desvantagens:**

* Exige uma estrutura inicial um pouco mais técnica.
* Precisa aprender conceitos como componente, estado, propriedades e rotas.

---

### Opção C — Next.js

O **Next.js** é um framework construído em cima do React. Ele já vem com estrutura de páginas, rotas, layouts, carregamento otimizado e suporte a partes rodando no servidor e no cliente. A documentação oficial destaca o uso do App Router, layouts, navegação, server components e client components. ([Next.js][3])

Na prática, o Next.js seria o melhor caminho para transformar o projeto em um sistema real.

Exemplo de organização:

```txt
/ecosistema
/crm
/propostas
/pedidos
/producao
/financeiro
/painel-condominio/[token]
```

**Vantagens:**

* Ideal para sistema com login.
* Bom para permissões por usuário.
* Bom para painel público com token.
* Organiza melhor várias telas e módulos.
* Facilita integração com Supabase.
* Mais profissional para crescer no futuro.
* Melhor para separar unidades: Sombrear GO, Sombrear DF, outras franquias.

**Desvantagem:**

* É mais avançado que HTML puro.
* Precisa montar uma arquitetura bem planejada desde o início.

---

## Minha recomendação para o seu caso

Para o **Ecosistema Sombrear + CRM**, eu recomendo:

**Next.js + React + Supabase**

Porque o seu sistema não é só uma página. Ele vai ter:

* Login por e-mail.
* Usuários por unidade.
* Permissões por cargo.
* CRM com kanban.
* Dashboard geral.
* Painel público por token.
* Banco de dados.
* Upload de fotos e documentos.
* Relatórios.
* Integração futura com financeiro, produção e calculadora.

HTML puro serviria para um protótipo visual, mas não é o melhor para um sistema que vai crescer.

---

## Decisões confirmadas até agora

Com suas respostas, já temos estas decisões:

**Módulo inicial:** Ecosistema Sombrear + CRM.

**Organização:** Separar por unidades, por exemplo:

* Sombrear GO
* Sombrear DF
* Sombrear SP
* Outras futuras unidades

**Tipos de clientes:** O sistema não será limitado a condomínios. Poderá cadastrar:

* Condomínios residenciais
* Condomínios comerciais
* Empresas
* Escolas
* Comércios
* Órgãos públicos
* Outros clientes personalizados

**Painel do condomínio:** Será por **link público com token**, criado pela Sombrear. Ou seja, o síndico/moradores não precisam criar login. Eles recebem um link seguro, por exemplo:

```txt
painel.sombrear.com.br/obra/rio-negro?token=ABC123
```

ou

```txt
ecosistema.sombrear.com.br/painel/ABC123
```

---

## Agora vamos detalhar o primeiro bloco: Ecosistema + CRM

Eu dividiria em duas telas principais:

### Tela 1 — Ecosistema Sombrear

Essa é a tela mãe.

Ela teria:

**Topo**

* Logo Sombrear
* Nome da unidade atual
* Usuário logado
* Perfil do usuário
* Botão de configurações

**Cards de acesso**

* CRM
* Propostas
* Pedidos
* Produção/Execução
* Painel Condomínio
* Financeiro
* Calculadora de Materiais
* Configurações

**Resumo geral**

* Clientes em prospecção
* Propostas enviadas
* Obras fechadas
* Obras em contrato
* Obras em produção
* Obras em execução
* Obras entregues
* Valor total em negociação
* Valor total vendido
* Comissões previstas
* Pendências importantes

O proprietário e gestor geral enxergam tudo. Um vendedor, por exemplo, veria apenas seus leads, propostas e indicadores de venda.

---

### Tela 2 — CRM Kanban

Colunas iniciais:

1. Prospecção
2. Visita técnica
3. Fazer orçamento
4. Orçamento feito
5. Proposta enviada
6. Em negociação / assembleia
7. Fechado
8. Acompanhar
9. Perdido

Cada cliente vira um card arrastável.

Dentro do card, eu colocaria abas:

**1. Dados do cliente**

* Tipo de cliente
* Nome do condomínio/empresa
* Unidade responsável
* CNPJ/CPF
* Endereço
* Número de unidades/moradores
* Responsável/síndico
* Telefone
* E-mail
* Vendedor responsável
* Origem do lead

**2. Dados comerciais**

* Número de vagas
* Tipo de cobertura
* Valor por vaga
* Valor total estimado
* Forma de pagamento
* Status da proposta
* Comissão prevista

**3. Produtos**

* Sombrite garagem
* Sombrite parquinho
* Sombrite piscina
* Telha galvalume
* Telha termoacústica
* Carport solar
* Manutenção
* Produto personalizado

**4. Proposta**

* Gerar proposta simplificada
* Gerar proposta completa
* Inserir desconto
* Calcular comissão
* Calcular valor por morador
* Simular financiamento

**5. Agenda**

* Visita técnica
* Assembleia
* Plantão de dúvidas
* Retorno comercial
* Prazo de resposta

**6. Arquivos**

* Fotos
* Projetos
* Ata
* Edital
* Contrato
* Proposta em PDF

**7. Histórico**

* Ligações
* WhatsApp
* Reuniões
* Alterações no card
* Observações internas

---

## Próximo passo

O próximo item que eu sugiro detalharmos é o **CRM**, porque ele é o coração do sistema.

Começamos definindo exatamente os **campos do cadastro do cliente/card do CRM**.

[1]: https://developer.mozilla.org/pt-BR/docs/Learn_web_development?utm_source=chatgpt.com "Aprendendo desenvolvimento web - MDN Web Docs - Mozilla"
[2]: https://react.dev/?utm_source=chatgpt.com "React"
[3]: https://nextjs.org/docs/app?utm_source=chatgpt.com "Next.js Docs: App Router"
Vamos continuar pelo **item 2 — CRM + Ecosistema Sombrear**.

A ideia principal é: o **Ecosistema Sombrear** será a entrada central de todos os sistemas, e o **CRM** será o primeiro módulo funcional, porque ele alimenta proposta, comissão, contrato, painel do condomínio, produção e financeiro. No seu escopo, o sistema mãe precisa reunir os módulos da empresa e mostrar dados gerais como obras em andamento, obras vendidas e fase de cada setor, enquanto o CRM deve funcionar em kanban com fases como prospecção, visita técnica, orçamento, proposta enviada, negociação, fechado e perdido. 

# 1. O que é o Ecosistema Sombrear

O **Ecosistema Sombrear** não é só uma tela bonita com botões. Ele deve ser a **base administrativa de todos os módulos**.

Ele controla:

* Login dos usuários.
* Permissões.
* Separação por unidade.
* Acesso aos módulos.
* Dashboard geral.
* Configurações principais.
* Cadastro de usuários.
* Padrão visual da marca.
* Integração entre os sistemas.

A tela inicial dele seria como um **portal interno da empresa**.

Exemplo:

```txt
ECOSISTEMA SOMBREAR

[CRM]
[PROPOSTAS]
[PEDIDOS]
[CALCULADORA DE MATERIAIS]
[PAINEL CONDOMÍNIO]
[PRODUÇÃO / EXECUÇÃO]
[FINANCEIRO]
[CONFIGURAÇÕES]
```

Além dos ícones, ele teria indicadores gerais:

```txt
Obras em negociação: 18
Propostas enviadas: 9
Obras fechadas no mês: 4
Obras em contrato: 3
Obras em produção: 6
Obras em execução: 5
Obras entregues: 2
Valor total em negociação: R$ xxx.xxx,xx
Valor vendido no mês: R$ xxx.xxx,xx
```

Essa visão macro combina com o que você descreveu: um painel para o proprietário enxergar o andamento geral de todos os setores. 

# 2. O que é o CRM dentro do Ecosistema

O **CRM** será o sistema comercial. Ele controla tudo desde o primeiro contato com o cliente até o fechamento da obra.

O fluxo da Sombrear já é muito forte comercialmente, porque envolve diagnóstico técnico, apoio em assembleia, proposta, apresentação, plantão de dúvidas, contratação, comunicação com moradores, execução e pós-entrega. 

Então o CRM não deve ser apenas “cadastro de cliente”. Ele deve ser um **sistema de jornada comercial**.

Ele vai responder perguntas como:

* Quem é o cliente?
* De qual unidade ele é?
* Quem é o vendedor responsável?
* Em qual etapa comercial ele está?
* Já teve visita técnica?
* Já foi feito orçamento?
* Já foi enviada proposta?
* Vai ter assembleia?
* A proposta foi aprovada?
* Qual o valor da obra?
* Qual a comissão prevista?
* O cliente foi perdido? Por quê?
* Se fechou, qual obra será aberta no sistema de produção?

# 3. Como os dois se conectam

A relação fica assim:

```txt
ECOSISTEMA SOMBREAR
│
├── CRM
│   ├── Leads
│   ├── Clientes
│   ├── Propostas
│   ├── Comissão
│   ├── Agenda comercial
│   └── Histórico
│
├── Produção / Execução
│   └── Recebe obras fechadas pelo CRM
│
├── Painel do Condomínio
│   └── Recebe obra fechada e gera link público com token
│
├── Financeiro
│   └── Recebe valor contratado, parcelas, comissões e contas
│
└── Configurações
    └── Usuários, unidades, produtos, status e permissões
```

Quando o cliente estiver como **Fechado** no CRM, o sistema deve perguntar:

```txt
Deseja transformar este cliente em obra?
```

Ao confirmar, ele cria automaticamente:

* Cadastro da obra.
* Etapas de produção/execução.
* Registro financeiro inicial.
* Token do painel público.
* Pasta de documentos/fotos.
* Histórico vinculado ao cliente.

Esse ponto é importante: **cliente fechado não deve morrer dentro do CRM**. Ele deve virar uma obra acompanhada pelo restante do Ecosistema.

# 4. Separação por unidades

Como você confirmou que o sistema deve ser separado por unidades, tudo precisa ter uma identificação de unidade.

Exemplo de unidades:

```txt
Sombrear GO
Sombrear DF
Sombrear SP
Sombrear MG
Sombrear RJ
```

Cada cadastro no sistema deve ter um campo:

```txt
unidade_responsavel
```

Ou tecnicamente:

```txt
unidade_id
```

Isso vale para:

* Usuários.
* Clientes.
* Propostas.
* Obras.
* Comissões.
* Pedidos.
* Contas.
* Relatórios.
* Painéis públicos.

Na prática:

O vendedor da **Sombrear DF** só vê clientes e propostas da Sombrear DF.

O gestor da **Sombrear DF** vê tudo da unidade DF.

O proprietário vê todas as unidades.

O administrador geral pode editar todas.

Esse modelo evita bagunça quando entrarem outras franquias ou operações em outros estados.

# 5. Tipos de clientes

Como você confirmou que o sistema também pode ter outros tipos de clientes, eu criaria um campo chamado:

```txt
tipo_de_cliente
```

Com opções iniciais:

```txt
Condomínio residencial
Condomínio comercial
Empresa privada
Escola
Comércio
Órgão público
Associação
Pessoa física
Outro
```

Isso muda alguns campos do cadastro.

Por exemplo, para **condomínio**, faz sentido ter:

* Síndico.
* Administradora.
* Número de unidades.
* Número de vagas.
* Assembleia.
* Ata.
* Edital.
* Moradores.
* Valor por unidade.

Para **empresa**, faz mais sentido:

* Responsável pela compra.
* Setor.
* CNPJ.
* Prazo de aprovação.
* Condição de pagamento.
* Local de instalação.

Para **órgão público**, talvez futuramente:

* Processo.
* Licitação.
* Empenho.
* Documentação fiscal.
* Prazo administrativo.

Então o CRM deve ser flexível.

# 6. Colunas do kanban do CRM

Eu usaria estas colunas iniciais:

```txt
1. Prospecção
2. Qualificação
3. Visita técnica agendada
4. Visita técnica realizada
5. Fazer orçamento
6. Orçamento feito
7. Proposta enviada
8. Em negociação
9. Assembleia / aprovação
10. Fechado
11. Acompanhar futuro
12. Perdido
```

Eu faria uma pequena mudança no seu fluxo: separaria **visita técnica agendada** de **visita técnica realizada**. Isso ajuda a empresa a saber quem está esperando visita e quem já pode receber orçamento.

Também separaria **em negociação** de **assembleia/aprovação**, porque no caso da Sombrear a assembleia é uma etapa muito estratégica do processo comercial. O raio-x operacional mostra que a empresa apoia chamamento de assembleia, pauta, ata, análise de viabilidade e apresentação profissional, então essa etapa merece destaque próprio. 

# 7. Card do cliente no CRM

Cada card do kanban deve ter uma versão resumida e uma versão completa.

## Card resumido no kanban

Aparece assim:

```txt
Residencial Rio Negro
Sombrear DF
Tipo: Condomínio residencial
Produto: Sombrite + Galvalume
Valor estimado: R$ 480.000,00
Vendedor: Henrique
Próxima ação: Assembleia em 10/05
```

## Card completo

Ao clicar no card, abre uma tela com abas.

Eu sugiro estas abas:

```txt
1. Dados gerais
2. Contatos
3. Comercial
4. Produtos
5. Orçamento / Proposta
6. Financiamento
7. Comissão
8. Agenda
9. Arquivos
10. Histórico
```

# 8. Aba 1 — Dados gerais

Campos:

```txt
Nome do cliente
Tipo de cliente
Unidade responsável
CNPJ / CPF
Endereço
Cidade
Estado
CEP
Origem do lead
Status no CRM
Vendedor responsável
Observações gerais
```

Origem do lead pode ser:

```txt
Indicação
Instagram
Google
Site
WhatsApp
Cliente antigo
Prospecção ativa
Assembleia
Administradora
Outro
```

Isso vai ajudar muito no futuro, porque vocês vão saber de onde vêm os melhores clientes.

# 9. Aba 2 — Contatos

Campos:

```txt
Nome do responsável principal
Cargo / função
Telefone
WhatsApp
E-mail
Nome do síndico
Telefone do síndico
E-mail do síndico
Administradora
Contato da administradora
E-mail da administradora
Contato financeiro
Contato técnico
```

Para empresa ou órgão público, os nomes dos campos podem mudar um pouco, mas a estrutura é a mesma.

# 10. Aba 3 — Comercial

Campos:

```txt
Número de unidades
Número de vagas
Quantidade de áreas
Valor estimado
Valor por vaga
Valor por unidade/morador
Probabilidade de fechamento
Previsão de fechamento
Temperatura do lead
Motivo de interesse
Principal objeção
Concorrente envolvido
```

Temperatura do lead:

```txt
Frio
Morno
Quente
Muito quente
```

Probabilidade:

```txt
10%
25%
50%
75%
90%
```

Isso permite o dashboard mostrar um funil mais realista.

# 11. Aba 4 — Produtos

Aqui entram os produtos da Sombrear.

Do seu escopo e do raio-x operacional, os produtos iniciais seriam:

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Telha galvalume
Telha isotérmica / termoacústica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

O raio-x operacional também separa aplicações como estacionamentos, áreas permeáveis, piscinas, playground, academias externas, áreas de lazer, condomínios em laje e projetos com energia solar. 

Dentro da aba de produtos, o vendedor poderia adicionar mais de um item:

```txt
Produto 1: Sombrite garagem
Quantidade: 80 vagas
Valor por vaga: R$ x.xxx,xx
Valor total: R$ xxx.xxx,xx

Produto 2: Sombrite parquinho
Área: 120 m²
Valor total: R$ xx.xxx,xx
```

O sistema soma tudo e leva para a proposta.

# 12. Aba 5 — Orçamento / Proposta

Aqui entra minha recomendação principal: o **Gerador de Proposta com Cálculo de Comissão deve ficar dentro do CRM**.

Motivo: o vendedor já estará no card do cliente, com nome, CNPJ, endereço, unidade, número de vagas, produtos e valores. Não faz sentido ele abrir outro sistema e preencher tudo de novo.

Nesta aba teria:

```txt
Criar orçamento
Criar proposta simplificada
Criar proposta completa
Gerar PDF
Enviar proposta
Marcar como proposta enviada
Registrar data de envio
Registrar validade da proposta
```

A proposta simplificada pode ser de uma página:

```txt
Cliente
Unidade Sombrear
Produto
Quantidade
Valor total
Condição de pagamento
Validade
Observações
```

E a proposta completa pode ter:

```txt
Capa
Apresentação da Sombrear
Escopo
Produtos
Condições comerciais
Diferenciais
Garantia
Prazo
Assinatura
```

O visual das propostas deve usar verde, branco e bastante espaçamento, porque o manual recomenda uma proposta mais visual, com identidade da marca e destaques em verde. 

# 13. Aba 6 — Financiamento

Essa aba é muito importante para condomínios.

Campos:

```txt
Valor total da obra
Número de unidades
Entrada
Valor financiado
Quantidade de parcelas
Taxa de juros
Tipo de financiamento
Valor por unidade
Valor por vaga
Observações
```

Tipo de financiamento:

```txt
Financiamento próprio
Financeira parceira
Pagamento direto
Entrada + parcelas
À vista
Outro
```

Exemplo de cálculo:

```txt
Valor da obra: R$ 500.000,00
Unidades: 200
Parcelas: 24
Valor estimado por unidade: R$ 104,16/mês
```

Isso é excelente para assembleia, porque transforma uma obra grande em um valor mais compreensível para o morador.

# 14. Aba 7 — Comissão

A comissão deve ser automática, mas editável por quem tiver permissão.

Campos:

```txt
Vendedor responsável
Valor total vendido
Percentual de comissão
Valor da comissão
Status da comissão
Data prevista de pagamento
Data paga
Observações
```

Status:

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

Também é interessante separar:

```txt
Comissão sobre venda
Comissão sobre aditivo
Comissão sobre produto extra
Comissão especial
```

Assim, se o cliente compra uma cobertura e depois adiciona iluminação, bicicletário ou outro item, o sistema consegue registrar corretamente.

# 15. Aba 8 — Agenda

Campos:

```txt
Data da visita técnica
Responsável pela visita
Data da assembleia
Data do plantão de dúvidas
Data de retorno comercial
Próxima ação
Responsável pela próxima ação
Lembrete
```

Tipos de evento:

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Apresentação
Assembleia
Plantão
Envio de proposta
Retorno comercial
Assinatura de contrato
```

Isso evita perder cliente por falta de acompanhamento.

# 16. Aba 9 — Arquivos

Arquivos importantes:

```txt
Fotos da visita
Projetos
Croquis
Ata
Edital
Proposta enviada
Contrato
Documentos do cliente
Comprovantes
Arquivos internos
```

Aqui pode usar o storage do Supabase.

# 17. Aba 10 — Histórico

Tudo que acontecer no card precisa ficar registrado.

Exemplo:

```txt
28/04/2026 - Henrique criou o cliente.
28/04/2026 - Cliente movido de Prospecção para Visita técnica agendada.
29/04/2026 - Proposta gerada no valor de R$ 480.000,00.
30/04/2026 - Assembleia agendada para 10/05/2026.
```

Esse histórico protege a empresa e ajuda a equipe a entender o que já foi conversado.

# 18. Dashboard do CRM

O CRM precisa ter indicadores próprios.

Eu colocaria:

```txt
Total em prospecção
Total em proposta enviada
Total em negociação
Total fechado
Total perdido
Taxa de conversão
Ticket médio
Vendas por vendedor
Vendas por unidade
Vendas por produto
Comissões previstas
Comissões pagas
Próximas assembleias
Visitas técnicas pendentes
Propostas vencendo
Clientes sem movimentação
```

Um indicador muito importante:

```txt
Clientes parados há mais de X dias
```

Exemplo:

```txt
Cliente parado há 12 dias em “Proposta enviada”
```

Isso força o vendedor a fazer follow-up.

# 19. Quando o cliente fecha

Ao mover o card para **Fechado**, o sistema deve abrir uma janela:

```txt
Cliente marcado como fechado.

Deseja:
[Gerar obra]
[Gerar contrato]
[Gerar painel público]
[Enviar para financeiro]
```

Depois disso, o CRM envia dados para outros módulos.

## Envia para Produção / Execução

```txt
Nome da obra
Cliente
Endereço
Produto vendido
Quantidade
Escopo
Observações técnicas
Data prevista
Bonificações
Itens adicionais
```

## Envia para Financeiro

```txt
Valor contratado
Forma de pagamento
Entrada
Parcelas
Comissão
Vendedor
Unidade
```

## Envia para Painel do Condomínio

```txt
Nome da obra
Status inicial
Comunicados
Diários de obra
Fotos liberadas
Token público
```

# 20. Link público com token

Como você decidiu que será link público com token criado pela Sombrear, o painel do condomínio funcionaria assim:

```txt
ecosistema.sombrear.com.br/painel/obra/TOKEN-DA-OBRA
```

Exemplo:

```txt
ecosistema.sombrear.com.br/painel/obra/rio-negro-8F39K2
```

Esse link pode ser enviado para o síndico, administradora ou grupo de moradores.

Nesse modelo, o morador não precisa de login. Mas o token deve ser difícil de adivinhar e pode ter configurações como:

```txt
Ativo / inativo
Data de criação
Data de expiração opcional
Obra vinculada
Permissão de visualização
```

O público vê apenas o que a Sombrear liberar.

Exemplo:

```txt
Status da obra
Comunicados
Fotos autorizadas
Diários simplificados
Previsão da próxima etapa
Contatos
Garantia / entrega quando finalizado
```

Não deve aparecer:

```txt
Valor de comissão
Margem
Custo interno
Anotações internas
Dados sensíveis
Documentos restritos
```

# 21. Visual do Ecosistema + CRM

O sistema deve seguir a identidade da Sombrear:

```txt
Fundo branco
Cards em cinza claro
Textos em grafite
Verde institucional para botões, linhas, status positivos e destaques
Layout limpo, técnico e moderno
```

O manual traz verde principal, verde secundário, cinzas e branco como base visual, além de linguagem limpa, técnica e moderna. 

Minha sugestão prática para o app:

```txt
Verde principal: #8DC63F
Verde escuro: #5FA12B
Grafite: #2B2B2B
Cinza texto: #6F6F6F
Cinza fundo: #F3F3F3
Branco: #FFFFFF
Fonte interface: Poppins
Fonte documentos: Montserrat / Calibri
```

# 22. Resumo da decisão para esta etapa

O primeiro protótipo deve ter:

```txt
1. Login
2. Cadastro de unidades
3. Cadastro de usuários
4. Tela Ecosistema Sombrear
5. Dashboard geral simples
6. CRM kanban
7. Card completo do cliente
8. Aba de orçamento/proposta
9. Aba de financiamento
10. Aba de comissão
11. Transformar cliente fechado em obra
12. Gerar token público da obra
```

Essa é a base certa. Depois disso, os outros módulos entram com muito mais facilidade.

# Próximo detalhamento

Agora o próximo ponto natural é desenhar a **estrutura exata do CRM**, campo por campo, já separando:

```txt
Campos obrigatórios
Campos opcionais
Campos por tipo de cliente
Campos por produto
Campos para proposta
Campos para comissão
Campos para financiamento
```

Assim a gente transforma o conceito em uma tela real.
Vamos para o próximo passo: **estrutura do CRM**.

A ideia é criar um CRM que sirva para a realidade da Sombrear, não um CRM genérico. Ele precisa acompanhar desde a prospecção até o fechamento, considerando venda para condomínio, empresa, escola, comércio, órgão público e outros clientes. Isso segue o escopo inicial que você trouxe para o Ecosistema Sombrear e para o CRM kanban. 

# CRM Sombrear — Estrutura Inicial

## 1. Tela principal do CRM

A tela principal será em formato **kanban**.

### Colunas recomendadas

```txt
1. Prospecção
2. Qualificação
3. Visita técnica agendada
4. Visita técnica realizada
5. Fazer orçamento
6. Orçamento feito
7. Proposta enviada
8. Em negociação
9. Assembleia / aprovação
10. Fechado
11. Acompanhar futuro
12. Perdido
```

Essa estrutura combina com a jornada comercial da Sombrear, que envolve visita técnica, consultoria, assembleia, proposta, contratação e execução. 

---

# 2. Card resumido no kanban

Cada cliente aparecerá como um card simples.

Exemplo:

```txt
Residencial Rio Negro

Unidade: Sombrear DF
Tipo: Condomínio residencial
Produto: Sombrite garagem
Valor estimado: R$ 480.000,00
Vendedor: Henrique
Próxima ação: Assembleia em 10/05/2026
Status: Proposta enviada
```

### Informações visíveis no card

```txt
Nome do cliente
Unidade responsável
Tipo de cliente
Produto principal
Valor estimado
Vendedor responsável
Próxima ação
Data da próxima ação
Temperatura do lead
```

Temperatura do lead:

```txt
Frio
Morno
Quente
Muito quente
```

---

# 3. Cadastro completo do cliente

Ao clicar no card, abre a ficha completa do cliente.

Eu dividiria em abas:

```txt
1. Dados gerais
2. Contatos
3. Informações comerciais
4. Produtos / escopo
5. Orçamento e proposta
6. Financiamento
7. Comissão
8. Agenda
9. Arquivos
10. Histórico
```

---

# 4. Aba: Dados gerais

Essa é a base do cadastro.

## Campos obrigatórios

```txt
Nome do cliente
Tipo de cliente
Unidade responsável
Cidade
Estado
Status no CRM
Vendedor responsável
Origem do lead
```

## Campos opcionais

```txt
CNPJ / CPF
Razão social
Nome fantasia
CEP
Endereço completo
Bairro
Complemento
Observações gerais
```

## Tipos de cliente

```txt
Condomínio residencial
Condomínio comercial
Empresa privada
Escola
Comércio
Órgão público
Associação
Pessoa física
Outro
```

## Origem do lead

```txt
Indicação
Instagram
Google
Site
WhatsApp
Cliente antigo
Administradora
Prospecção ativa
Assembleia
Evento
Outro
```

---

# 5. Aba: Contatos

Essa aba guarda as pessoas envolvidas.

## Para condomínio

```txt
Nome do síndico
Telefone do síndico
WhatsApp do síndico
E-mail do síndico
Nome da administradora
Contato da administradora
Telefone da administradora
E-mail da administradora
Contato financeiro
Contato técnico
```

## Para empresa, escola, comércio ou órgão público

```txt
Responsável principal
Cargo
Telefone
WhatsApp
E-mail
Setor
Responsável financeiro
Responsável técnico
```

## Ideia importante

O sistema deve permitir **mais de um contato por cliente**.

Exemplo:

```txt
Contato 1: Síndico
Contato 2: Subsíndico
Contato 3: Administradora
Contato 4: Financeiro
Contato 5: Morador responsável pela comissão de obras
```

Isso é essencial para condomínios, porque normalmente a decisão não depende de uma pessoa só.

---

# 6. Aba: Informações comerciais

Aqui ficam os dados que ajudam a vender e acompanhar a oportunidade.

## Campos principais

```txt
Número de unidades
Número de blocos
Número de vagas
Área aproximada
Valor estimado da obra
Valor por vaga
Valor por unidade/morador
Previsão de fechamento
Probabilidade de fechamento
Temperatura do lead
Principal necessidade do cliente
Principal objeção
Concorrente envolvido
Observações comerciais
```

## Probabilidade de fechamento

```txt
10%
25%
50%
75%
90%
```

## Principal necessidade

```txt
Sombra para veículos
Proteção contra chuva
Valorização patrimonial
Conforto térmico
Área de lazer
Energia solar
Manutenção de estrutura existente
Adequação estética
Outro
```

## Principal objeção

```txt
Preço
Aprovação em assembleia
Financiamento
Prazo de obra
Dúvida técnica
Comparação com concorrente
Falta de urgência
Resistência dos moradores
Outro
```

---

# 7. Aba: Produtos / escopo

Aqui o vendedor adiciona o que está sendo vendido.

A Sombrear possui um portfólio que inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

## Produtos iniciais

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

## Campos por produto

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Observações técnicas
Inclui iluminação?
Inclui calha?
Inclui rufo?
Inclui bicicletário?
Inclui pintura?
Inclui projeto?
Inclui ART?
```

## Exemplo

```txt
Produto: Sombrite garagem
Quantidade: 80 vagas
Valor por vaga: R$ 6.000,00
Valor total: R$ 480.000,00
Local: Estacionamento externo
Tipo de solo: Intertravado
Fixação: Chumbado
Inclui ART: Sim
Inclui projeto: Sim
```

O sistema precisa permitir **mais de um produto na mesma oportunidade**.

Exemplo:

```txt
Produto 1: Sombrite garagem
Produto 2: Sombrite parquinho
Produto 3: Telha galvalume na entrada
```

---

# 8. Aba: Orçamento e proposta

Aqui começa a parte mais importante da venda.

## Funções da aba

```txt
Criar orçamento
Editar orçamento
Gerar proposta simplificada
Gerar proposta completa
Gerar PDF
Registrar envio da proposta
Definir validade da proposta
Aplicar desconto
Registrar aprovação
Registrar recusa
```

## Campos do orçamento

```txt
Valor bruto
Desconto
Valor final
Forma de pagamento
Prazo de execução estimado
Validade da proposta
Observações comerciais
Observações técnicas
```

## Tipos de proposta

Eu criaria dois modelos:

### Proposta simplificada

Para envio rápido.

```txt
Cliente
Produto
Quantidade
Valor total
Condição de pagamento
Validade
Assinatura / contato
```

### Proposta completa

Para venda mais forte, principalmente assembleias.

```txt
Capa
Apresentação da Sombrear
Diagnóstico
Escopo
Produtos
Diferenciais técnicos
Condições comerciais
Prazo
Garantia
Assinatura
```

A proposta comercial pode usar mais identidade visual, com verde, branco, espaçamento e destaques, conforme o padrão visual definido para materiais comerciais da marca. 

---

# 9. Aba: Financiamento

Essa aba é especialmente importante para condomínios.

## Campos

```txt
Valor total da obra
Entrada
Valor financiado
Número de unidades
Número de parcelas
Taxa de juros mensal
Tipo de financiamento
Valor estimado por unidade
Valor estimado por vaga
Observações
```

## Tipos de financiamento

```txt
Pagamento à vista
Entrada + parcelas
Financiamento próprio
Financeira parceira
Condição personalizada
```

## Exemplo de uso

```txt
Valor da obra: R$ 480.000,00
Número de unidades: 160
Parcelas: 24
Valor aproximado por unidade: R$ 125,00/mês
```

Esse cálculo ajuda muito em assembleia, porque transforma uma obra grande em um valor fácil de entender para os moradores.

---

# 10. Aba: Comissão

Aqui o sistema calcula automaticamente a comissão do vendedor.

## Campos

```txt
Vendedor responsável
Valor total da venda
Percentual de comissão
Valor da comissão
Status da comissão
Data prevista de pagamento
Data de pagamento
Observações
```

## Status da comissão

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

## Regras importantes

A comissão deve ser calculada automaticamente, mas apenas usuários com permissão devem conseguir alterar.

Exemplo:

```txt
Valor da venda: R$ 480.000,00
Comissão: 2%
Valor da comissão: R$ 9.600,00
```

Também recomendo separar comissão por tipo:

```txt
Comissão da venda principal
Comissão de aditivo
Comissão de produto extra
Comissão especial
```

---

# 11. Aba: Agenda

Aqui ficam todos os compromissos comerciais.

## Tipos de eventos

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

## Campos

```txt
Tipo do evento
Data
Horário
Responsável
Descrição
Lembrete
Status
```

## Status do evento

```txt
Agendado
Realizado
Remarcado
Cancelado
Pendente
```

---

# 12. Aba: Arquivos

Essa aba guarda documentos e imagens.

## Arquivos permitidos

```txt
Fotos da visita
Vídeos
Croquis
Projetos
Ata
Edital
Proposta
Contrato
Documentos do cliente
Comprovantes
Outros anexos
```

## Organização recomendada

```txt
Cliente
 ├── Fotos
 ├── Propostas
 ├── Contratos
 ├── Projetos
 ├── Documentos comerciais
 └── Documentos internos
```

---

# 13. Aba: Histórico

Tudo que acontece no card deve ficar salvo.

## Exemplos de histórico

```txt
Henrique criou o cliente.
Cliente movido de Prospecção para Visita técnica agendada.
Visita técnica marcada para 03/05/2026.
Proposta gerada no valor de R$ 480.000,00.
Proposta enviada por WhatsApp.
Cliente movido para Assembleia / aprovação.
Cliente marcado como Fechado.
```

Isso ajuda muito na gestão e evita perda de informação.

---

# 14. Campos que devem ser editáveis nas configurações

Para o sistema não ficar travado, o administrador deve poder editar:

```txt
Colunas do kanban
Tipos de cliente
Tipos de produto
Origens do lead
Motivos de perda
Tipos de financiamento
Percentuais padrão de comissão
Status comerciais
Status de proposta
Modelos de proposta
Unidades da Sombrear
Usuários
Permissões
```

Isso atende ao seu pedido de ter um modo de configurações para editar status, valores, peças e itens principais. 

---

# 15. Quando o cliente for marcado como “Fechado”

Ao mover o card para **Fechado**, o sistema deve abrir uma confirmação:

```txt
Cliente fechado com sucesso.

Deseja agora:

[Gerar obra]
[Gerar contrato]
[Gerar painel público]
[Enviar para financeiro]
```

Minha recomendação: o botão principal deve ser:

```txt
Gerar obra
```

Quando clicar em **Gerar obra**, o sistema cria automaticamente:

```txt
Obra no dashboard de produção
Registro inicial no financeiro
Token do painel público
Pasta de arquivos da obra
Checklist de implantação
```

---

# 16. Primeira versão do CRM

Para o primeiro protótipo, eu faria esta versão:

```txt
Login
Tela Ecosistema
Cadastro de unidades
Cadastro de usuários
CRM kanban
Cadastro de cliente
Cadastro de contatos
Cadastro de produtos no card
Orçamento simples
Cálculo de valor por unidade
Cálculo de comissão
Agenda comercial
Histórico do card
Botão “Gerar obra”
Geração de token público
```

Ainda não precisa começar com tudo perfeito. O mais importante é montar uma base bem feita para o CRM alimentar os próximos módulos.

---

# Próximo passo

Agora podemos detalhar o **Ecosistema Sombrear**, ou seja, a tela mãe: menus, dashboard geral, permissões por tipo de usuário e separação por unidades.
Perfeito. Agora vamos detalhar o **Ecosistema Sombrear**, que será a **tela mãe** e o **centro de controle** dos sistemas.

A lógica é: o usuário entra no Ecosistema, o sistema identifica **quem ele é**, **qual unidade ele pertence** e **quais módulos ele pode acessar**. A partir daí, ele vê apenas o que faz sentido para o perfil dele.

# Ecosistema Sombrear — Estrutura da tela mãe

O seu escopo original já define que o Ecosistema terá módulos como CRM, propostas, pedidos, calculadora de materiais, painel visual do condomínio, produção/execução e financeiro. Também define que o proprietário/gestor geral terá visão macro dos setores, enquanto os demais usuários verão apenas resumos das suas áreas. 

## 1. Tela de login

Primeira tela do sistema:

```txt
ECOSISTEMA SOMBREAR

E-mail
Senha

[Entrar]

Esqueci minha senha
```

Como você pediu validação por e-mail, o fluxo ideal é:

```txt
Administrador cadastra o usuário
Usuário recebe convite por e-mail
Usuário confirma e cria senha
Usuário entra no sistema
```

Esse fluxo fica bom com Supabase, porque ele já permite autenticação por e-mail, recuperação de senha e controle de sessão.

---

# 2. Tela inicial após login

Depois que o usuário entra, ele cai no **Dashboard do Ecosistema**.

## Cabeçalho

```txt
Logo Sombrear        Ecosistema Sombrear

Unidade: Sombrear DF
Usuário: Henrique Palmer
Perfil: Engenharia / Administrador

[Notificações] [Configurações] [Sair]
```

## Menu lateral

```txt
Início
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Relatórios
Configurações
```

## Área principal

A área principal terá:

```txt
Cards de acesso aos sistemas
Resumo geral da operação
Alertas importantes
Indicadores rápidos
Atalhos de ação
```

---

# 3. Cards dos sistemas

Cada módulo aparece como um card grande, com ícone, nome e resumo.

```txt
[CRM]
Clientes em prospecção: 18
Propostas enviadas: 9

[Propostas]
Propostas abertas: 7
Propostas vencendo: 2

[Pedidos]
Pedidos pendentes: 5
Pedidos aprovados: 3

[Produção / Execução]
Obras em execução: 6
Obras atrasadas: 1

[Painel Condomínio]
Painéis ativos: 12
Comunicados publicados: 4

[Financeiro]
Contas a pagar: R$ xx.xxx,xx
Contas a receber: R$ xx.xxx,xx

[Calculadora de Materiais]
Em construção
```

A Calculadora de Materiais pode aparecer desde a primeira versão, mas marcada como **“Em construção”**, como você indicou no escopo. 

---

# 4. Dashboard geral do proprietário

Esse dashboard é a visão mais importante para os donos e gestores.

## Indicadores principais

```txt
Valor em negociação
Valor vendido no mês
Valor vendido no ano
Obras em contrato
Obras em produção
Obras em execução
Obras entregues
Obras atrasadas
Comissões previstas
Comissões pagas
Contas a receber
Contas a pagar
Saldo previsto
```

## Indicadores comerciais

```txt
Leads novos
Propostas enviadas
Taxa de conversão
Ticket médio
Vendas por vendedor
Vendas por unidade
Vendas por produto
Clientes perdidos
Motivos de perda
```

## Indicadores de execução

```txt
Obras em fase de contrato
Obras em fabricação
Obras em fundação
Obras em instalação
Obras em retoque
Obras aguardando entrega
Obras com pendência
Bonificações pendentes
```

Isso conversa diretamente com a sua preocupação no dashboard de produção: não esquecer etapas, bonificações e pendências de obra. 

---

# 5. Visão por unidade

Como você confirmou que o sistema será separado por unidades, o dashboard deve ter um seletor:

```txt
Visualizar:
[ Todas as unidades ▼ ]

Opções:
Todas as unidades
Sombrear GO
Sombrear DF
Sombrear SP
Sombrear MG
```

## Regra de visualização

```txt
Proprietário: vê todas as unidades
Gestor geral: vê todas ou unidades autorizadas
Gestor de unidade: vê apenas sua unidade
Vendedor: vê apenas sua unidade e seus clientes
Engenharia: vê obras da sua unidade
Financeiro: vê financeiro da sua unidade ou das unidades autorizadas
Líder de obra: vê apenas obras vinculadas a ele
```

Na prática, quase todas as tabelas do banco terão um campo:

```txt
unidade_id
```

Isso cria a separação entre Sombrear DF, Sombrear GO e futuras unidades.

---

# 6. Perfis de usuário

Eu criaria estes perfis iniciais:

```txt
Proprietário
Gestor geral
Administrador do sistema
Gestor de unidade
Vendedor
Engenharia
Compras
Financeiro
Líder de obra
Assistente administrativo
Visualizador
```

## Proprietário

Pode ver e alterar tudo.

Permissões:

```txt
Ver todas as unidades
Acessar dashboard global
Gerenciar usuários
Gerenciar unidades
Acessar financeiro
Acessar CRM
Acessar produção
Acessar relatórios
Alterar configurações gerais
```

## Gestor geral

Muito parecido com proprietário, mas pode ter restrição em configurações sensíveis.

```txt
Ver unidades autorizadas
Ver dashboard global
Acompanhar vendas
Acompanhar obras
Acompanhar financeiro
Emitir relatórios
Gerenciar operação
```

## Administrador do sistema

Perfil técnico/operacional para cadastrar e configurar.

```txt
Cadastrar usuários
Cadastrar unidades
Editar permissões
Editar status
Editar produtos
Editar modelos
Configurar sistema
```

## Gestor de unidade

Responsável por uma unidade específica.

```txt
Ver dashboard da unidade
Ver CRM da unidade
Ver obras da unidade
Ver financeiro da unidade, se autorizado
Ver relatórios da unidade
Gerenciar equipe da unidade
```

## Vendedor

Focado no CRM e propostas.

```txt
Ver seus próprios clientes
Criar clientes
Editar clientes próprios
Criar propostas
Calcular comissão
Agendar visitas
Agendar assembleias
Anexar fotos e documentos
Ver suas comissões
```

## Engenharia

Focada em obras e parte técnica.

```txt
Ver clientes fechados
Ver dados técnicos
Criar obra
Atualizar etapas da obra
Publicar diário de obra
Enviar fotos para painel público
Registrar pendências
Registrar bonificações
Emitir relatórios técnicos
```

## Compras

Focado em materiais e pedidos.

```txt
Ver obras liberadas para compra
Ver lista de materiais
Criar pedidos
Atualizar status de compra
Informar previsão de entrega
Anexar notas ou comprovantes
```

## Financeiro

Focado em contas e recebimentos.

```txt
Ver contratos fechados
Controlar contas a pagar
Controlar contas a receber
Ver parcelas
Ver comissões
Marcar pagamentos
Emitir relatórios financeiros
```

## Líder de obra

Perfil de campo.

```txt
Ver obras atribuídas
Atualizar checklist da obra
Enviar fotos
Criar diário de obra
Informar pendências
Solicitar material
Marcar etapa como concluída
```

## Visualizador

Apenas consulta.

```txt
Ver informações permitidas
Não editar
Não excluir
Não aprovar
```

---

# 7. Matriz de permissões

No sistema, isso pode virar uma tabela simples de permissões.

Exemplo:

| Módulo            | Proprietário |  Gestor | Vendedor | Engenharia | Financeiro |   Líder |
| ----------------- | -----------: | ------: | -------: | ---------: | ---------: | ------: |
| Dashboard global  |          Sim |     Sim |      Não |        Não |        Não |     Não |
| CRM               |          Sim |     Sim |      Sim |    Parcial |        Não |     Não |
| Propostas         |          Sim |     Sim |      Sim |        Ver |        Não |     Não |
| Produção          |          Sim |     Sim |      Ver |        Sim |        Não | Parcial |
| Financeiro        |          Sim |     Sim |      Não |        Não |        Sim |     Não |
| Configurações     |          Sim | Parcial |      Não |        Não |        Não |     Não |
| Painel condomínio |          Sim |     Sim |      Ver |        Sim |        Não | Parcial |

A regra mais importante: **o usuário só vê o que tem permissão para acessar**.

---

# 8. Notificações do Ecosistema

O Ecosistema deve ter uma área de alertas.

Exemplos:

```txt
Proposta vencendo hoje
Cliente parado há mais de 7 dias
Assembleia amanhã
Obra sem atualização há 3 dias
Bonificação pendente
Pagamento de cliente em atraso
Comissão a pagar
Pedido de material pendente
Diário de obra não preenchido
Painel do condomínio sem atualização
```

Esses alertas fazem o sistema deixar de ser apenas um cadastro e virar uma ferramenta de gestão.

---

# 9. Atalhos rápidos

Na tela inicial, eu colocaria botões de ação rápida:

```txt
+ Novo cliente
+ Nova proposta
+ Nova obra
+ Novo comunicado
+ Novo diário de obra
+ Nova conta a pagar
+ Novo usuário
```

Mas cada usuário só vê os atalhos que tem permissão para usar.

Exemplo:

O vendedor vê:

```txt
+ Novo cliente
+ Nova proposta
+ Agendar visita
```

A engenharia vê:

```txt
+ Diário de obra
+ Atualizar etapa
+ Registrar pendência
```

O financeiro vê:

```txt
+ Conta a pagar
+ Conta a receber
+ Registrar pagamento
```

---

# 10. Relatórios gerais

O sistema precisa emitir relatórios das informações mais importantes, como você pediu no escopo. 

## Relatórios do Ecosistema

```txt
Relatório geral por unidade
Relatório comercial
Relatório de propostas
Relatório de obras
Relatório de produtividade
Relatório financeiro
Relatório de comissões
Relatório de clientes perdidos
Relatório de produtos mais vendidos
Relatório de etapas atrasadas
```

## Filtros dos relatórios

```txt
Unidade
Período
Vendedor
Produto
Tipo de cliente
Status
Cidade
Responsável
```

## Exportação

```txt
PDF
Excel
CSV
```

---

# 11. Configurações do Ecosistema

Essa área será liberada apenas para administradores e proprietários.

## Configurações principais

```txt
Unidades
Usuários
Perfis e permissões
Produtos
Tipos de clientes
Status do CRM
Status de obra
Tipos de proposta
Comissões
Modelos de documentos
Valores padrão
Motivos de perda
Cidades atendidas
Configurações do painel público
```

## Cadastro de unidade

Campos:

```txt
Nome da unidade
Estado
Cidade sede
CNPJ
Responsável
Telefone
E-mail
Endereço
Status da unidade
```

Exemplo:

```txt
Nome: Sombrear DF
Estado: DF
Cidade sede: Brasília
Responsável: Henrique Palmer
Status: Ativa
```

## Cadastro de usuário

Campos:

```txt
Nome completo
E-mail
Telefone
Unidade
Cargo
Perfil de acesso
Status
Enviar convite por e-mail
```

Status:

```txt
Ativo
Pendente de confirmação
Bloqueado
Desativado
```

---

# 12. Segurança

Como você pediu sistema de segurança para evitar invasões, eu estruturaria assim:

```txt
Login obrigatório
Validação por e-mail
Recuperação de senha
Permissões por perfil
Separação por unidade
Registro de histórico de ações
Token seguro para painel público
Bloqueio de acesso a dados internos
Backup do banco
Controle de arquivos privados e públicos
```

## Histórico de ações

O sistema deve registrar:

```txt
Quem criou
Quem editou
Quem excluiu
Quem moveu etapa
Quem gerou proposta
Quem marcou obra como concluída
Quem publicou algo no painel público
```

Esse histórico é essencial para controle interno.

---

# 13. Painel público com token

No Ecosistema, haverá uma área para gerenciar os painéis públicos.

Exemplo:

```txt
Obra: Residencial Rio Negro
Token: rio-negro-A7K92F
Status: Ativo
Link: ecosistema.sombrear.com.br/painel/rio-negro-A7K92F

[Copiar link]
[Desativar link]
[Gerar novo token]
[Ver painel]
```

Como esse painel será enviado para síndico e moradores, ele deve exibir apenas informações liberadas. No seu escopo, esse painel mostra status da obra, comunicados, diários e relatórios simplificados para moradores acompanharem o andamento. 

Não deve mostrar:

```txt
Comissão
Custo interno
Margem
Contas da empresa
Anotações internas
Problemas comerciais sensíveis
```

---

# 14. Dashboard para TV

Esse é um ponto muito bom do seu escopo.

Eu criaria uma rota/tela específica:

```txt
/tv
```

Ou:

```txt
/ecosistema/tv-producao
```

Essa tela ficaria em modo apresentação, sem menu lateral, com atualização automática.

## O que mostrar na TV

```txt
Obras em execução
Obras por etapa
Obras atrasadas
Próximas entregas
Pendências críticas
Bonificações pendentes
Pedidos de materiais pendentes
Visitas ou instalações do dia
Indicador de produtividade semanal
```

## Visual da TV

```txt
Cards grandes
Pouco texto
Cores por status
Atualização automática
Modo tela cheia
Sem dados financeiros sensíveis
```

A ideia é que qualquer pessoa no escritório olhe e entenda rapidamente o andamento geral das obras.

---

# 15. Visual do Ecosistema

A interface deve seguir a identidade da Sombrear: comunicação limpa, técnica e moderna, usando fundo branco, textos em cinza escuro e verde institucional para destaques. O manual também recomenda evitar poluição visual e excesso de cores. 

## Paleta recomendada para o sistema

```txt
Verde principal: #8DC63F
Verde secundário: #5FA12B
Verde claro: #CFE8A9
Grafite: #2B2B2B
Cinza médio: #6F6F6F
Cinza claro: #F3F3F3
Branco: #FFFFFF
```

## Estilo de componentes

```txt
Cards com cantos arredondados
Botões verdes
Fundo branco ou cinza claro
Menu lateral limpo
Ícones simples
Gráficos claros
Pouca sombra
Muito espaçamento
```

## Fontes

Para o app, eu usaria:

```txt
Interface do sistema: Poppins
Documentos e propostas: Montserrat ou Calibri
```

O manual traz Poppins como fonte principal em uma parte e Montserrat como fonte oficial em outra, então a melhor solução prática é: **Poppins para o sistema** e **Montserrat para materiais comerciais e documentos visuais**. 

---

# 16. Estrutura de navegação recomendada

```txt
Ecosistema Sombrear
│
├── Início
│   ├── Dashboard geral
│   ├── Alertas
│   └── Atalhos rápidos
│
├── CRM
│   ├── Kanban
│   ├── Clientes
│   ├── Propostas
│   └── Comissões
│
├── Produção / Execução
│   ├── Obras
│   ├── Kanban de etapas
│   ├── Checklists
│   ├── Pendências
│   └── TV Produção
│
├── Painel Condomínio
│   ├── Painéis ativos
│   ├── Comunicados
│   ├── Diários de obra
│   └── Tokens públicos
│
├── Financeiro
│   ├── Contas a pagar
│   ├── Contas a receber
│   ├── Comissões
│   └── Relatórios
│
├── Pedidos
│   ├── Pedidos
│   ├── Fornecedores
│   └── Status
│
├── Calculadora de Materiais
│   └── Em construção
│
├── Relatórios
│   ├── Comercial
│   ├── Produção
│   ├── Financeiro
│   └── Geral
│
└── Configurações
    ├── Unidades
    ├── Usuários
    ├── Permissões
    ├── Produtos
    ├── Status
    └── Modelos
```

---

# 17. Primeira versão do Ecosistema

Para não criar um sistema grande demais logo no começo, a primeira versão deve ter:

```txt
Login com e-mail
Cadastro de unidades
Cadastro de usuários
Perfis de acesso
Tela inicial do Ecosistema
Cards dos módulos
Dashboard geral simples
Menu lateral
CRM integrado
Configurações básicas
Token público da obra
Tela de TV simples
```

O restante pode ser evoluído módulo por módulo.

---

# 18. Decisão recomendada

Para o protótipo inicial, eu seguiria esta ordem:

```txt
1. Criar base do Ecosistema
2. Criar login e permissões
3. Criar cadastro de unidades
4. Criar tela inicial com cards dos módulos
5. Criar CRM kanban
6. Criar ficha do cliente
7. Criar proposta/comissão dentro do CRM
8. Criar botão “Gerar obra”
9. Criar painel público com token
10. Criar dashboard de produção simples
```

Essa ordem evita retrabalho. Primeiro a base, depois o CRM, depois a obra.

# Próximo passo

Agora podemos detalhar o **banco de dados do Ecosistema + CRM**, já pensando em Supabase: tabelas, campos principais, relação entre unidades, usuários, clientes, propostas, comissões, obras e token público.
Perfeito. Agora vamos para o **banco de dados do Ecosistema Sombrear + CRM**, pensando em uma estrutura real para usar com **Supabase**.

A escolha do Supabase faz sentido porque ele combina banco PostgreSQL, autenticação, APIs automáticas, storage e regras de segurança em uma mesma plataforma. A própria documentação atual do Supabase destaca banco Postgres, Auth, APIs, Realtime e Storage como recursos centrais. ([Supabase][1]) Além disso, o Supabase Auth permite autenticação e autorização com métodos como e-mail/senha, magic link, OTP, login social e SSO, o que atende bem ao seu pedido de validação por e-mail. ([Supabase][2])

# 1. Conceito principal do banco

O banco precisa ser organizado em camadas:

```txt
1. Base do sistema
   Unidades, usuários, permissões e configurações.

2. CRM
   Clientes, contatos, oportunidades, produtos, propostas, financiamento, comissão e histórico.

3. Obras
   Obras geradas a partir de clientes fechados, etapas, diários, comunicados e painel público.

4. Financeiro
   Contas a pagar, contas a receber, parcelas, comissões e pagamentos.

5. Arquivos
   Fotos, propostas, contratos, documentos, projetos e anexos.
```

Essa divisão segue o escopo que você trouxe: sistema mãe, CRM, proposta com comissão, pedidos, calculadora, painel visual do condomínio, produção/execução e financeiro. 

---

# 2. Regra mais importante: tudo precisa ter unidade

Como você decidiu que será separado por unidades, praticamente todas as tabelas importantes devem ter o campo:

```txt
unidade_id
```

Exemplo:

```txt
Cliente A → Sombrear DF
Cliente B → Sombrear GO
Obra C → Sombrear DF
Usuário D → Sombrear SP
```

Isso permite que:

```txt
Proprietário veja todas as unidades.
Gestor geral veja todas ou algumas unidades.
Gestor de unidade veja somente a unidade dele.
Vendedor veja somente seus clientes.
Engenharia veja obras da unidade autorizada.
```

Essa separação por unidade é o que vai permitir crescer para outros estados sem bagunçar os dados.

---

# 3. Tabelas da base do Ecosistema

## 3.1. `unidades`

Guarda as unidades da Sombrear.

```txt
id
nome
slug
cnpj
estado
cidade
endereco
telefone
email
responsavel_nome
responsavel_email
status
created_at
updated_at
```

Exemplo:

```txt
Nome: Sombrear DF
Slug: sombrear-df
Estado: DF
Cidade: Brasília
Status: ativa
```

O campo `slug` ajuda em links internos e filtros.

---

## 3.2. `usuarios_perfis`

Essa tabela complementa os usuários do Supabase Auth.

O Supabase Auth cuida do login, senha e confirmação de e-mail. A tabela `usuarios_perfis` guarda os dados internos da Sombrear.

```txt
id
auth_user_id
nome
email
telefone
cargo
perfil
unidade_principal_id
status
avatar_url
created_at
updated_at
```

Perfis iniciais:

```txt
proprietario
gestor_geral
administrador
gestor_unidade
vendedor
engenharia
compras
financeiro
lider_obra
assistente
visualizador
```

Status:

```txt
ativo
pendente
bloqueado
desativado
```

---

## 3.3. `usuarios_unidades`

Essa tabela permite que um usuário tenha acesso a mais de uma unidade.

```txt
id
usuario_id
unidade_id
perfil_na_unidade
created_at
```

Exemplo:

```txt
Henrique → Sombrear DF → Engenharia/Admin
Diretor → Sombrear GO → Proprietário
Diretor → Sombrear DF → Proprietário
```

Isso é melhor do que prender o usuário em uma única unidade.

---

## 3.4. `permissoes`

Tabela para controlar acessos específicos.

```txt
id
perfil
modulo
pode_ver
pode_criar
pode_editar
pode_excluir
pode_aprovar
pode_exportar
created_at
updated_at
```

Exemplo:

```txt
Perfil: vendedor
Módulo: CRM
Pode ver: sim
Pode criar: sim
Pode editar: sim
Pode excluir: não
Pode aprovar: não
```

---

## 3.5. `configuracoes_sistema`

Aqui ficam configurações editáveis pelo administrador.

```txt
id
chave
valor
tipo
unidade_id
created_at
updated_at
```

Exemplo:

```txt
chave: percentual_comissao_padrao
valor: 2
tipo: numero
unidade_id: Sombrear DF
```

Essa tabela ajuda a deixar o sistema flexível, como você pediu: editar status, produtos, valores e itens principais. 

---

# 4. Tabelas do CRM

Agora vem o coração do sistema.

## 4.1. `clientes`

Essa tabela guarda o cliente principal.

```txt
id
unidade_id
tipo_cliente
nome
razao_social
nome_fantasia
cnpj_cpf
cep
endereco
numero
complemento
bairro
cidade
estado
origem_lead
status_geral
responsavel_comercial_id
observacoes
created_at
updated_at
deleted_at
```

Tipos de cliente:

```txt
condominio_residencial
condominio_comercial
empresa_privada
escola
comercio
orgao_publico
associacao
pessoa_fisica
outro
```

Aqui fica o cadastro base. Oportunidade, proposta e obra ficam em tabelas separadas.

---

## 4.2. `cliente_contatos`

Um cliente pode ter vários contatos.

```txt
id
cliente_id
nome
cargo
tipo_contato
telefone
whatsapp
email
principal
observacoes
created_at
updated_at
```

Tipos de contato:

```txt
sindico
subsindico
administradora
financeiro
tecnico
compras
morador_representante
responsavel_empresa
outro
```

Isso é essencial para condomínios, porque a Sombrear atua com síndico, administradora, moradores, assembleia e plantão de dúvidas. O raio-x operacional mostra que o processo envolve suporte em assembleias, comunicação com moradores e plantão de dúvidas. 

---

## 4.3. `crm_colunas`

Colunas editáveis do kanban.

```txt
id
unidade_id
nome
ordem
cor
ativo
created_at
updated_at
```

Colunas iniciais:

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

Como o usuário pediu que as colunas sejam editáveis, não recomendo deixar isso fixo no código. É melhor salvar no banco.

---

## 4.4. `oportunidades`

Essa é uma das tabelas mais importantes.

Uma oportunidade é a negociação comercial com aquele cliente.

```txt
id
cliente_id
unidade_id
coluna_id
titulo
descricao
vendedor_id
valor_estimado
valor_fechado
probabilidade
temperatura
previsao_fechamento
data_fechamento
motivo_perda
concorrente
proxima_acao
data_proxima_acao
status
created_at
updated_at
```

Por que separar `clientes` de `oportunidades`?

Porque um mesmo cliente pode ter mais de uma oportunidade ao longo do tempo.

Exemplo:

```txt
Cliente: Condomínio Rio Negro

Oportunidade 1: Sombrite estacionamento
Oportunidade 2: Cobertura do parquinho
Oportunidade 3: Manutenção corretiva futura
```

Isso deixa o CRM mais profissional.

---

## 4.5. `produtos`

Cadastro geral dos produtos da Sombrear.

```txt
id
nome
categoria
descricao
ativo
created_at
updated_at
```

Produtos iniciais:

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

O portfólio operacional da Sombrear já inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

---

## 4.6. `oportunidade_produtos`

Produtos vinculados a uma oportunidade.

```txt
id
oportunidade_id
produto_id
nome_personalizado
quantidade_vagas
area_m2
valor_unitario
valor_total
local_instalacao
tipo_solo
tipo_fixacao
inclui_iluminacao
inclui_calha
inclui_rufo
inclui_bicicletario
inclui_pintura
inclui_projeto
inclui_art
observacoes_tecnicas
created_at
updated_at
```

Aqui entra a flexibilidade que você pediu: o cliente pode comprar mais de um tipo de cobertura, como sombrite, telha galvalume, termoacústica, parquinho, piscina e carport solar. 

---

## 4.7. `propostas`

Tabela da proposta comercial.

```txt
id
oportunidade_id
cliente_id
unidade_id
numero_proposta
tipo_proposta
status
valor_bruto
desconto_valor
desconto_percentual
valor_final
forma_pagamento
prazo_execucao
validade
observacoes_comerciais
observacoes_tecnicas
arquivo_pdf_url
gerada_por_id
enviada_em
aprovada_em
recusada_em
created_at
updated_at
```

Tipos de proposta:

```txt
simplificada
completa
personalizada
```

Status:

```txt
rascunho
gerada
enviada
em_analise
aprovada
recusada
vencida
cancelada
```

O manual de identidade visual indica que propostas devem ter visual mais comercial, com destaques em verde e boa clareza, então a tabela deve permitir gerar PDF com modelo visual próprio. 

---

## 4.8. `proposta_itens`

Itens dentro da proposta.

```txt
id
proposta_id
produto_id
descricao
quantidade
unidade_medida
valor_unitario
valor_total
ordem
created_at
updated_at
```

Exemplo:

```txt
Item 1: Cobertura em sombrite para 80 vagas
Item 2: Cobertura em sombrite para playground
Item 3: Iluminação
```

---

## 4.9. `simulacoes_financiamento`

Aba de financiamento do CRM.

```txt
id
oportunidade_id
proposta_id
valor_total
entrada
valor_financiado
numero_unidades
numero_parcelas
taxa_juros_mensal
tipo_financiamento
valor_parcela_total
valor_estimado_por_unidade
valor_estimado_por_vaga
observacoes
created_at
updated_at
```

Tipos:

```txt
a_vista
entrada_mais_parcelas
financiamento_proprio
financeira_parceira
personalizado
```

Essa tabela é importante para assembleias, porque permite mostrar o valor da obra dividido por unidade/morador.

---

## 4.10. `comissoes`

Cálculo de comissão do vendedor.

```txt
id
oportunidade_id
proposta_id
vendedor_id
unidade_id
tipo_comissao
valor_base
percentual
valor_comissao
status
data_prevista_pagamento
data_pagamento
observacoes
created_at
updated_at
```

Tipos:

```txt
venda_principal
aditivo
produto_extra
especial
```

Status:

```txt
prevista
aprovada
a_pagar
paga_parcialmente
paga
cancelada
```

Essa tabela depois conversa com o financeiro.

---

## 4.11. `agenda_eventos`

Eventos do CRM.

```txt
id
cliente_id
oportunidade_id
unidade_id
responsavel_id
tipo_evento
titulo
descricao
data_inicio
data_fim
status
lembrete
created_at
updated_at
```

Tipos:

```txt
ligacao
whatsapp
reuniao
visita_tecnica
envio_proposta
retorno_comercial
assembleia
plantao_duvidas
assinatura_contrato
outro
```

---

## 4.12. `crm_historico`

Histórico de tudo que acontece no card.

```txt
id
cliente_id
oportunidade_id
usuario_id
tipo_evento
descricao
dados_antes
dados_depois
created_at
```

Exemplos:

```txt
Cliente criado
Card movido de Prospecção para Visita técnica
Proposta gerada
Proposta enviada
Cliente marcado como Fechado
Comissão calculada
```

Esse histórico é essencial para gestão e segurança interna.

---

# 5. Tabelas de obras

Quando a oportunidade for marcada como **Fechado**, o sistema cria uma obra.

## 5.1. `obras`

```txt
id
cliente_id
oportunidade_id
proposta_id
unidade_id
nome_obra
numero_contrato
endereco_obra
cidade
estado
responsavel_engenharia_id
lider_obra_id
status_obra
data_inicio_prevista
data_inicio_real
data_entrega_prevista
data_entrega_real
valor_contrato
observacoes_internas
created_at
updated_at
```

Status iniciais podem seguir o painel que você descreveu:

```txt
Em fase de contrato
Em fase de plantão
Docs finais de financiamento
Fase desembolso
Docs análise financiamento
Fechamento do aditivo
Contrato da financeira
Finalização da etapa de contrato
Fabricação das bases / pés / chumbadores
Início do canteiro de obras
Execução das fundações e chumbação
Fabricação dos braços / arcos / telas
Instalação dos braços / arcos / telas
Retoques de pintura
Entrega do termo de entrega e garantia
```

Essas etapas vieram diretamente do seu escopo para o painel visual do condomínio. 

---

## 5.2. `obra_etapas`

Tabela para controlar as etapas da obra.

```txt
id
obra_id
nome
descricao
ordem
status
data_inicio_prevista
data_inicio_real
data_fim_prevista
data_fim_real
responsavel_id
visivel_no_painel_publico
created_at
updated_at
```

Status:

```txt
nao_iniciada
em_andamento
aguardando
concluida
atrasada
cancelada
```

O campo `visivel_no_painel_publico` é importante porque nem tudo que a engenharia vê deve aparecer para o morador.

---

## 5.3. `obra_checklists`

Checklist interno de execução.

```txt
id
obra_id
etapa_id
titulo
descricao
obrigatorio
concluido
concluido_por_id
concluido_em
created_at
updated_at
```

Exemplo:

```txt
Conferir local do canteiro
Confirmar betoneira
Confirmar bases ou pés
Verificar ferramentas
Executar bonificação prevista
Publicar diário de obra
```

Esse checklist resolve o problema que você comentou: evitar esquecer bonificações ou etapas importantes. 

---

## 5.4. `obra_diarios`

Diário de obra.

```txt
id
obra_id
unidade_id
data
titulo
descricao
equipe_presente
clima
atividades_realizadas
pendencias
proximos_passos
criado_por_id
visivel_no_painel_publico
created_at
updated_at
```

O diário pode ter uma versão interna completa e uma versão simplificada para o painel público.

---

## 5.5. `obra_comunicados`

Comunicados para síndico/moradores.

```txt
id
obra_id
titulo
mensagem
tipo
publicado
publicado_em
publicado_por_id
visivel_no_painel_publico
created_at
updated_at
```

Tipos:

```txt
inicio_obra
interdicao_vagas
mudanca_etapa
aviso_ruido
aviso_poeira
retorno_equipe
entrega
geral
```

---

## 5.6. `obra_fotos`

Fotos da obra.

```txt
id
obra_id
etapa_id
diario_id
arquivo_url
legenda
tipo
visivel_no_painel_publico
enviado_por_id
created_at
```

Tipos:

```txt
antes
durante
depois
pendencia
entrega
drone
documento
```

O raio-x operacional prevê registro completo com filmagens de drone e fotografias profissionais na entrega, então essa tabela já deixa isso preparado. 

---

# 6. Painel público com token

Como você decidiu que o painel será por link público com token criado por vocês, precisamos de uma tabela específica.

## 6.1. `painel_publico_tokens`

```txt
id
obra_id
token
slug
ativo
criado_por_id
expira_em
ultimo_acesso_em
total_acessos
created_at
updated_at
```

Exemplo de link:

```txt
ecosistema.sombrear.com.br/painel/rio-negro-A7K92F
```

Regras:

```txt
Token precisa ser longo e difícil de adivinhar.
Token pode ser desativado.
Token pode ser regenerado.
Painel mostra apenas informações liberadas.
Painel não mostra dados financeiros internos, comissão, margem ou observações internas.
```

O Supabase permite construir regras de segurança no banco com Row Level Security. A documentação oficial recomenda habilitar RLS em tabelas expostas, especialmente no schema público. ([Supabase][3])

---

# 7. Tabelas do financeiro

Mesmo que o financeiro venha depois, já podemos deixar a estrutura preparada.

## 7.1. `contas_receber`

```txt
id
unidade_id
cliente_id
obra_id
proposta_id
descricao
valor
data_vencimento
data_recebimento
status
forma_recebimento
observacoes
created_at
updated_at
```

Status:

```txt
aberta
recebida
parcial
atrasada
cancelada
```

---

## 7.2. `contas_pagar`

```txt
id
unidade_id
obra_id
fornecedor_id
categoria
descricao
valor
data_vencimento
data_pagamento
status
forma_pagamento
observacoes
created_at
updated_at
```

Status:

```txt
aberta
paga
parcial
atrasada
cancelada
```

---

## 7.3. `fornecedores`

```txt
id
nome
razao_social
cnpj
telefone
email
categoria
observacoes
created_at
updated_at
```

---

## 7.4. `pagamentos_comissoes`

Pode ser separado da tabela `comissoes` para registrar pagamentos reais.

```txt
id
comissao_id
vendedor_id
unidade_id
valor_pago
data_pagamento
forma_pagamento
observacoes
created_at
```

---

# 8. Tabelas de arquivos

O Supabase Storage pode guardar arquivos como fotos, contratos, propostas e projetos. A documentação do Supabase Storage diz que ele serve para armazenar e servir arquivos com controles de acesso, e que o acesso depende de políticas de segurança. ([Supabase][4])

## 8.1. `arquivos`

```txt
id
unidade_id
cliente_id
oportunidade_id
obra_id
proposta_id
tipo_arquivo
nome_arquivo
bucket
path
url_publica
visivel_publico
enviado_por_id
created_at
```

Tipos:

```txt
foto_visita
foto_obra
proposta_pdf
contrato
ata
edital
projeto
art
comprovante
diario_obra
outro
```

Buckets sugeridos no Supabase Storage:

```txt
clientes
propostas
contratos
obras
publico
interno
```

Regra importante: arquivos internos devem ficar privados. Somente arquivos marcados como `visivel_publico = true` podem aparecer no painel do condomínio.

---

# 9. Tabelas de auditoria e segurança

## 9.1. `auditoria`

Registra ações sensíveis.

```txt
id
usuario_id
unidade_id
acao
tabela
registro_id
dados_antes
dados_depois
ip
user_agent
created_at
```

Exemplos:

```txt
Usuário criou proposta
Usuário excluiu arquivo
Usuário alterou valor da comissão
Usuário gerou token público
Usuário marcou obra como entregue
```

---

# 10. Relação geral entre as tabelas

A lógica fica assim:

```txt
unidades
  └── usuarios_perfis
  └── clientes
        └── cliente_contatos
        └── oportunidades
              └── oportunidade_produtos
              └── propostas
                    └── proposta_itens
                    └── simulacoes_financiamento
                    └── comissoes
              └── agenda_eventos
              └── crm_historico
              └── obras
                    └── obra_etapas
                    └── obra_checklists
                    └── obra_diarios
                    └── obra_comunicados
                    └── obra_fotos
                    └── painel_publico_tokens
```

Ou seja:

```txt
Cliente entra no CRM.
Cliente vira oportunidade.
Oportunidade recebe produtos.
Produtos geram proposta.
Proposta calcula financiamento e comissão.
Se fechar, vira obra.
Obra gera etapas, checklist e painel público.
Financeiro recebe valores e comissões.
```

Esse é o fluxo correto.

---

# 11. Campos padrão em quase todas as tabelas

Eu recomendo que quase todas as tabelas tenham:

```txt
id
created_at
updated_at
created_by
updated_by
deleted_at
```

O campo `deleted_at` permite exclusão lógica.

Ou seja, em vez de apagar o dado definitivamente, o sistema marca como excluído. Isso evita perder histórico.

---

# 12. Regras de segurança no Supabase

A segurança deve ser pensada desde o início.

Regras principais:

```txt
Usuário só acessa dados das unidades autorizadas.
Vendedor só edita oportunidades dele, salvo permissão maior.
Gestor de unidade vê tudo da unidade.
Proprietário vê todas as unidades.
Financeiro vê dados financeiros apenas se tiver permissão.
Painel público acessa somente dados liberados pelo token.
Arquivos internos nunca ficam públicos por padrão.
```

Como o Supabase permite acesso direto do navegador ao banco, a recomendação oficial é usar Row Level Security nas tabelas expostas. ([Supabase][3])

---

# 13. Exemplo simples de regra prática

Exemplo conceitual:

```txt
Usuário Henrique pertence à Sombrear DF.

Ele pode ver:
- Clientes da Sombrear DF
- Obras da Sombrear DF
- Propostas da Sombrear DF

Ele não pode ver:
- Clientes da Sombrear GO
- Financeiro global
- Comissão de outros vendedores, salvo permissão
```

Para o proprietário:

```txt
Pode ver todas as unidades.
Pode trocar o filtro entre Sombrear DF, GO, SP ou Todas.
Pode acessar dashboard global.
```

---

# 14. Primeira versão do banco

Para o protótipo inicial, não precisamos criar tudo de uma vez. Eu começaria com estas tabelas:

```txt
unidades
usuarios_perfis
usuarios_unidades
permissoes
clientes
cliente_contatos
crm_colunas
oportunidades
produtos
oportunidade_produtos
propostas
proposta_itens
simulacoes_financiamento
comissoes
agenda_eventos
crm_historico
obras
obra_etapas
painel_publico_tokens
arquivos
auditoria
```

Essas tabelas já permitem construir:

```txt
Login
Separação por unidades
CRM kanban
Cadastro de cliente
Produtos no card
Proposta
Financiamento
Comissão
Gerar obra
Gerar painel público com token
Histórico
Arquivos
```

---

# 15. O que deixaria para a segunda fase

Depois que o protótipo estiver funcionando, entrariam:

```txt
contas_pagar
contas_receber
fornecedores
pagamentos_comissoes
obra_checklists avançados
obra_diarios
obra_comunicados
obra_fotos
pedidos
calculadora_materiais
comandas_producao
relatorios_avancados
dashboard_tv
```

---

# 16. Minha recomendação final para o banco

Eu estruturaria o sistema com esta lógica:

```txt
Supabase Auth
→ cuida de login, senha, convite e confirmação por e-mail.

Tabelas próprias
→ cuidam de unidade, perfil, permissões, clientes, CRM, obras e financeiro.

Supabase Storage
→ guarda arquivos, fotos, contratos, propostas e documentos.

Row Level Security
→ impede que uma unidade veja dados de outra sem permissão.

Token público
→ libera somente o painel do condomínio, sem login e sem dados internos.
```

Essa estrutura já deixa o Ecosistema Sombrear pronto para crescer como um sistema profissional.

O próximo passo é detalhar a **arquitetura das telas do protótipo**, ou seja: quais telas serão criadas primeiro, qual layout cada uma terá e como o usuário vai navegar entre Ecosistema, CRM, card do cliente, proposta e painel público.

[1]: https://supabase.com/?utm_source=chatgpt.com "Supabase | The Postgres Development Platform."
[2]: https://supabase.com/docs/guides/auth?utm_source=chatgpt.com "Auth | Supabase Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security?utm_source=chatgpt.com "Row Level Security | Supabase Docs"
[4]: https://supabase.com/docs/guides/storage?utm_source=chatgpt.com "Storage | Supabase Docs"
Perfeito. Agora vamos detalhar a **arquitetura das telas do protótipo**.

A lógica é criar primeiro um sistema que já pareça real, mesmo que algumas funções ainda estejam simuladas. Como você definiu no escopo, o protótipo inicial precisa ter o **Ecosistema Sombrear** como sistema mãe, com acesso ao **CRM**, propostas com comissão, pedidos, calculadora, painel do condomínio, produção/execução e financeiro. 

# 1. Estrutura geral das telas

Eu organizaria o protótipo assim:

```txt
/login
/ecosistema
/ecosistema/crm
/ecosistema/crm/cliente/[id]
/ecosistema/crm/proposta/[id]
/ecosistema/obras
/ecosistema/obras/[id]
/ecosistema/painel-condominio
/painel/[token]
/ecosistema/configuracoes
/ecosistema/tv
```

Na prática, existem dois ambientes:

```txt
Ambiente interno da Sombrear
→ login obrigatório

Ambiente público do condomínio
→ acesso por link com token
```

---

# 2. Tela de login

## Objetivo

Permitir que os usuários internos entrem no sistema.

## Layout

```txt
Logo Sombrear

Bem-vindo ao Ecosistema Sombrear

E-mail
Senha

[Entrar]

Esqueci minha senha
```

## Regras

O usuário só entra se estiver cadastrado e ativo.

Depois do login, o sistema verifica:

```txt
Quem é o usuário?
Qual unidade ele pertence?
Qual perfil ele tem?
Quais módulos ele pode acessar?
```

Exemplo:

```txt
Henrique Palmer
Unidade: Sombrear DF
Perfil: Engenharia / Administrador
```

---

# 3. Tela mãe — Ecosistema Sombrear

## Rota

```txt
/ecosistema
```

Essa será a tela principal após o login.

## Objetivo

Dar uma visão geral da operação e permitir acesso aos módulos.

No seu escopo, você descreveu essa tela como um dashboard com ícones dos sistemas e dados gerais da empresa, como obras em andamento, obras vendidas e obras em fase de obra. 

## Estrutura visual

```txt
--------------------------------------------------
Logo Sombrear | Ecosistema Sombrear        Usuário
--------------------------------------------------

Menu lateral              Área principal
--------------------------------------------------
Início                    Resumo geral
CRM                       Cards dos módulos
Propostas                 Indicadores
Pedidos                   Alertas
Produção
Financeiro
Configurações
```

## Cards principais

```txt
CRM
Propostas
Pedidos
Calculadora de Materiais
Painel Condomínio
Produção / Execução
Financeiro
Configurações
```

Cada card deve ter um número resumido.

Exemplo:

```txt
CRM
18 clientes em prospecção
9 propostas enviadas
3 assembleias próximas
```

```txt
Produção / Execução
6 obras em andamento
2 obras com pendência
1 obra atrasada
```

```txt
Financeiro
R$ 240.000,00 a receber
R$ 85.000,00 a pagar
```

---

# 4. Dashboard da tela mãe

O dashboard muda conforme o perfil do usuário.

## Proprietário / gestor geral

Vê a visão completa:

```txt
Todas as unidades
Total vendido no mês
Total em negociação
Obras em contrato
Obras em produção
Obras em execução
Obras entregues
Comissões previstas
Contas a pagar
Contas a receber
Alertas críticos
```

## Gestor de unidade

Vê apenas a unidade dele:

```txt
Sombrear DF
Clientes em negociação
Obras da unidade
Vendas da unidade
Pendências da unidade
Equipe da unidade
```

## Vendedor

Vê apenas a área comercial:

```txt
Meus leads
Minhas propostas
Minhas assembleias
Minhas comissões
Clientes parados
Próximas ações
```

## Engenharia

Vê obras e execução:

```txt
Obras em andamento
Etapas pendentes
Diários de obra
Pendências de campo
Bonificações pendentes
Fotos para publicar
```

---

# 5. Tela do CRM Kanban

## Rota

```txt
/ecosistema/crm
```

## Objetivo

Controlar o fluxo comercial.

O CRM deve funcionar em kanban, com cards arrastáveis entre fases como prospecção, visita técnica, orçamento, proposta enviada, negociação, fechado e perdido, como você descreveu no arquivo de escopo. 

## Layout

```txt
Topo:
CRM | Unidade | Filtros | + Novo Cliente

Filtros:
Unidade
Vendedor
Tipo de cliente
Produto
Status
Temperatura
Período

Kanban:
[Prospecção] [Qualificação] [Visita técnica] [Orçamento] [Proposta enviada] [Negociação] [Assembleia] [Fechado] [Perdido]
```

## Card do kanban

Cada card mostra somente o essencial:

```txt
Residencial Rio Negro
Sombrear DF
Condomínio residencial
Produto: Sombrite garagem
Valor: R$ 480.000,00
Vendedor: Henrique
Próxima ação: Assembleia 10/05
Temperatura: Quente
```

## Ações rápidas no card

```txt
Ver cliente
Adicionar observação
Agendar ação
Gerar proposta
Mover etapa
Marcar como perdido
Marcar como fechado
```

---

# 6. Tela de cadastro rápido do cliente

## Abre como modal

Quando clicar em:

```txt
+ Novo Cliente
```

Abre uma janela rápida.

## Campos mínimos

```txt
Nome do cliente
Tipo de cliente
Unidade
Cidade
Estado
Responsável
Telefone / WhatsApp
Vendedor responsável
Origem do lead
Produto de interesse
```

## Botões

```txt
[Salvar e abrir ficha completa]
[Salvar e continuar no kanban]
```

Minha recomendação: no dia a dia, o vendedor precisa cadastrar rápido. Depois ele completa a ficha.

---

# 7. Tela completa do cliente

## Rota

```txt
/ecosistema/crm/cliente/[id]
```

## Objetivo

Ser a ficha central do cliente/oportunidade.

No seu escopo, dentro do card do CRM precisam existir informações do cliente, dados comerciais, tipo de cobertura, orçamento, financiamento, agendamentos, fotos e histórico. 

## Cabeçalho da ficha

```txt
Residencial Rio Negro

Unidade: Sombrear DF
Status: Proposta enviada
Vendedor: Henrique
Valor estimado: R$ 480.000,00
Temperatura: Quente

[Gerar proposta]
[Agendar ação]
[Marcar como fechado]
[Marcar como perdido]
```

## Abas da ficha

```txt
Resumo
Dados gerais
Contatos
Comercial
Produtos / escopo
Orçamento
Financiamento
Comissão
Agenda
Arquivos
Histórico
```

---

# 8. Aba Resumo

Essa aba deve ser a primeira tela ao abrir o cliente.

## Mostra

```txt
Dados principais do cliente
Status atual no CRM
Próxima ação
Valor estimado
Produtos negociados
Últimas movimentações
Arquivos recentes
Alertas
```

## Exemplo de alerta

```txt
Proposta vence em 3 dias.
Cliente está há 8 dias sem movimentação.
Assembleia marcada para amanhã.
```

Essa aba evita que o usuário precise abrir todas as outras abas para entender a situação.

---

# 9. Aba Dados gerais

## Campos

```txt
Tipo de cliente
Nome do cliente
Razão social
CNPJ / CPF
Unidade responsável
Endereço
Cidade
Estado
CEP
Origem do lead
Observações gerais
```

Como você confirmou que também poderá haver empresas, escolas, comércios e outros clientes, essa tela precisa ser flexível.

---

# 10. Aba Contatos

## Campos

```txt
Nome
Cargo / função
Telefone
WhatsApp
E-mail
Tipo de contato
Contato principal?
Observações
```

## Tipos de contato

```txt
Síndico
Subsíndico
Administradora
Financeiro
Técnico
Compras
Morador representante
Responsável da empresa
Outro
```

A Sombrear trabalha muito com síndico, administradora, moradores e assembleia. O raio-x operacional mostra que o processo envolve suporte em assembleia, plantão de dúvidas e comunicação ativa com moradores. 

---

# 11. Aba Comercial

## Campos

```txt
Número de unidades
Número de vagas
Área aproximada
Valor estimado
Probabilidade de fechamento
Previsão de fechamento
Temperatura do lead
Principal necessidade
Principal objeção
Concorrente
Observações comerciais
```

## Essa aba alimenta

```txt
Dashboard comercial
Previsão de vendas
Cálculo por morador
Relatórios por vendedor
Relatórios por produto
```

---

# 12. Aba Produtos / Escopo

## Objetivo

Adicionar todos os produtos que o cliente está negociando.

O portfólio operacional da Sombrear inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

## Produtos iniciais

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

## Layout da aba

```txt
Produtos adicionados

[+ Adicionar produto]

Produto 1
Tipo: Sombrite garagem
Quantidade: 80 vagas
Valor por vaga: R$ 6.000,00
Valor total: R$ 480.000,00
Local: Estacionamento externo
Inclui ART: Sim
Inclui projeto: Sim
```

## Campos do produto

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Inclui iluminação?
Inclui calha?
Inclui rufo?
Inclui bicicletário?
Inclui projeto?
Inclui ART?
Observações técnicas
```

---

# 13. Aba Orçamento

## Objetivo

Montar o orçamento dentro do próprio CRM.

## Layout

```txt
Resumo financeiro

Valor bruto
Desconto
Valor final
Forma de pagamento
Prazo estimado
Validade da proposta

Itens do orçamento
[+ Adicionar item]

[Gerar proposta simplificada]
[Gerar proposta completa]
```

## Proposta simplificada

A proposta simplificada deve ser de uma página:

```txt
Cliente
Produto
Quantidade
Valor total
Condição comercial
Validade
Contato do vendedor
```

## Proposta completa

A proposta completa pode ter:

```txt
Capa
Apresentação da Sombrear
Diagnóstico
Escopo
Produtos
Diferenciais
Condições comerciais
Garantia
Prazo
Assinatura
```

A identidade visual recomenda documentos limpos, técnicos e modernos, com verde institucional para destaques, fundo branco e textos em cinza escuro. Para propostas, o manual recomenda um visual mais comercial, com mais identidade visual, verde, branco e espaçamento. 

---

# 14. Aba Financiamento

## Objetivo

Simular pagamento por unidade/morador.

## Layout

```txt
Valor total da obra
Entrada
Valor financiado
Número de unidades
Quantidade de parcelas
Taxa mensal
Tipo de financiamento

Resultado:
Valor aproximado por unidade
Valor aproximado por vaga
Valor total por parcela
```

## Exemplo

```txt
Valor da obra: R$ 480.000,00
Unidades: 160
Parcelas: 24
Resultado: R$ 125,00/mês por unidade
```

Essa aba será muito importante para assembleia, porque transforma o valor total da obra em algo mais fácil para os moradores entenderem.

---

# 15. Aba Comissão

## Objetivo

Calcular a comissão do vendedor.

## Layout

```txt
Vendedor responsável
Valor base
Percentual de comissão
Valor da comissão
Status da comissão
Data prevista de pagamento
Observações
```

## Status

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

## Regra

O vendedor pode visualizar a própria comissão, mas somente gestor, proprietário ou financeiro autorizado pode alterar percentual, aprovar ou marcar como paga.

---

# 16. Aba Agenda

## Objetivo

Controlar as próximas ações comerciais.

## Eventos

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

A atuação da Sombrear tem forte presença em assembleias, apresentação profissional, plantão de dúvidas e comunicação com moradores, então a agenda precisa ser tratada como parte central do CRM. 

---

# 17. Aba Arquivos

## Objetivo

Guardar fotos, documentos e materiais comerciais.

## Categorias

```txt
Fotos da visita
Vídeos
Croquis
Projetos
Ata
Edital
Propostas
Contrato
Documentos do cliente
Comprovantes
Outros
```

## Regra importante

Cada arquivo deve ter uma marcação:

```txt
Interno
Liberado para cliente
Liberado para painel público
```

Isso evita publicar algo indevido no painel do condomínio.

---

# 18. Aba Histórico

## Objetivo

Registrar tudo que aconteceu.

## Exemplo

```txt
28/04/2026 - Cliente criado por Henrique.
28/04/2026 - Movido para Visita técnica agendada.
29/04/2026 - Produto Sombrite garagem adicionado.
30/04/2026 - Proposta gerada no valor de R$ 480.000,00.
01/05/2026 - Assembleia agendada.
```

Essa aba será fundamental para gestão e segurança.

---

# 19. Tela de proposta

## Rota

```txt
/ecosistema/crm/proposta/[id]
```

## Objetivo

Visualizar, editar e gerar PDF da proposta.

## Estrutura

```txt
Cabeçalho
Cliente
Produtos
Condições comerciais
Financiamento
Observações
Resumo financeiro
Botões de ação
```

## Botões

```txt
[Salvar rascunho]
[Gerar PDF]
[Enviar proposta]
[Duplicar proposta]
[Marcar como aprovada]
[Marcar como recusada]
```

## Visual

A proposta deve seguir a identidade da Sombrear:

```txt
Logo no topo
Linha verde
Títulos em verde
Texto grafite
Caixas técnicas em cinza claro
Bom espaçamento
```

Isso está alinhado ao manual, que recomenda cabeçalho com logo, linha verde, uso de fundo branco, texto em cinza escuro e destaque verde. 

---

# 20. Ação “Marcar como fechado”

Quando o usuário marcar a oportunidade como **Fechado**, o sistema abre uma tela de confirmação.

## Tela

```txt
Cliente fechado

Deseja gerar a obra agora?

Resumo:
Cliente: Residencial Rio Negro
Produto: Sombrite garagem
Valor: R$ 480.000,00
Unidade: Sombrear DF
Vendedor: Henrique

[Gerar obra]
[Gerar depois]
```

Ao clicar em **Gerar obra**, o sistema cria:

```txt
Obra
Etapas da obra
Token do painel público
Registro financeiro inicial
Pasta de arquivos
Histórico
```

---

# 21. Tela Obras / Produção

## Rota

```txt
/ecosistema/obras
```

## Objetivo

Gerenciar as obras depois que o cliente fecha.

No seu escopo, esse dashboard serve para a gestão entender o andamento da obra, evitar esquecer etapas e bonificações, além de permitir uma visão em TV no escritório. 

## Layout recomendado

Eu faria uma tela híbrida:

```txt
Kanban de obras
+
Lista de pendências
+
Indicadores
+
Checklist por obra
```

## Colunas

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

Internamente, o sistema pode manter as 15 etapas completas do painel do condomínio, mas para a tela de produção o ideal é agrupar para ficar mais limpo.

---

# 22. Tela da obra

## Rota

```txt
/ecosistema/obras/[id]
```

## Abas

```txt
Resumo
Etapas
Checklist
Diário de obra
Fotos
Comunicados
Pendências
Painel público
Arquivos
Histórico
```

## Aba Resumo da obra

```txt
Nome da obra
Cliente
Unidade
Produto
Status atual
Responsável engenharia
Líder de obra
Data prevista de início
Data prevista de entrega
Pendências críticas
Próxima etapa
```

## Aba Etapas

Aqui entram as etapas que você listou:

```txt
Em fase de contrato
Em fase de plantão
Docs finais de financiamento
Fase desembolso
Docs análise financiamento
Fechamento do aditivo
Contrato da financeira
Finalização da etapa de contrato
Fabricação das bases / pés / chumbadores
Início do canteiro de obras
Execução das fundações e chumbação
Fabricação dos braços / arcos / telas
Instalação dos braços / arcos / telas
Retoques de pintura
Entrega do termo de entrega e garantia
```

Essas etapas vieram diretamente do escopo do painel visual do condomínio. 

---

# 23. Aba Diário de obra

## Objetivo

Registrar o andamento.

## Campos

```txt
Data
Equipe presente
Clima
Atividades realizadas
Pendências
Próximos passos
Fotos
Visível no painel público?
```

## Versão pública

O sistema pode gerar automaticamente uma versão simplificada:

```txt
Hoje a equipe realizou a preparação das fundações da cobertura.
A próxima etapa prevista é a continuação da chumbação dos pilares.
```

Essa parte se conecta com a comunicação ativa com moradores, que é um diferencial operacional da Sombrear. 

---

# 24. Aba Comunicados

## Objetivo

Criar comunicados para o condomínio.

## Tipos

```txt
Início de obra
Remoção de veículos
Interdição de área
Ruído
Poeira
Retorno da equipe
Mudança de etapa
Entrega
Geral
```

## Botões

```txt
[Gerar comunicado]
[Publicar no painel]
[Copiar texto para WhatsApp]
[Gerar PDF]
```

Essa função será muito útil para o seu dia a dia, porque você já usa bastante comunicados e ofícios para os condomínios.

---

# 25. Aba Painel público da obra

## Objetivo

Gerenciar o link público que será enviado ao condomínio.

## Campos

```txt
Status do painel: ativo / inativo
Token
Link público
Último acesso
Total de acessos
Informações liberadas
```

## Botões

```txt
[Copiar link]
[Ver painel]
[Gerar novo token]
[Desativar painel]
```

---

# 26. Tela pública do condomínio

## Rota

```txt
/painel/[token]
```

## Objetivo

Permitir que síndico e moradores acompanhem a obra sem login.

Você definiu que o painel será acessado por link público com token criado pela Sombrear. No escopo, esse painel deve mostrar o status da obra, comunicados, diários de obra e relatório simplificado para síndico e moradores. 

## Layout

```txt
Logo Sombrear

Obra: Residencial Rio Negro
Status atual: Execução das fundações e chumbação

Barra de progresso
Etapas da obra

Comunicados
Diários de obra
Fotos autorizadas
Próximos passos
Contatos
```

## O que o morador pode ver

```txt
Status da obra
Etapa atual
Comunicados
Diários simplificados
Fotos liberadas
Previsão da próxima etapa
Contato da Sombrear
```

## O que ele não pode ver

```txt
Comissão
Custos internos
Margem da empresa
Observações internas
Pendências sensíveis
Dados financeiros internos
Documentos restritos
```

---

# 27. Tela de TV da produção

## Rota

```txt
/ecosistema/tv
```

## Objetivo

Ficar aberta na TV do escritório.

Você comentou que quer uma tela na TV para todos verem o andamento geral das obras e informações relevantes. 

## Layout

```txt
Sombrear - Produção em tempo real

Obras em andamento
Obras por etapa
Obras com pendência
Próximas entregas
Bonificações pendentes
Pedidos de material pendentes
Diários não preenchidos
```

## Visual

```txt
Cards grandes
Pouco texto
Atualização automática
Modo tela cheia
Cores por status
Sem informações financeiras sensíveis
```

Exemplo:

```txt
RIO NEGRO
Etapa: Fundações
Status: Em andamento
Próxima ação: Chumbação dos pilares
Responsável: Equipe 02
```

---

# 28. Tela de configurações

## Rota

```txt
/ecosistema/configuracoes
```

## Objetivo

Permitir que administradores configurem o sistema.

## Abas

```txt
Unidades
Usuários
Perfis e permissões
Produtos
Status do CRM
Status de obra
Comissões
Modelos de proposta
Modelos de comunicado
Motivos de perda
Configurações do painel público
```

## Unidades

```txt
Nome da unidade
CNPJ
Estado
Cidade
Responsável
Telefone
E-mail
Status
```

## Usuários

```txt
Nome
E-mail
Telefone
Unidade
Perfil
Status
Enviar convite por e-mail
```

## Produtos

```txt
Nome do produto
Categoria
Descrição
Ativo / inativo
Campos específicos
```

## Status

O administrador poderá editar:

```txt
Colunas do CRM
Status das obras
Tipos de cliente
Tipos de contato
Tipos de financiamento
Motivos de perda
```

Isso atende à sua observação de que o sistema precisa ter modo de configurações para editar itens principais, status e valores. 

---

# 29. Navegação ideal do usuário

## Fluxo do vendedor

```txt
Login
→ Ecosistema
→ CRM
→ Novo cliente
→ Preenche dados
→ Adiciona produto
→ Gera orçamento
→ Simula financiamento
→ Calcula comissão
→ Gera proposta
→ Agenda assembleia
→ Marca como fechado
```

## Fluxo da engenharia

```txt
Login
→ Ecosistema
→ Obras
→ Abre obra
→ Atualiza etapa
→ Preenche checklist
→ Publica diário de obra
→ Adiciona fotos
→ Publica comunicado
→ Atualiza painel público
```

## Fluxo do gestor

```txt
Login
→ Ecosistema
→ Dashboard geral
→ Filtra unidade
→ Analisa vendas
→ Analisa obras
→ Verifica pendências
→ Exporta relatório
```

## Fluxo do síndico/morador

```txt
Recebe link
→ Abre painel público
→ Visualiza status
→ Lê comunicados
→ Acompanha diários
→ Vê fotos liberadas
```

---

# 30. Primeira versão visual do protótipo

Para o primeiro protótipo, eu não criaria todas as telas completas. Criaria as principais, já com aparência profissional.

## MVP visual inicial

```txt
1. Login
2. Ecosistema / dashboard geral
3. CRM kanban
4. Ficha completa do cliente
5. Tela de proposta
6. Tela de obras
7. Tela pública do condomínio
8. Configurações básicas
```

## Funções que já devem funcionar

```txt
Criar cliente
Mover card no kanban
Editar dados do cliente
Adicionar produto
Calcular valor total
Simular valor por unidade
Calcular comissão
Gerar proposta visual
Marcar como fechado
Gerar obra
Gerar token público
Visualizar painel público
```

## Funções que podem ficar simuladas no início

```txt
Financeiro completo
Pedidos
Calculadora de materiais
Relatórios avançados
Dashboard TV completo
Integração com e-mail
PDF final da proposta
```

---

# 31. Resumo da arquitetura recomendada

A primeira versão do sistema deve seguir esta estrutura:

```txt
Ecosistema Sombrear
│
├── Login
├── Dashboard geral
├── CRM
│   ├── Kanban
│   ├── Cliente completo
│   ├── Produtos
│   ├── Orçamento
│   ├── Financiamento
│   ├── Comissão
│   └── Proposta
│
├── Obras
│   ├── Etapas
│   ├── Checklist
│   ├── Diário
│   ├── Comunicados
│   └── Painel público
│
├── Painel público por token
│
├── TV produção
│
└── Configurações
```

Essa arquitetura já conecta o comercial com a execução, que é o ponto mais importante. O cliente entra no CRM, vira proposta, fecha, vira obra e depois aparece no painel público do condomínio.

O próximo passo recomendado é criar o **mapa visual das telas**, como se fosse um wireframe escrito: onde fica cada botão, cada card, cada menu e cada bloco da primeira versão.
Perfeito. Agora vamos para o **mapa visual das telas do protótipo**, como se fosse um wireframe escrito.

A ideia é transformar tudo que já definimos em uma estrutura visual clara para depois começar a montar o protótipo do **Ecosistema Sombrear + CRM**.

---

# 1. Padrão visual geral do sistema

O sistema deve seguir a identidade da Sombrear: visual limpo, técnico, moderno, com fundo branco, textos em cinza escuro e verde institucional para destaques. O manual recomenda evitar poluição visual, excesso de cores e manter uma aparência técnica e confiável. 

## Paleta base do sistema

```txt
Verde principal: #8DC63F
Verde secundário: #5FA12B
Verde claro: #CFE8A9
Grafite: #2B2B2B
Cinza médio: #6F6F6F
Cinza claro: #F3F3F3
Branco: #FFFFFF
```

## Fonte

```txt
Interface do sistema: Poppins
Documentos / propostas: Montserrat ou Calibri
```

## Estilo dos componentes

```txt
Cards arredondados
Botões verdes
Menu lateral branco ou cinza claro
Ícones simples
Bastante espaçamento
Pouca sombra
Títulos fortes
Informações bem separadas
```

---

# 2. Tela 01 — Login

## Objetivo

Permitir que usuários internos acessem o Ecosistema Sombrear.

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│                                              │
│                 LOGO SOMBREAR                │
│                                              │
│            Ecosistema Sombrear               │
│     Gestão comercial, operacional e obras    │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ E-mail                                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Senha                                  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [ Entrar ]                                  │
│                                              │
│  Esqueci minha senha                         │
│                                              │
└──────────────────────────────────────────────┘
```

## Detalhes

O fundo pode ser branco ou cinza claro. O botão **Entrar** deve ser verde. A logo fica centralizada. A tela precisa transmitir confiança, não parecer um sistema amador.

---

# 3. Tela 02 — Ecosistema Sombrear / Dashboard inicial

## Objetivo

Ser a tela mãe do sistema.

O escopo define que o Ecosistema deve ter um dashboard com ícones de todos os sistemas e uma visão geral da empresa, como obras em andamento, obras vendidas e status das fases. 

## Wireframe geral

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR     Ecosistema Sombrear        Usuário  ⚙  ⎋ │
├───────────────┬─────────────────────────────────────────────┤
│ MENU          │ Olá, Henrique                               │
│               │ Unidade: Sombrear DF                        │
│ Início        │                                             │
│ CRM           │ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ Propostas     │ │Vendas   │ │Obras    │ │Financeiro│        │
│ Pedidos       │ │R$ 480k  │ │6 ativas │ │R$ 90k   │        │
│ Produção      │ └─────────┘ └─────────┘ └─────────┘        │
│ Painel Cond.  │                                             │
│ Financeiro    │ Módulos                                     │
│ Relatórios    │                                             │
│ Configurações │ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│               │ │ CRM        │ │ Produção   │ │ Financeiro│ │
│               │ └────────────┘ └────────────┘ └──────────┘ │
│               │ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│               │ │ Propostas  │ │ Painel     │ │ Pedidos  │ │
│               │ └────────────┘ └────────────┘ └──────────┘ │
│               │                                             │
│               │ Alertas importantes                         │
│               │ - 2 propostas vencem esta semana            │
│               │ - 1 obra está sem atualização há 3 dias     │
│               │ - 3 assembleias agendadas                   │
└───────────────┴─────────────────────────────────────────────┘
```

## Blocos principais

### Cabeçalho

```txt
Logo Sombrear
Nome do sistema
Nome do usuário
Perfil
Notificações
Configurações
Sair
```

### Menu lateral

```txt
Início
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Relatórios
Configurações
```

### Cards de resumo

```txt
Valor em negociação
Valor vendido no mês
Obras em execução
Obras atrasadas
Comissões previstas
Contas a receber
```

### Cards dos módulos

```txt
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Configurações
```

---

# 4. Tela 03 — CRM Kanban

## Objetivo

Controlar o fluxo comercial de clientes e oportunidades.

O CRM deve funcionar em modelo kanban, com cards arrastáveis entre fases como prospecção, visita técnica, orçamento, proposta enviada, negociação, assembleia, fechado e perdido. 

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR     CRM                         + Novo Cliente│
├───────────────┬─────────────────────────────────────────────┤
│ MENU          │ Filtros                                     │
│               │ [Unidade ▼] [Vendedor ▼] [Produto ▼]       │
│ Início        │ [Tipo cliente ▼] [Status ▼] [Buscar...]    │
│ CRM           │                                             │
│ Propostas     │ ┌────────────┬────────────┬────────────┐   │
│ Produção      │ │ Prospecção │ Qualificação│ Visita    │   │
│ Financeiro    │ │            │             │ Técnica   │   │
│               │ │ ┌────────┐ │ ┌────────┐  │ ┌───────┐ │   │
│               │ │ │Rio Neg.│ │ │Ipê Am. │  │ │Greenp.│ │   │
│               │ │ │R$480k  │ │ │R$210k  │  │ │R$90k │ │   │
│               │ │ │Quente  │ │ │Morno   │  │ │Frio  │ │   │
│               │ │ └────────┘ │ └────────┘  │ └───────┘ │   │
│               │ └────────────┴────────────┴────────────┘   │
│               │                                             │
│               │ ┌────────────┬────────────┬────────────┐   │
│               │ │ Orçamento  │ Proposta   │ Assembleia │   │
│               │ │            │ Enviada    │ Aprovação  │   │
│               │ └────────────┴────────────┴────────────┘   │
└───────────────┴─────────────────────────────────────────────┘
```

## Topo do CRM

```txt
Título: CRM
Botão: + Novo Cliente
Campo de busca
Filtros
Alternância: Kanban / Lista
```

## Filtros principais

```txt
Unidade
Vendedor
Tipo de cliente
Produto
Temperatura
Status
Cidade
Período
```

## Colunas iniciais

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

---

# 5. Card do cliente no kanban

## Wireframe do card

```txt
┌────────────────────────────┐
│ Residencial Rio Negro      │
│ Sombrear DF                │
│ Condomínio residencial     │
│                            │
│ Produto: Sombrite garagem  │
│ Valor: R$ 480.000,00       │
│ Vendedor: Henrique         │
│                            │
│ Próxima ação: Assembleia   │
│ 10/05/2026                 │
│                            │
│ ● Quente                   │
└────────────────────────────┘
```

## Informações exibidas

```txt
Nome do cliente
Unidade
Tipo de cliente
Produto principal
Valor estimado
Vendedor
Próxima ação
Temperatura
```

O card precisa ser limpo. Ao clicar nele, abre a ficha completa.

---

# 6. Tela 04 — Novo cliente

## Objetivo

Permitir cadastro rápido.

## Formato recomendado

Modal sobre o CRM.

```txt
┌──────────────────────────────────────────────┐
│ Novo cliente                                 │
├──────────────────────────────────────────────┤
│ Nome do cliente                              │
│ [________________________________________]   │
│                                              │
│ Tipo de cliente                              │
│ [Condomínio residencial ▼]                   │
│                                              │
│ Unidade                                      │
│ [Sombrear DF ▼]                              │
│                                              │
│ Cidade / Estado                              │
│ [Brasília] [DF]                              │
│                                              │
│ Responsável principal                        │
│ [________________________________________]   │
│                                              │
│ Telefone / WhatsApp                          │
│ [________________________________________]   │
│                                              │
│ Produto de interesse                         │
│ [Sombrite garagem ▼]                         │
│                                              │
│ Vendedor responsável                         │
│ [Henrique Palmer ▼]                          │
│                                              │
│ [Cancelar]              [Salvar e abrir]     │
└──────────────────────────────────────────────┘
```

## Campos mínimos

```txt
Nome do cliente
Tipo de cliente
Unidade
Cidade
Estado
Responsável
Telefone / WhatsApp
Produto de interesse
Vendedor responsável
Origem do lead
```

---

# 7. Tela 05 — Ficha completa do cliente

## Objetivo

Ser a central de informações do cliente.

Dentro do card, o escopo pede informações como nome do condomínio, empresa, CNPJ, número de unidades, endereço, síndico/responsável, telefone, e-mail, vendedor, número de vagas, valor da vaga, tipo de cobertura, orçamento, financiamento, agendamentos, fotos e histórico. 

## Wireframe geral

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR     CRM > Residencial Rio Negro               │
├───────────────┬─────────────────────────────────────────────┤
│ MENU          │ Residencial Rio Negro                       │
│               │ Condomínio residencial | Sombrear DF        │
│ Início        │ Status: Proposta enviada                    │
│ CRM           │ Vendedor: Henrique | Valor: R$ 480.000,00   │
│ Propostas     │                                             │
│ Produção      │ [Gerar proposta] [Agendar] [Fechar] [Perder]│
│               │                                             │
│               │ Abas:                                       │
│               │ [Resumo] [Dados] [Contatos] [Comercial]    │
│               │ [Produtos] [Orçamento] [Financiamento]     │
│               │ [Comissão] [Agenda] [Arquivos] [Histórico] │
│               │                                             │
│               │ ┌─────────────────────────────────────────┐ │
│               │ │ Conteúdo da aba selecionada             │ │
│               │ └─────────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

---

# 8. Aba Resumo do cliente

## Objetivo

Mostrar a situação do cliente sem precisar abrir todas as abas.

```txt
┌──────────────────────────────────────────────┐
│ Resumo comercial                             │
├──────────────────────────────────────────────┤
│ Status atual: Proposta enviada               │
│ Temperatura: Quente                          │
│ Valor estimado: R$ 480.000,00                │
│ Probabilidade: 75%                           │
│ Próxima ação: Assembleia em 10/05/2026       │
│                                              │
│ Produtos negociados                          │
│ - Sombrite garagem: 80 vagas                 │
│ - Sombrite parquinho: 120 m²                 │
│                                              │
│ Alertas                                      │
│ - Proposta vence em 3 dias                   │
│ - Cliente sem movimentação há 5 dias         │
│                                              │
│ Últimos históricos                           │
│ - Proposta gerada                            │
│ - Assembleia agendada                        │
└──────────────────────────────────────────────┘
```

---

# 9. Aba Dados gerais

```txt
┌──────────────────────────────────────────────┐
│ Dados gerais                                 │
├──────────────────────────────────────────────┤
│ Nome do cliente                              │
│ Tipo de cliente                              │
│ Unidade responsável                          │
│ CNPJ / CPF                                   │
│ Razão social                                 │
│ Nome fantasia                                │
│ CEP                                          │
│ Endereço                                     │
│ Bairro                                       │
│ Cidade                                       │
│ Estado                                       │
│ Origem do lead                               │
│ Observações gerais                           │
└──────────────────────────────────────────────┘
```

---

# 10. Aba Contatos

```txt
┌──────────────────────────────────────────────┐
│ Contatos                          + Contato  │
├──────────────────────────────────────────────┤
│ Nome              Tipo          Telefone     │
│ João Silva        Síndico       (61) ...     │
│ Maria Souza       Administr.    (61) ...     │
│ Carlos Lima       Financeiro    (61) ...     │
└──────────────────────────────────────────────┘
```

## Ao adicionar contato

```txt
Nome
Cargo / função
Tipo de contato
Telefone
WhatsApp
E-mail
Contato principal?
Observações
```

A Sombrear lida com síndicos, administradoras, moradores, assembleias e plantão de dúvidas, então permitir vários contatos é essencial. 

---

# 11. Aba Comercial

```txt
┌──────────────────────────────────────────────┐
│ Informações comerciais                       │
├──────────────────────────────────────────────┤
│ Número de unidades                           │
│ Número de blocos                             │
│ Número de vagas                              │
│ Área aproximada                              │
│ Valor estimado                               │
│ Valor por vaga                               │
│ Valor por unidade/morador                    │
│ Previsão de fechamento                       │
│ Probabilidade                                │
│ Temperatura                                  │
│ Principal necessidade                        │
│ Principal objeção                            │
│ Concorrente                                  │
│ Observações comerciais                       │
└──────────────────────────────────────────────┘
```

---

# 12. Aba Produtos / Escopo

O portfólio da Sombrear inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Produtos / Escopo                 + Produto  │
├──────────────────────────────────────────────┤
│ Produto 01                                    │
│ Tipo: Sombrite garagem                        │
│ Quantidade: 80 vagas                          │
│ Valor unitário: R$ 6.000,00                   │
│ Valor total: R$ 480.000,00                    │
│ Local: Estacionamento externo                 │
│ Fixação: Chumbado                             │
│                                              │
│ [Editar] [Remover]                            │
├──────────────────────────────────────────────┤
│ Produto 02                                    │
│ Tipo: Sombrite parquinho                      │
│ Área: 120 m²                                  │
│ Valor total: R$ 42.000,00                     │
│                                              │
│ [Editar] [Remover]                            │
└──────────────────────────────────────────────┘
```

## Campos do produto

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Inclui iluminação?
Inclui calha?
Inclui rufo?
Inclui bicicletário?
Inclui pintura?
Inclui projeto?
Inclui ART?
Observações técnicas
```

---

# 13. Aba Orçamento

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Orçamento                                    │
├──────────────────────────────────────────────┤
│ Valor bruto:        R$ 522.000,00             │
│ Desconto:           R$ 0,00                   │
│ Valor final:        R$ 522.000,00             │
│ Forma pagamento:    Entrada + parcelas        │
│ Prazo estimado:     90 dias                   │
│ Validade:           15 dias                   │
│                                              │
│ Itens do orçamento                            │
│ - Sombrite garagem: R$ 480.000,00             │
│ - Sombrite parquinho: R$ 42.000,00            │
│                                              │
│ [Gerar proposta simplificada]                 │
│ [Gerar proposta completa]                     │
└──────────────────────────────────────────────┘
```

## Funções

```txt
Criar orçamento
Editar orçamento
Adicionar desconto
Gerar proposta simplificada
Gerar proposta completa
Gerar PDF
Marcar como enviado
Marcar como aprovado
Marcar como recusado
```

---

# 14. Aba Financiamento

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Simulação de financiamento                   │
├──────────────────────────────────────────────┤
│ Valor total da obra:     R$ 522.000,00        │
│ Entrada:                 R$ 0,00              │
│ Valor financiado:        R$ 522.000,00        │
│ Número de unidades:      160                  │
│ Quantidade de parcelas:  24                   │
│ Taxa mensal:             0,00%                │
│ Tipo:                    Financeira parceira  │
│                                              │
│ Resultado                                    │
│ Parcela total:           R$ 21.750,00         │
│ Valor por unidade:       R$ 135,93/mês        │
│ Valor por vaga:          R$ 271,87/mês        │
│                                              │
│ [Salvar simulação] [Enviar para proposta]     │
└──────────────────────────────────────────────┘
```

Essa tela será muito útil para assembleias, porque transforma o valor total da obra em um valor mensal por unidade.

---

# 15. Aba Comissão

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Comissão                                     │
├──────────────────────────────────────────────┤
│ Vendedor: Henrique Palmer                    │
│ Valor base: R$ 522.000,00                    │
│ Percentual: 2,00%                            │
│ Comissão prevista: R$ 10.440,00              │
│ Status: Prevista                             │
│ Data prevista de pagamento: --/--/----       │
│                                              │
│ [Solicitar aprovação]                        │
└──────────────────────────────────────────────┘
```

## Regra visual

O vendedor vê a comissão dele. Gestor, proprietário ou financeiro autorizado podem aprovar, alterar percentual e marcar como paga.

---

# 16. Aba Agenda

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Agenda                              + Evento │
├──────────────────────────────────────────────┤
│ 30/04/2026 - Visita técnica                  │
│ Responsável: Henrique                        │
│ Status: Agendado                             │
│                                              │
│ 10/05/2026 - Assembleia                      │
│ Responsável: Comercial                       │
│ Status: Agendado                             │
│                                              │
│ 12/05/2026 - Retorno comercial               │
│ Status: Pendente                             │
└──────────────────────────────────────────────┘
```

## Tipos de evento

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

---

# 17. Aba Arquivos

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Arquivos                         + Arquivo   │
├──────────────────────────────────────────────┤
│ Categoria       Nome              Visibilidade│
│ Fotos visita    foto01.jpg        Interno     │
│ Propostas       proposta.pdf      Cliente     │
│ Contrato        contrato.pdf      Interno     │
│ Ata             ata.pdf           Interno     │
│ Projeto         projeto.pdf       Interno     │
└──────────────────────────────────────────────┘
```

## Visibilidades

```txt
Interno
Liberado para cliente
Liberado no painel público
```

---

# 18. Aba Histórico

```txt
┌──────────────────────────────────────────────┐
│ Histórico                                    │
├──────────────────────────────────────────────┤
│ 28/04/2026 - Cliente criado por Henrique     │
│ 28/04/2026 - Movido para visita técnica      │
│ 29/04/2026 - Produto sombrite adicionado     │
│ 30/04/2026 - Proposta gerada                 │
│ 01/05/2026 - Assembleia agendada             │
└──────────────────────────────────────────────┘
```

---

# 19. Tela 06 — Proposta

## Objetivo

Visualizar a proposta antes de gerar PDF.

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR                         Proposta Comercial    │
├─────────────────────────────────────────────────────────────┤
│ Cliente: Residencial Rio Negro                              │
│ Unidade: Sombrear DF                                        │
│ Vendedor: Henrique Palmer                                   │
│ Validade: 15 dias                                           │
│                                                             │
│ Escopo                                                      │
│ - Cobertura em sombrite para 80 vagas                       │
│ - Cobertura em sombrite para parquinho                      │
│                                                             │
│ Resumo financeiro                                           │
│ Valor total: R$ 522.000,00                                  │
│ Condição: Entrada + parcelas                                │
│ Valor estimado por unidade: R$ 135,93/mês                   │
│                                                             │
│ Observações                                                 │
│ Prazo de execução conforme cronograma aprovado.             │
│                                                             │
│ [Salvar rascunho] [Gerar PDF] [Marcar enviada]              │
└─────────────────────────────────────────────────────────────┘
```

## Modelos

```txt
Proposta simplificada
Proposta completa
```

A proposta deve usar logo no topo, linha verde, títulos em verde, corpo em grafite e caixas de destaque em cinza claro, conforme o padrão de documentos da Sombrear. 

---

# 20. Tela 07 — Marcar como fechado / Gerar obra

## Objetivo

Transformar uma oportunidade fechada em obra.

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ Cliente fechado                              │
├──────────────────────────────────────────────┤
│ Cliente: Residencial Rio Negro               │
│ Unidade: Sombrear DF                         │
│ Valor final: R$ 522.000,00                   │
│ Produto principal: Sombrite garagem          │
│ Vendedor: Henrique                           │
│                                              │
│ Ao gerar obra, o sistema criará:             │
│ ✓ Obra no painel de produção                 │
│ ✓ Etapas da obra                             │
│ ✓ Token público do condomínio                │
│ ✓ Registro financeiro inicial                │
│ ✓ Pasta de arquivos                          │
│                                              │
│ [Cancelar]                         [Gerar obra]│
└──────────────────────────────────────────────┘
```

---

# 21. Tela 08 — Obras / Produção

## Objetivo

Acompanhar as obras fechadas.

No escopo, esse dashboard serve para a gestão acompanhar o andamento das obras, evitar esquecimento de etapas e bonificações, e exibir informações em uma TV no escritório. 

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR     Produção / Execução          + Nova Obra  │
├───────────────┬─────────────────────────────────────────────┤
│ MENU          │ Indicadores                                 │
│               │ [6 obras ativas] [2 pendências] [1 atraso] │
│ Início        │                                             │
│ CRM           │ Filtros: [Unidade ▼] [Status ▼] [Líder ▼]  │
│ Produção      │                                             │
│ Painel Cond.  │ ┌──────────┬──────────┬──────────┬───────┐ │
│ Financeiro    │ │Contrato  │Fabricação│Fundação  │Instal.│ │
│               │ │Rio Negro │Ipê Amar. │Greenport │Vila S.│ │
│               │ │          │          │          │       │ │
│               │ └──────────┴──────────┴──────────┴───────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

## Colunas resumidas

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

Internamente, as etapas podem seguir a lista completa de 15 fases que você definiu no painel do condomínio. 

---

# 22. Tela 09 — Ficha da obra

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ Produção > Residencial Rio Negro                            │
├─────────────────────────────────────────────────────────────┤
│ Status: Execução das fundações e chumbação                  │
│ Unidade: Sombrear DF                                        │
│ Responsável engenharia: Henrique                            │
│ Líder de obra: Equipe 02                                    │
│ Previsão de entrega: 30/06/2026                             │
│                                                             │
│ [Atualizar etapa] [Novo diário] [Novo comunicado]           │
│                                                             │
│ Abas:                                                       │
│ [Resumo] [Etapas] [Checklist] [Diário] [Fotos]              │
│ [Comunicados] [Pendências] [Painel público] [Histórico]     │
│                                                             │
│ Conteúdo da aba selecionada                                 │
└─────────────────────────────────────────────────────────────┘
```

---

# 23. Aba Etapas da obra

```txt
┌──────────────────────────────────────────────┐
│ Etapas da obra                               │
├──────────────────────────────────────────────┤
│ ✓ Em fase de contrato                        │
│ ✓ Em fase de plantão                         │
│ ✓ Docs finais de financiamento               │
│ ✓ Fase desembolso                            │
│ ○ Fabricação das bases / pés / chumbadores   │
│ ○ Início do canteiro de obras                │
│ ○ Execução das fundações e chumbação         │
│ ○ Fabricação dos braços / arcos / telas      │
│ ○ Instalação dos braços / arcos / telas      │
│ ○ Retoques de pintura                        │
│ ○ Entrega do termo de entrega e garantia     │
└──────────────────────────────────────────────┘
```

---

# 24. Aba Checklist

```txt
┌──────────────────────────────────────────────┐
│ Checklist interno                            │
├──────────────────────────────────────────────┤
│ □ Conferir local do canteiro                 │
│ □ Confirmar ferramentas                      │
│ □ Confirmar betoneira                        │
│ □ Confirmar bases / pés / chumbadores        │
│ □ Executar bonificação prevista              │
│ □ Registrar fotos da etapa                   │
│ □ Publicar diário de obra                    │
│ □ Comunicar remoção de veículos              │
└──────────────────────────────────────────────┘
```

Esse checklist é muito importante para resolver o problema de esquecer bonificações, retornos ou etapas menores.

---

# 25. Aba Diário de obra

```txt
┌──────────────────────────────────────────────┐
│ Diário de obra                      + Diário │
├──────────────────────────────────────────────┤
│ Data: 28/04/2026                            │
│ Clima: Sem chuva                             │
│ Equipe: Equipe 02                            │
│ Atividades: Execução de fundações            │
│ Pendências: Aguardar cura do concreto        │
│ Próximos passos: Chumbação dos pilares       │
│ Visível no painel público: Sim               │
└──────────────────────────────────────────────┘
```

A comunicação ativa com moradores é um diferencial da Sombrear, e o diário de obra ajuda a transformar isso em rotina. 

---

# 26. Aba Comunicados

```txt
┌──────────────────────────────────────────────┐
│ Comunicados                    + Comunicado  │
├──────────────────────────────────────────────┤
│ 28/04/2026 - Início de fundações             │
│ Status: Publicado no painel                  │
│                                              │
│ 30/04/2026 - Remoção de veículos             │
│ Status: Rascunho                             │
│                                              │
│ [Copiar WhatsApp] [Gerar PDF] [Publicar]     │
└──────────────────────────────────────────────┘
```

## Tipos de comunicado

```txt
Início de obra
Remoção de veículos
Interdição de área
Ruído
Poeira
Mudança de etapa
Retorno da equipe
Entrega
Geral
```

---

# 27. Aba Painel público da obra

```txt
┌──────────────────────────────────────────────┐
│ Painel público                               │
├──────────────────────────────────────────────┤
│ Status: Ativo                                │
│ Token: rio-negro-A7K92F                      │
│ Link: /painel/rio-negro-A7K92F               │
│ Último acesso: 28/04/2026                    │
│ Total de acessos: 134                        │
│                                              │
│ Informações liberadas:                       │
│ ✓ Status da obra                             │
│ ✓ Etapas                                     │
│ ✓ Comunicados                                │
│ ✓ Diários simplificados                      │
│ ✓ Fotos autorizadas                          │
│                                              │
│ [Copiar link] [Ver painel] [Gerar novo token]│
└──────────────────────────────────────────────┘
```

---

# 28. Tela 10 — Painel público do condomínio

## Objetivo

Permitir que síndico e moradores acompanhem a obra por link público com token.

## Wireframe

```txt
┌──────────────────────────────────────────────┐
│ LOGO SOMBREAR                                │
│ Painel de acompanhamento da obra             │
├──────────────────────────────────────────────┤
│ Residencial Rio Negro                        │
│ Status atual: Execução das fundações         │
│                                              │
│ Progresso da obra                            │
│ [████████████░░░░░░░░] 60%                   │
│                                              │
│ Etapas                                       │
│ ✓ Contrato                                   │
│ ✓ Plantão                                    │
│ ✓ Fabricação inicial                         │
│ ● Fundações                                  │
│ ○ Instalação                                 │
│ ○ Retoques                                   │
│ ○ Entrega                                    │
│                                              │
│ Comunicados                                  │
│ - Remoção de veículos no dia 30/04           │
│ - Continuação das fundações                  │
│                                              │
│ Diário de obra                               │
│ A equipe executou a preparação das fundações │
│ e seguirá para a próxima etapa conforme      │
│ cronograma.                                  │
│                                              │
│ Fotos autorizadas                            │
│ [foto] [foto] [foto]                         │
│                                              │
│ Contato Sombrear                             │
└──────────────────────────────────────────────┘
```

## O público pode ver

```txt
Nome da obra
Status atual
Progresso
Etapas
Comunicados
Diários simplificados
Fotos autorizadas
Próximos passos
Contato
```

## O público não pode ver

```txt
Comissão
Custo interno
Margem
Financeiro interno
Anotações internas
Problemas sensíveis
Arquivos privados
```

---

# 29. Tela 11 — Configurações

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ LOGO SOMBREAR     Configurações                             │
├───────────────┬─────────────────────────────────────────────┤
│ MENU          │ Configurações do sistema                    │
│               │                                             │
│ Início        │ [Unidades] [Usuários] [Permissões]          │
│ CRM           │ [Produtos] [Status CRM] [Status Obra]       │
│ Produção      │ [Comissões] [Modelos] [Painel Público]      │
│ Financeiro    │                                             │
│ Configurações │ ┌─────────────────────────────────────────┐ │
│               │ │ Lista / formulário selecionado          │ │
│               │ └─────────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────────┘
```

## Abas de configuração

```txt
Unidades
Usuários
Perfis e permissões
Produtos
Tipos de cliente
Status do CRM
Status de obra
Comissões
Modelos de proposta
Modelos de comunicado
Motivos de perda
Configurações do painel público
```

---

# 30. Tela 12 — Dashboard TV

## Objetivo

Ficar na TV do escritório mostrando o andamento geral.

## Wireframe

```txt
┌─────────────────────────────────────────────────────────────┐
│ SOMBREAR - PRODUÇÃO EM TEMPO REAL              28/04/2026   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ Obras ativas│ │ Pendências  │ │ Entregas    │             │
│ │ 06          │ │ 02          │ │ 03 próximas │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                             │
│ Obras em andamento                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rio Negro     Fundações      Equipe 02      Em dia      │ │
│ │ Greenport     Retoques       Equipe 01      Atenção     │ │
│ │ Ipê Amarelo   Fabricação     Indústria      Em dia      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Alertas                                                     │
│ - Bonificação pendente: Residencial Vila do Sol             │
│ - Diário não preenchido: Greenport                          │
│ - Pedido de material pendente: Rio Negro                    │
└─────────────────────────────────────────────────────────────┘
```

Essa tela deve ter letras grandes, pouco texto e nenhuma informação financeira sensível.

---

# 31. Ordem recomendada para montar o protótipo

Eu recomendo construir visualmente nesta ordem:

```txt
1. Login
2. Layout interno com menu lateral e cabeçalho
3. Dashboard Ecosistema
4. CRM Kanban
5. Modal Novo Cliente
6. Ficha completa do cliente
7. Aba Produtos / Orçamento / Financiamento / Comissão
8. Tela de proposta
9. Tela Obras / Produção
10. Tela pública do condomínio
11. Configurações
12. Dashboard TV
```

---

# 32. O que essa etapa resolve

Com esse mapa visual, já temos a estrutura da primeira versão do sistema:

```txt
Usuário entra
→ vê o Ecosistema
→ acessa o CRM
→ cadastra cliente
→ acompanha no kanban
→ gera proposta
→ calcula financiamento e comissão
→ fecha cliente
→ gera obra
→ acompanha produção
→ publica painel público para o condomínio
```

O próximo bloco ideal é definir os **componentes reutilizáveis do sistema**, ou seja: botões, cards, menus, tabelas, modais, status, formulários e padrões visuais que serão usados em todas as telas.
Perfeito. Agora vamos definir o **kit de componentes do Ecosistema Sombrear**.

Essa etapa é importante porque evita que cada tela fique com um visual diferente. O sistema precisa parecer único: CRM, produção, financeiro, painel público e configurações devem seguir a mesma linguagem visual da Sombrear.

A identidade visual deve manter aparência **limpa, técnica e moderna**, com verde institucional, grafite, cinzas e bastante organização visual. O manual também reforça que o verde deve ser usado como destaque, sem poluir o layout. 

# 1. Base visual do sistema

## Cores principais

```txt
Verde principal: #8DC63F
Verde escuro: #5FA12B
Verde claro: #CFE8A9
Grafite: #2B2B2B
Cinza médio: #6F6F6F
Cinza claro: #F3F3F3
Branco: #FFFFFF
```

## Fonte

```txt
Interface: Poppins
Documentos e propostas: Montserrat ou Calibri
```

## Estilo geral

```txt
Visual limpo
Cards arredondados
Poucas cores
Ícones simples
Bastante espaçamento
Botões bem claros
Textos objetivos
Destaques em verde
Alertas com cores específicas
```

---

# 2. Layout padrão interno

Todas as telas internas devem seguir a mesma estrutura.

```txt
┌─────────────────────────────────────────────────────┐
│ Cabeçalho                                           │
├───────────────┬─────────────────────────────────────┤
│ Menu lateral  │ Conteúdo principal                  │
│               │                                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

## Cabeçalho

Componentes:

```txt
Logo Sombrear
Nome do módulo atual
Unidade selecionada
Campo de busca, quando necessário
Notificações
Nome do usuário
Perfil
Botão sair
```

Exemplo:

```txt
Sombrear | CRM                  Unidade: Sombrear DF
Notificações | Henrique Palmer | Engenharia/Admin
```

## Menu lateral

Itens principais:

```txt
Início
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Relatórios
Configurações
```

Regra: o usuário só vê os menus permitidos pelo perfil dele.

---

# 3. Botões

Os botões precisam ter um padrão fixo.

## Botão principal

Usado para ações importantes.

```txt
[ + Novo Cliente ]
[ Gerar Proposta ]
[ Salvar ]
[ Gerar Obra ]
[ Publicar ]
```

Visual:

```txt
Fundo verde #8DC63F
Texto branco ou grafite escuro, dependendo do contraste
Canto arredondado
Ícone opcional
```

## Botão secundário

Usado para ações de apoio.

```txt
[ Cancelar ]
[ Voltar ]
[ Ver detalhes ]
[ Duplicar ]
```

Visual:

```txt
Fundo branco
Borda cinza clara
Texto grafite
```

## Botão de alerta

Usado com cuidado.

```txt
[ Excluir ]
[ Desativar token ]
[ Cancelar proposta ]
```

Visual:

```txt
Fundo claro
Texto vermelho
Borda vermelha suave
```

## Botão de sucesso

```txt
[ Marcar como concluído ]
[ Aprovar ]
[ Finalizar etapa ]
```

Visual:

```txt
Verde institucional
Ícone de check
```

---

# 4. Cards

Os cards serão usados em quase todas as telas.

## Card de módulo

Usado na tela inicial do Ecosistema.

```txt
┌────────────────────────────┐
│ Ícone                      │
│ CRM                        │
│ 18 clientes em prospecção  │
│ 9 propostas enviadas       │
└────────────────────────────┘
```

Uso:

```txt
CRM
Propostas
Produção
Financeiro
Painel Condomínio
Pedidos
```

## Card de indicador

Usado nos dashboards.

```txt
┌────────────────────────────┐
│ Valor vendido no mês       │
│ R$ 480.000,00              │
│ +12% em relação ao mês ant.│
└────────────────────────────┘
```

Indicadores:

```txt
Vendas
Obras em execução
Obras atrasadas
Comissões previstas
Contas a receber
Propostas enviadas
```

## Card de cliente no CRM

```txt
┌────────────────────────────┐
│ Residencial Rio Negro      │
│ Sombrear DF                │
│ Condomínio residencial     │
│                            │
│ Produto: Sombrite garagem  │
│ Valor: R$ 480.000,00       │
│ Vendedor: Henrique         │
│ Próxima ação: Assembleia   │
│ ● Quente                   │
└────────────────────────────┘
```

Esse card deve ser simples, porque o CRM vai ter muitos clientes ao mesmo tempo.

## Card de obra

```txt
┌────────────────────────────┐
│ Residencial Rio Negro      │
│ Etapa: Fundações           │
│ Responsável: Equipe 02     │
│ Previsão: 30/06/2026       │
│ Status: Em dia             │
└────────────────────────────┘
```

---

# 5. Badges de status

Badges são etiquetas pequenas para status.

## CRM

```txt
Prospecção
Qualificação
Visita técnica
Proposta enviada
Em negociação
Assembleia
Fechado
Perdido
```

## Temperatura do lead

```txt
Frio
Morno
Quente
Muito quente
```

## Obras

```txt
Não iniciada
Em andamento
Aguardando
Concluída
Atrasada
Cancelada
```

## Comissão

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

## Painel público

```txt
Ativo
Inativo
Expirado
Token renovado
```

Esses badges ajudam o usuário a entender o sistema rapidamente sem precisar ler muito texto.

---

# 6. Formulários

Os formulários precisam ser organizados por blocos, não em uma lista gigante.

## Formulário padrão

```txt
Título da seção

Campo 1
Campo 2
Campo 3

[Cancelar] [Salvar]
```

## Tipos de campos

```txt
Texto curto
Texto longo
Número
Moeda
Porcentagem
Data
Hora
Telefone
E-mail
CPF/CNPJ
Select
Multi-select
Checkbox
Upload de arquivo
```

## Exemplo: formulário de cliente

```txt
Dados gerais
- Nome do cliente
- Tipo de cliente
- Unidade
- CNPJ / CPF
- Cidade
- Estado

Contato principal
- Nome
- Telefone
- E-mail

Informações comerciais
- Produto de interesse
- Vendedor responsável
- Origem do lead
```

## Regra importante

Campos obrigatórios devem ser poucos no cadastro rápido.

Obrigatórios no cadastro rápido:

```txt
Nome do cliente
Tipo de cliente
Unidade
Cidade/Estado
Responsável
Telefone
Produto de interesse
Vendedor
```

O restante pode ser preenchido depois na ficha completa.

---

# 7. Tabelas

As tabelas serão usadas em contatos, propostas, arquivos, usuários, unidades, financeiro e configurações.

## Tabela padrão

```txt
┌──────────────┬──────────────┬──────────────┬────────────┐
│ Nome         │ Tipo         │ Status       │ Ações      │
├──────────────┼──────────────┼──────────────┼────────────┤
│ João Silva   │ Síndico      │ Principal    │ Ver/Edit.  │
│ Maria Souza  │ Administ.    │ Ativo        │ Ver/Edit.  │
└──────────────┴──────────────┴──────────────┴────────────┘
```

## Recursos necessários

```txt
Busca
Filtro
Ordenação
Paginação
Ações por linha
Exportar, quando necessário
```

## Ações comuns

```txt
Ver
Editar
Duplicar
Arquivar
Excluir
Ativar
Desativar
```

---

# 8. Modais

Modais são janelas que abrem por cima da tela.

Usar para ações rápidas:

```txt
Novo cliente
Novo contato
Adicionar produto
Agendar evento
Gerar proposta
Confirmar fechamento
Gerar token
Excluir item
```

## Exemplo: modal de confirmação

```txt
┌────────────────────────────────────┐
│ Gerar obra?                        │
├────────────────────────────────────┤
│ Ao confirmar, o sistema criará:    │
│ ✓ Obra no painel de produção       │
│ ✓ Etapas da obra                   │
│ ✓ Token público                    │
│ ✓ Registro financeiro inicial      │
│                                    │
│ [Cancelar]              [Confirmar]│
└────────────────────────────────────┘
```

Regra: modal não deve ser usado para telas muito grandes. Se tiver muita informação, abre uma página própria.

---

# 9. Kanban

O kanban será usado principalmente no CRM e pode ser usado também em produção.

## Kanban do CRM

Colunas:

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

Cada coluna deve mostrar:

```txt
Nome da coluna
Quantidade de cards
Soma dos valores
Cards
```

Exemplo:

```txt
Proposta enviada
7 clientes
R$ 1.240.000,00
```

## Kanban de produção

Colunas resumidas:

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

O escopo de produção precisa ajudar a Sombrear a acompanhar etapas, evitar esquecimentos e controlar bonificações pendentes. 

---

# 10. Abas internas

As abas serão muito usadas na ficha do cliente e na ficha da obra.

## Abas do cliente

```txt
Resumo
Dados gerais
Contatos
Comercial
Produtos / Escopo
Orçamento
Financiamento
Comissão
Agenda
Arquivos
Histórico
```

## Abas da obra

```txt
Resumo
Etapas
Checklist
Diário de obra
Fotos
Comunicados
Pendências
Painel público
Arquivos
Histórico
```

Regra: a primeira aba sempre deve ser **Resumo**, para o usuário entender rapidamente a situação.

---

# 11. Linha do tempo

A linha do tempo será usada no histórico.

## Exemplo

```txt
28/04/2026 às 09:30
Henrique criou o cliente.

28/04/2026 às 10:15
Cliente movido para Visita Técnica Agendada.

29/04/2026 às 14:00
Proposta gerada no valor de R$ 480.000,00.

30/04/2026 às 16:40
Assembleia agendada para 10/05/2026.
```

Uso:

```txt
Histórico do cliente
Histórico da proposta
Histórico da obra
Histórico de comissão
Histórico de token público
```

Isso ajuda na segurança e na gestão interna.

---

# 12. Upload de arquivos

Componente usado em CRM, obras, propostas e painel público.

## Visual

```txt
┌────────────────────────────────────┐
│ Arraste arquivos aqui              │
│ ou clique para enviar              │
│                                    │
│ PDF, JPG, PNG, DOCX                │
└────────────────────────────────────┘
```

## Campos após upload

```txt
Categoria
Nome do arquivo
Visibilidade
Observações
```

## Visibilidade

```txt
Interno
Liberado para cliente
Liberado no painel público
```

Essa separação é essencial porque o painel público do condomínio não pode exibir dados internos, financeiros ou sensíveis.

---

# 13. Componente de proposta

A proposta precisa ter um visual próprio, mas ainda dentro do sistema.

## Estrutura

```txt
Cabeçalho com logo
Linha verde
Dados do cliente
Escopo
Produtos
Resumo financeiro
Financiamento
Observações
Validade
Assinatura / contato
```

## Blocos da proposta

```txt
Bloco de cliente
Bloco de escopo
Bloco de produtos
Bloco de valores
Bloco de financiamento
Bloco de diferenciais
Bloco de garantia
```

O manual recomenda propostas mais visuais, com destaque em verde, bom espaçamento e aparência profissional. 

---

# 14. Componente de progresso da obra

Usado no painel interno e no painel público.

## Visual

```txt
Progresso da obra

[████████████░░░░░░░░] 60%

Contrato ✓
Plantão ✓
Fabricação ✓
Fundações ●
Instalação ○
Retoques ○
Entrega ○
```

## Estados

```txt
Concluído
Atual
Pendente
Atrasado
```

No painel público, esse componente precisa ser simples e amigável para moradores.

---

# 15. Componente de diário de obra

## Interno

```txt
Data
Clima
Equipe presente
Atividades realizadas
Pendências
Próximos passos
Fotos
Visível no painel público?
```

## Público

```txt
Data
Resumo da atividade
Próxima etapa
Fotos autorizadas
```

A comunicação ativa com moradores é um diferencial operacional da Sombrear, incluindo comunicados, vídeos, materiais para WhatsApp e informações de obra. 

---

# 16. Componente de comunicado

Usado para gerar comunicados de obra.

## Campos

```txt
Título
Tipo de comunicado
Condomínio / cliente
Mensagem
Data
Visível no painel público?
Gerar PDF?
Copiar para WhatsApp?
```

## Tipos

```txt
Início de obra
Remoção de veículos
Interdição de área
Ruído
Poeira
Mudança de etapa
Retorno da equipe
Entrega
Geral
```

Esse componente é muito importante para o seu fluxo, porque você cria muitos comunicados para condomínios.

---

# 17. Componente de alertas

Alertas aparecem no dashboard e nas fichas.

## Tipos de alerta

```txt
Proposta vencendo
Cliente sem movimentação
Assembleia próxima
Obra atrasada
Diário não preenchido
Bonificação pendente
Pagamento em atraso
Token público inativo
```

## Exemplo visual

```txt
⚠ Proposta vence em 3 dias
Cliente: Residencial Rio Negro
Responsável: Henrique
[Ver cliente]
```

Regra: alertas devem ser úteis, não exagerados. Se tiver alerta demais, o usuário ignora.

---

# 18. Componente de filtros

Filtros aparecem em CRM, obras, financeiro e relatórios.

## Filtros padrão

```txt
Unidade
Período
Responsável
Status
Tipo de cliente
Produto
Cidade
Busca por texto
```

## Exemplo

```txt
[Unidade ▼] [Vendedor ▼] [Produto ▼] [Status ▼] [Buscar...]
```

No caso do proprietário, o filtro de unidade pode mostrar:

```txt
Todas as unidades
Sombrear GO
Sombrear DF
Sombrear SP
```

---

# 19. Componente de permissões

Usado em configurações.

## Visual

```txt
Perfil: Vendedor

CRM
[✓] Ver
[✓] Criar
[✓] Editar
[ ] Excluir
[ ] Aprovar

Financeiro
[ ] Ver
[ ] Criar
[ ] Editar
[ ] Excluir

Produção
[✓] Ver
[ ] Editar
```

Perfis iniciais:

```txt
Proprietário
Gestor geral
Administrador
Gestor de unidade
Vendedor
Engenharia
Compras
Financeiro
Líder de obra
Assistente
Visualizador
```

---

# 20. Componente de token público

Usado dentro da obra.

## Visual

```txt
Painel público

Status: Ativo
Token: rio-negro-A7K92F
Link: /painel/rio-negro-A7K92F
Último acesso: 28/04/2026
Total de acessos: 134

[Copiar link]
[Ver painel]
[Gerar novo token]
[Desativar painel]
```

## Regras

```txt
Token criado pela Sombrear
Link público sem login
Pode ser desativado
Pode ser renovado
Mostra apenas informações liberadas
Não mostra dados internos
```

Isso atende à sua decisão de usar link público com token criado pela própria Sombrear.

---

# 21. Estados vazios

Telas sem dados precisam ser bonitas e orientar o usuário.

## Exemplo: CRM vazio

```txt
Nenhum cliente cadastrado ainda.

Comece adicionando o primeiro cliente ao CRM da Sombrear.

[ + Novo Cliente ]
```

## Exemplo: arquivos vazios

```txt
Nenhum arquivo enviado.

Envie fotos, propostas, contratos ou documentos relacionados a este cliente.

[ + Enviar arquivo ]
```

---

# 22. Toasts e mensagens rápidas

Mensagens pequenas após ações.

## Exemplos

```txt
Cliente criado com sucesso.
Proposta gerada com sucesso.
Obra criada com sucesso.
Token público copiado.
Arquivo enviado.
Alterações salvas.
```

## Mensagens de erro

```txt
Não foi possível salvar. Verifique os campos obrigatórios.
Você não tem permissão para essa ação.
Token inválido ou desativado.
Arquivo muito grande.
```

---

# 23. Componentes essenciais da primeira versão

Para o MVP, precisamos criar estes componentes primeiro:

```txt
Layout interno
Cabeçalho
Menu lateral
Botão
Card de módulo
Card de indicador
Card de cliente
Card de obra
Badge de status
Formulário
Modal
Tabela
Kanban
Abas
Upload de arquivos
Linha do tempo
Progresso da obra
Comunicado
Token público
Alertas
Filtros
```

---

# 24. Como isso vira o protótipo

A primeira versão visual já pode ser montada com esses componentes:

```txt
Login
→ usa botão, formulário e logo

Ecosistema
→ usa layout, menu, cards, indicadores e alertas

CRM
→ usa kanban, cards, filtros e modal

Ficha do cliente
→ usa abas, formulários, tabelas, arquivos e histórico

Proposta
→ usa blocos de proposta e botões

Obras
→ usa kanban, cards, progresso, checklist e diário

Painel público
→ usa progresso, comunicados, diário e fotos autorizadas
```

---

# 25. Decisão recomendada

O kit visual do Ecosistema Sombrear deve ser chamado internamente de:

```txt
Sombrear UI
```

Ele será o padrão de todos os módulos.

Com isso, cada novo sistema dentro do Ecosistema, como financeiro, pedidos ou calculadora de materiais, já nasce usando o mesmo padrão visual.

O próximo passo ideal é montar o **escopo técnico do MVP**, separando o que entra na primeira versão, o que fica para a segunda fase e o que será apenas simulado no protótipo.
Perfeito. Agora vamos para o **escopo técnico do MVP**.

Aqui a ideia é transformar tudo que detalhamos em uma primeira versão realmente viável do **Ecosistema Sombrear + CRM**, sem tentar construir todos os módulos completos de uma vez.

O escopo original já prevê vários sistemas: CRM, propostas com comissão, pedidos, calculadora de materiais, painel visual do condomínio, dashboard de produção/execução e financeiro.  Para o MVP, vamos criar a base que conecta tudo isso, mas focando primeiro no fluxo principal:

```txt
Cliente entra no CRM
→ vira oportunidade
→ recebe produtos
→ gera orçamento/proposta
→ simula financiamento
→ calcula comissão
→ fecha
→ vira obra
→ gera painel público com token
```

# 1. Objetivo do MVP

O MVP deve provar que o Ecosistema Sombrear consegue controlar o fluxo principal da empresa:

```txt
Comercial → Proposta → Fechamento → Obra → Painel do condomínio
```

Ou seja, a primeira versão não precisa ter financeiro completo, pedidos completo ou calculadora de materiais completa. Ela precisa funcionar bem no caminho principal.

## Objetivo prático

Criar uma aplicação web com:

```txt
Login
Separação por unidades
Permissões básicas
Dashboard inicial
CRM kanban
Cadastro completo de cliente
Produtos no card
Orçamento
Financiamento
Comissão
Geração de obra
Painel público por token
Configurações básicas
```

# 2. Nome do MVP

Sugestão de nome interno:

```txt
Ecosistema Sombrear MVP 1.0
```

Nome comercial dentro do sistema:

```txt
Ecosistema Sombrear
```

Subtítulo:

```txt
Gestão comercial, operacional e acompanhamento de obras
```

# 3. Tecnologias recomendadas

## Front-end

```txt
Next.js
React
TypeScript
Tailwind CSS
```

Motivo: o sistema terá várias telas, login, permissões, dashboards, rotas internas e painel público. Então é melhor começar com uma base profissional.

## Banco de dados e autenticação

```txt
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Row Level Security
```

Motivo: você já cogitou Supabase no escopo, e ele resolve bem autenticação por e-mail, banco de dados, arquivos e segurança. 

## Hospedagem

Para o protótipo:

```txt
Vercel
```

Para produção futura, pode continuar na Vercel ou migrar para estrutura mais controlada, dependendo do volume de dados e usuários.

## Repositório

```txt
GitHub
```

Organização recomendada:

```txt
ecosistema-sombrear/
├── apps/
│   └── web/
├── packages/
│   ├── ui/
│   ├── database/
│   └── utils/
└── docs/
```

Mesmo que comece com um único app, essa estrutura já deixa o sistema pronto para crescer.

# 4. O que entra no MVP 1.0

## Módulo 1 — Login e usuários

### Funções

```txt
Login com e-mail e senha
Recuperação de senha
Cadastro de usuários pelo administrador
Convite por e-mail
Status do usuário
Perfil de acesso
Unidade vinculada
```

### Perfis iniciais

```txt
Proprietário
Gestor geral
Administrador
Gestor de unidade
Vendedor
Engenharia
Financeiro
Líder de obra
Visualizador
```

### Regras básicas

```txt
Proprietário vê todas as unidades.
Gestor de unidade vê apenas sua unidade.
Vendedor vê clientes próprios e da unidade, conforme permissão.
Engenharia vê obras da unidade.
Financeiro vê somente áreas financeiras autorizadas.
```

# 5. Módulo 2 — Unidades

Como você confirmou que o sistema será separado por unidades, esse módulo é obrigatório desde o começo.

## Campos da unidade

```txt
Nome da unidade
Slug
CNPJ
Estado
Cidade
Endereço
Responsável
Telefone
E-mail
Status
```

## Exemplo

```txt
Sombrear DF
Sombrear GO
Sombrear SP
```

## Regras

Todo cliente, proposta, obra, comissão e usuário precisa estar vinculado a uma unidade.

```txt
unidade_id
```

Isso evita mistura de dados entre estados.

# 6. Módulo 3 — Dashboard Ecosistema

Esse é o painel inicial após o login.

O escopo pede um dashboard com ícones de todos os sistemas e dados gerais da empresa, como número de obras em andamento, obras vendidas e fase das obras. 

## O que entra no MVP

```txt
Cards dos módulos
Resumo comercial
Resumo de obras
Resumo de propostas
Resumo de comissões
Alertas básicos
Filtro por unidade
```

## Cards dos módulos

```txt
CRM
Propostas
Produção / Execução
Painel Condomínio
Financeiro
Pedidos
Calculadora de Materiais
Configurações
```

No MVP, alguns cards podem aparecer como:

```txt
Em construção
```

Especialmente:

```txt
Pedidos
Calculadora de Materiais
Financeiro completo
```

## Indicadores iniciais

```txt
Clientes em prospecção
Propostas enviadas
Valor em negociação
Valor vendido
Obras em contrato
Obras em execução
Obras finalizadas
Comissões previstas
Clientes sem movimentação
```

# 7. Módulo 4 — CRM Kanban

Esse será o coração do MVP.

O CRM precisa seguir o modelo kanban, com fases comerciais, cards arrastáveis e dados do cliente, como você definiu no escopo. 

## Colunas iniciais

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

## Funções do MVP

```txt
Criar cliente
Editar cliente
Criar oportunidade
Mover card entre colunas
Filtrar por unidade
Filtrar por vendedor
Filtrar por produto
Filtrar por tipo de cliente
Buscar cliente
Abrir ficha completa
Registrar histórico automático
```

## Card do CRM

O card mostra:

```txt
Nome do cliente
Unidade
Tipo de cliente
Produto principal
Valor estimado
Vendedor
Próxima ação
Temperatura
```

# 8. Módulo 5 — Ficha completa do cliente

No MVP, a ficha do cliente precisa ter as abas principais, mas algumas podem ser mais simples.

## Abas que entram no MVP

```txt
Resumo
Dados gerais
Contatos
Comercial
Produtos / Escopo
Orçamento
Financiamento
Comissão
Agenda
Arquivos
Histórico
```

## Dados gerais

```txt
Nome do cliente
Tipo de cliente
Unidade
CNPJ / CPF
Endereço
Cidade
Estado
Origem do lead
Vendedor responsável
Observações
```

## Tipos de cliente

Como você confirmou que haverá outros tipos além de condomínio:

```txt
Condomínio residencial
Condomínio comercial
Empresa privada
Escola
Comércio
Órgão público
Associação
Pessoa física
Outro
```

## Contatos

```txt
Nome
Cargo/função
Telefone
WhatsApp
E-mail
Tipo de contato
Contato principal
```

Esse ponto é importante porque a operação da Sombrear envolve síndico, administradora, moradores, assembleia e comunicação ativa com o condomínio. 

# 9. Módulo 6 — Produtos / Escopo

A Sombrear tem um portfólio que inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

## Produtos iniciais no MVP

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

## Campos por produto

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Inclui iluminação
Inclui calha
Inclui rufo
Inclui bicicletário
Inclui projeto
Inclui ART
Observações técnicas
```

## Regra

Uma oportunidade pode ter vários produtos.

Exemplo:

```txt
Sombrite garagem + sombrite parquinho + telha galvalume
```

# 10. Módulo 7 — Orçamento e proposta

Esse módulo entra dentro do CRM.

## Funções do MVP

```txt
Criar orçamento
Calcular valor total
Aplicar desconto
Definir forma de pagamento
Definir validade
Gerar proposta simplificada
Visualizar proposta
Marcar proposta como enviada
Marcar proposta como aprovada
Marcar proposta como recusada
```

## Proposta simplificada no MVP

A primeira versão pode gerar uma proposta visual dentro do sistema, ainda sem PDF perfeito.

Estrutura:

```txt
Logo Sombrear
Cliente
Unidade
Produto
Quantidade
Valor total
Condição de pagamento
Validade
Observações
Contato do vendedor
```

A proposta deve seguir a identidade visual: fundo branco, textos em grafite, verde institucional para destaque e visual limpo. 

## PDF

No MVP, eu colocaria:

```txt
Gerar PDF simples
```

A proposta PDF mais elaborada pode ficar para a fase 2.

# 11. Módulo 8 — Financiamento

Esse módulo também entra dentro do CRM.

## Funções do MVP

```txt
Informar valor total
Informar entrada
Informar número de unidades
Informar número de parcelas
Informar taxa mensal
Calcular valor por unidade
Calcular valor por vaga
Salvar simulação
Enviar resultado para proposta
```

## Resultado esperado

```txt
Valor total da obra
Valor total financiado
Valor da parcela geral
Valor por unidade/morador
Valor por vaga
```

Esse módulo é muito importante para condomínios, porque ajuda na apresentação em assembleia.

# 12. Módulo 9 — Comissão

## Funções do MVP

```txt
Calcular comissão automaticamente
Usar percentual padrão
Permitir alteração por gestor autorizado
Mostrar comissão prevista
Status da comissão
Histórico da comissão
```

## Status

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

## Regra

O vendedor pode visualizar a própria comissão. Gestor, proprietário ou financeiro autorizado pode editar, aprovar ou marcar como paga.

# 13. Módulo 10 — Agenda

## Funções do MVP

```txt
Criar evento
Editar evento
Definir responsável
Definir data e hora
Definir status
Listar próximas ações
Mostrar próxima ação no card do CRM
```

## Tipos de evento

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

A jornada comercial da Sombrear envolve visita técnica, estratégia de assembleia, apresentação, plantão de dúvidas e contratação.  Então a agenda não é acessória; ela precisa fazer parte do CRM desde a primeira versão.

# 14. Módulo 11 — Arquivos

## Funções do MVP

```txt
Upload de arquivos
Vincular arquivo ao cliente
Vincular arquivo à proposta
Vincular arquivo à obra
Definir categoria
Definir visibilidade
```

## Categorias iniciais

```txt
Foto da visita
Proposta
Contrato
Ata
Edital
Projeto
ART
Comprovante
Foto da obra
Outro
```

## Visibilidade

```txt
Interno
Liberado para cliente
Liberado no painel público
```

Essa regra evita que um documento interno apareça por engano no painel público.

# 15. Módulo 12 — Gerar obra

Quando o card for movido para **Fechado**, o sistema deve permitir gerar obra.

## Funções do MVP

```txt
Marcar oportunidade como fechada
Criar obra automaticamente
Copiar dados do cliente
Copiar produtos vendidos
Copiar valor final
Criar etapas padrão
Criar token público
Registrar histórico
```

## Tela de confirmação

```txt
Cliente fechado.

Deseja gerar a obra?

Ao confirmar, serão criados:
✓ Obra no painel de produção
✓ Etapas da obra
✓ Token público
✓ Pasta de arquivos
✓ Registro no histórico
```

# 16. Módulo 13 — Obras / Produção simples

No MVP, o módulo de produção será uma versão inicial, não o dashboard completo.

O escopo original pede um dashboard para entender o andamento das obras e evitar esquecimento de etapas e bonificações. 

## Funções do MVP

```txt
Listar obras
Filtrar por unidade
Ver status da obra
Atualizar etapa atual
Abrir ficha da obra
Criar diário simples
Criar comunicado simples
Gerenciar painel público
```

## Etapas padrão da obra

Para o MVP, podemos usar etapas agrupadas:

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

Mas por trás, podemos deixar preparado para as 15 etapas completas que você definiu no painel do condomínio.

# 17. Módulo 14 — Painel público por token

Você definiu que o painel será por **link público com token criado pela Sombrear**.

## Funções do MVP

```txt
Gerar token público
Ativar/desativar token
Copiar link
Abrir painel público
Mostrar status da obra
Mostrar etapas
Mostrar comunicados publicados
Mostrar diários públicos
Mostrar fotos liberadas
```

## O público pode ver

```txt
Nome da obra
Status atual
Progresso
Etapas principais
Comunicados
Diários simplificados
Fotos autorizadas
Contato da Sombrear
```

## O público não pode ver

```txt
Comissão
Custos internos
Margem
Financeiro interno
Observações internas
Problemas sensíveis
Arquivos privados
```

# 18. Módulo 15 — Configurações básicas

## Funções do MVP

```txt
Cadastrar unidades
Cadastrar usuários
Definir perfis
Cadastrar produtos
Editar colunas do CRM
Editar status da obra
Editar percentual padrão de comissão
Editar tipos de cliente
Editar origens do lead
Editar motivos de perda
```

Isso atende ao seu pedido de ter modo de configurações para editar status, valores, peças e itens principais. 

# 19. O que fica apenas visual no MVP

Alguns módulos podem aparecer na tela, mas sem funcionalidade completa.

## Pedidos

No MVP:

```txt
Card visível no Ecosistema
Tela “em construção”
Espaço reservado para integração futura
```

Motivo: você disse que esse sistema já está feito e que completaria as informações depois. 

## Calculadora de materiais

No MVP:

```txt
Card visível
Tela “em construção”
Mensagem: módulo em desenvolvimento
```

Motivo: no escopo, essa etapa ainda seria descrita futuramente. 

## Financeiro completo

No MVP:

```txt
Resumo básico
Comissões previstas
Valor vendido
Valor em negociação
Sem contas a pagar/receber completas
```

O financeiro detalhado fica para a fase 2.

## Dashboard TV

No MVP:

```txt
Tela visual simples
Obras ativas
Pendências
Status geral
```

Sem automações avançadas no início.

# 20. O que fica para a fase 2

Depois que o MVP estiver funcionando, entram:

```txt
Financeiro completo
Contas a pagar
Contas a receber
Fluxo de caixa
Pedidos integrado
Calculadora de materiais
Comanda de produção
Relatórios avançados
Dashboard TV completo
Geração avançada de PDF
Modelos de proposta completos
Modelos de comunicado em PDF
Integração com WhatsApp
Integração com e-mail
Notificações automáticas
Controle avançado de permissões
Assinatura digital
Aplicativo mobile ou PWA
```

# 21. O que fica para a fase 3

```txt
BI avançado
Previsão de vendas
Métricas por unidade
Métricas por vendedor
Ranking de produtos
Controle de produtividade de equipes
Controle de estoque
Integração com indústria
Comandas automáticas
Portal premium do cliente
Book digital da obra
Manual de manutenção digital
Garantia digital
```

A parte de book da obra, manual de uso, manual de manutenção, projeto estrutural e placa de entrega faz sentido para uma fase mais avançada, porque o raio-x operacional mostra que a Sombrear já tem uma entrega premium e pós-entrega estruturado. 

# 22. Critérios de sucesso do MVP

O MVP estará bom quando conseguir fazer este fluxo completo:

```txt
1. Administrador cadastra uma unidade.
2. Administrador cadastra um usuário.
3. Vendedor acessa o sistema.
4. Vendedor cria um cliente.
5. Cliente aparece no kanban.
6. Vendedor move o card entre etapas.
7. Vendedor adiciona produto.
8. Sistema calcula valor total.
9. Sistema simula financiamento.
10. Sistema calcula comissão.
11. Vendedor gera proposta.
12. Cliente é marcado como fechado.
13. Sistema gera obra.
14. Sistema gera token público.
15. Síndico/morador acessa painel público por link.
16. Engenharia atualiza etapa da obra.
17. Painel público mostra a atualização.
```

Esse é o coração do Ecosistema Sombrear.

# 23. Escopo fechado do MVP 1.0

## Entra no MVP

```txt
Login
Usuários
Unidades
Permissões básicas
Dashboard Ecosistema
CRM Kanban
Ficha do cliente
Produtos
Orçamento
Proposta simples
Financiamento
Comissão
Agenda
Arquivos
Gerar obra
Produção simples
Painel público por token
Configurações básicas
```

## Não entra completo no MVP

```txt
Financeiro completo
Pedidos completo
Calculadora de materiais
Comanda de produção
Relatórios avançados
Dashboard TV completo
PDF premium
Integrações externas
```

## Aparece como placeholder

```txt
Pedidos
Calculadora de materiais
Financeiro avançado
Relatórios avançados
```

# 24. Recomendação final desta etapa

Eu recomendo construir o MVP em 4 blocos:

```txt
Bloco 1 — Base
Login, unidades, usuários, permissões e layout.

Bloco 2 — Comercial
CRM, cliente, produtos, orçamento, proposta, financiamento e comissão.

Bloco 3 — Obra
Gerar obra, etapas, produção simples, diário e comunicado.

Bloco 4 — Painel público
Token, painel do condomínio e informações liberadas.
```

Essa ordem é a mais segura porque o sistema começa pela base, depois passa pelo comercial, depois pela execução e por fim libera a visão para o condomínio.

O próximo bloco ideal é montar o **documento de requisitos do MVP**, já no formato que um desenvolvedor conseguiria usar para construir o sistema.
Perfeito. Agora vamos montar o **Documento de Requisitos do MVP — Ecosistema Sombrear 1.0**.

Esse documento organiza o que o sistema precisa fazer na primeira versão, com foco no fluxo principal: **CRM → proposta → comissão → fechamento → obra → painel público do condomínio**. Essa estrutura vem do escopo inicial que você trouxe para o Ecosistema Sombrear e dos módulos previstos para a empresa. 

# Documento de Requisitos — Ecosistema Sombrear MVP 1.0

## 1. Nome do sistema

**Ecosistema Sombrear**

## 2. Objetivo do sistema

Criar uma plataforma interna para centralizar a gestão comercial, operacional e de acompanhamento de obras da Sombrear, permitindo que cada unidade da empresa tenha seus próprios usuários, clientes, propostas, obras e painéis públicos.

O sistema deve permitir que a Sombrear acompanhe desde a entrada de um cliente no CRM até a geração de uma obra e a publicação de um painel visual para síndicos e moradores.

---

# 3. Escopo do MVP 1.0

## Entra no MVP

```txt
Login e autenticação
Cadastro de unidades
Cadastro de usuários
Perfis e permissões básicas
Dashboard inicial do Ecosistema
CRM em kanban
Cadastro de clientes
Cadastro de contatos
Produtos e escopo da oportunidade
Orçamento
Proposta simplificada
Simulação de financiamento
Cálculo de comissão
Agenda comercial
Upload de arquivos
Histórico do cliente
Marcar cliente como fechado
Gerar obra
Produção simples
Etapas da obra
Comunicado simples
Diário de obra simples
Painel público por token
Configurações básicas
```

## Não entra completo no MVP

```txt
Financeiro completo
Contas a pagar
Contas a receber
Sistema de pedidos completo
Calculadora de materiais
Comanda de produção
Relatórios avançados
Dashboard TV completo
PDF premium
Integração com WhatsApp
Integração com e-mail
Assinatura digital
Book digital da obra
```

Esses módulos podem aparecer visualmente como “em construção”, mas não serão desenvolvidos por completo na primeira versão.

---

# 4. Tecnologias recomendadas

## Front-end

```txt
Next.js
React
TypeScript
Tailwind CSS
```

## Back-end / Banco de dados

```txt
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Row Level Security
```

## Hospedagem

```txt
Vercel
```

## Repositório

```txt
GitHub
```

## Estrutura recomendada

```txt
ecosistema-sombrear/
├── apps/
│   └── web/
├── packages/
│   ├── ui/
│   ├── database/
│   └── utils/
└── docs/
```

---

# 5. Perfis de usuário

O sistema deve possuir controle de acesso por perfil.

## Perfis iniciais

```txt
Proprietário
Gestor geral
Administrador
Gestor de unidade
Vendedor
Engenharia
Financeiro
Líder de obra
Visualizador
```

## Regras gerais

```txt
Proprietário vê todas as unidades.
Gestor geral vê todas ou unidades autorizadas.
Gestor de unidade vê apenas sua unidade.
Vendedor vê clientes e oportunidades da sua unidade ou seus próprios clientes.
Engenharia vê obras da sua unidade.
Financeiro vê apenas áreas financeiras autorizadas.
Líder de obra vê apenas obras atribuídas.
Visualizador apenas consulta informações permitidas.
```

---

# 6. Unidades da Sombrear

O sistema deve separar os dados por unidade.

Exemplos:

```txt
Sombrear GO
Sombrear DF
Sombrear SP
Sombrear MG
```

## Campos da unidade

```txt
Nome da unidade
Slug
CNPJ
Estado
Cidade
Endereço
Responsável
Telefone
E-mail
Status
```

## Regra obrigatória

Todo registro importante deve ter vínculo com uma unidade:

```txt
cliente
oportunidade
proposta
comissão
obra
usuário
arquivo
relatório
```

---

# 7. Módulo: Login e autenticação

## Requisitos funcionais

**RF-001 — Login de usuário**
O sistema deve permitir login com e-mail e senha.

**RF-002 — Recuperação de senha**
O usuário deve conseguir solicitar recuperação de senha por e-mail.

**RF-003 — Convite de usuário**
O administrador deve conseguir cadastrar um usuário e enviar convite por e-mail.

**RF-004 — Status do usuário**
O sistema deve controlar usuários com status:

```txt
Ativo
Pendente
Bloqueado
Desativado
```

**RF-005 — Redirecionamento pós-login**
Após o login, o usuário deve ser direcionado para o Dashboard do Ecosistema.

---

# 8. Módulo: Dashboard Ecosistema

O Dashboard será a tela mãe do sistema.

O escopo original prevê um dashboard com ícones dos sistemas e dados gerais da empresa, como número de obras em andamento, obras vendidas e fases das obras. 

## Requisitos funcionais

**RF-006 — Exibir cards dos módulos**
O sistema deve exibir os módulos principais:

```txt
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Relatórios
Configurações
```

**RF-007 — Exibir indicadores gerais**
O dashboard deve exibir indicadores como:

```txt
Clientes em prospecção
Propostas enviadas
Valor em negociação
Valor vendido
Obras em contrato
Obras em execução
Obras finalizadas
Comissões previstas
Clientes sem movimentação
```

**RF-008 — Filtrar por unidade**
Usuários autorizados devem conseguir filtrar dados por unidade.

**RF-009 — Restringir visão por perfil**
Cada usuário deve visualizar apenas os dados compatíveis com sua permissão.

---

# 9. Módulo: CRM Kanban

O CRM será o principal módulo do MVP.

O sistema deve seguir o modelo kanban, com cards arrastáveis entre etapas comerciais. O escopo original prevê etapas como prospecção, visita técnica, orçamento, proposta enviada, negociação, assembleia, fechado e perdido. 

## Colunas iniciais

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

## Requisitos funcionais

**RF-010 — Criar cliente/oportunidade**
O usuário autorizado deve conseguir criar um novo cliente no CRM.

**RF-011 — Exibir clientes em kanban**
O CRM deve exibir as oportunidades em colunas por etapa.

**RF-012 — Mover cards**
O usuário deve conseguir arrastar cards entre colunas.

**RF-013 — Registrar histórico de movimentação**
Toda mudança de coluna deve gerar registro no histórico.

**RF-014 — Filtrar oportunidades**
O CRM deve permitir filtros por:

```txt
Unidade
Vendedor
Tipo de cliente
Produto
Cidade
Temperatura
Status
Período
```

**RF-015 — Buscar cliente**
O sistema deve permitir busca por nome do cliente, condomínio, empresa ou responsável.

---

# 10. Módulo: Cliente e contatos

## Tipos de cliente

Como o sistema não será limitado a condomínios, os tipos iniciais serão:

```txt
Condomínio residencial
Condomínio comercial
Empresa privada
Escola
Comércio
Órgão público
Associação
Pessoa física
Outro
```

## Campos do cliente

```txt
Nome do cliente
Tipo de cliente
Unidade responsável
CNPJ / CPF
Razão social
Nome fantasia
CEP
Endereço
Bairro
Cidade
Estado
Origem do lead
Vendedor responsável
Observações
```

## Campos de contato

```txt
Nome
Cargo / função
Tipo de contato
Telefone
WhatsApp
E-mail
Contato principal
Observações
```

## Tipos de contato

```txt
Síndico
Subsíndico
Administradora
Financeiro
Técnico
Compras
Morador representante
Responsável da empresa
Outro
```

A estrutura precisa permitir vários contatos por cliente, porque a operação da Sombrear envolve síndico, administradora, moradores, assembleias e comunicação com o condomínio. 

---

# 11. Módulo: Produtos e escopo

A Sombrear possui portfólio com sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

## Produtos iniciais

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

## Requisitos funcionais

**RF-016 — Adicionar produto à oportunidade**
O usuário deve conseguir adicionar um ou mais produtos a uma oportunidade.

**RF-017 — Calcular valor total por produto**
O sistema deve calcular valor total com base em quantidade, área ou valor unitário.

**RF-018 — Permitir produto personalizado**
O sistema deve permitir cadastrar item personalizado na oportunidade.

## Campos do produto na oportunidade

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Inclui iluminação
Inclui calha
Inclui rufo
Inclui bicicletário
Inclui projeto
Inclui ART
Observações técnicas
```

---

# 12. Módulo: Orçamento e proposta

## Requisitos funcionais

**RF-019 — Criar orçamento**
O sistema deve permitir criar orçamento vinculado à oportunidade.

**RF-020 — Calcular valor bruto**
O sistema deve somar todos os produtos adicionados.

**RF-021 — Aplicar desconto**
O sistema deve permitir desconto em valor ou percentual.

**RF-022 — Calcular valor final**
O sistema deve calcular o valor final da proposta.

**RF-023 — Gerar proposta simplificada**
O sistema deve gerar uma proposta simples com os dados principais da oportunidade.

**RF-024 — Alterar status da proposta**
A proposta deve possuir status:

```txt
Rascunho
Gerada
Enviada
Em análise
Aprovada
Recusada
Vencida
Cancelada
```

## Estrutura da proposta simplificada

```txt
Logo Sombrear
Cliente
Unidade
Vendedor
Produto / escopo
Quantidade
Valor total
Condição de pagamento
Validade
Observações
Contato
```

A proposta deve respeitar a identidade visual da Sombrear, com visual limpo, técnico, verde institucional para destaques e fundo branco. 

---

# 13. Módulo: Financiamento

## Requisitos funcionais

**RF-025 — Criar simulação de financiamento**
O sistema deve permitir criar simulação vinculada à oportunidade ou proposta.

**RF-026 — Calcular valor financiado**
O sistema deve calcular:

```txt
Valor total da obra
Entrada
Valor financiado
Número de parcelas
Valor da parcela geral
Valor por unidade/morador
Valor por vaga
```

**RF-027 — Permitir taxa editável**
O usuário autorizado deve conseguir informar taxa mensal.

**RF-028 — Enviar resultado para proposta**
O resultado da simulação deve poder aparecer na proposta.

## Campos

```txt
Valor total
Entrada
Valor financiado
Número de unidades
Número de vagas
Número de parcelas
Taxa mensal
Tipo de financiamento
Valor por unidade
Valor por vaga
Observações
```

---

# 14. Módulo: Comissão

## Requisitos funcionais

**RF-029 — Calcular comissão automaticamente**
O sistema deve calcular comissão com base no valor da venda e percentual configurado.

**RF-030 — Permitir alteração por perfil autorizado**
Apenas usuários autorizados podem alterar percentual de comissão.

**RF-031 — Exibir comissão ao vendedor**
O vendedor deve visualizar suas próprias comissões.

**RF-032 — Controlar status da comissão**
A comissão deve possuir status:

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

## Campos

```txt
Vendedor
Valor base
Percentual
Valor da comissão
Status
Data prevista de pagamento
Data de pagamento
Observações
```

---

# 15. Módulo: Agenda comercial

## Requisitos funcionais

**RF-033 — Criar evento**
O usuário deve conseguir criar eventos comerciais.

**RF-034 — Vincular evento ao cliente**
Todo evento deve estar vinculado a um cliente ou oportunidade.

**RF-035 — Mostrar próxima ação no card**
A próxima ação deve aparecer no card do CRM.

## Tipos de evento

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

A jornada comercial da Sombrear envolve visita técnica, apoio em assembleia, apresentação, plantão de dúvidas e contratação, então a agenda precisa estar integrada ao CRM. 

---

# 16. Módulo: Arquivos

## Requisitos funcionais

**RF-036 — Enviar arquivo**
O usuário deve conseguir enviar arquivos vinculados a cliente, oportunidade, proposta ou obra.

**RF-037 — Classificar arquivo**
O arquivo deve possuir categoria.

**RF-038 — Definir visibilidade**
O arquivo deve ter visibilidade:

```txt
Interno
Liberado para cliente
Liberado no painel público
```

## Categorias

```txt
Foto da visita
Proposta
Contrato
Ata
Edital
Projeto
ART
Comprovante
Foto da obra
Outro
```

---

# 17. Módulo: Histórico

## Requisitos funcionais

**RF-039 — Registrar ações automaticamente**
O sistema deve registrar ações importantes, como:

```txt
Cliente criado
Cliente editado
Card movido
Produto adicionado
Proposta gerada
Proposta enviada
Comissão calculada
Cliente marcado como fechado
Obra gerada
Token público criado
```

**RF-040 — Exibir linha do tempo**
O histórico deve aparecer em formato de linha do tempo dentro do cliente e da obra.

---

# 18. Módulo: Gerar obra

Quando uma oportunidade for marcada como **Fechado**, o sistema deve permitir gerar uma obra.

## Requisitos funcionais

**RF-041 — Marcar oportunidade como fechada**
O usuário autorizado deve poder marcar uma oportunidade como fechada.

**RF-042 — Gerar obra automaticamente**
Ao confirmar, o sistema deve criar uma obra com base na oportunidade.

**RF-043 — Copiar dados principais**
A obra deve receber:

```txt
Cliente
Unidade
Endereço
Produtos vendidos
Valor contratado
Vendedor
Responsável
Arquivos vinculados
```

**RF-044 — Criar etapas padrão**
O sistema deve criar etapas iniciais da obra.

**RF-045 — Criar token público**
O sistema deve gerar token público para o painel do condomínio.

---

# 19. Módulo: Produção / Execução simples

No MVP, a produção será simples, mas já conectada ao CRM.

## Etapas resumidas do MVP

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

## Requisitos funcionais

**RF-046 — Listar obras**
O sistema deve listar obras geradas a partir do CRM.

**RF-047 — Filtrar obras por unidade**
O usuário deve conseguir filtrar por unidade, status e responsável.

**RF-048 — Atualizar etapa da obra**
Engenharia ou perfil autorizado deve conseguir atualizar a etapa.

**RF-049 — Criar diário de obra simples**
O sistema deve permitir registrar atividades realizadas.

**RF-050 — Criar comunicado simples**
O sistema deve permitir criar comunicado vinculado à obra.

**RF-051 — Definir visibilidade pública**
Diários, fotos e comunicados podem ser marcados como visíveis ou não no painel público.

O dashboard de produção deve ajudar a não esquecer etapas, pendências e bonificações, conforme necessidade descrita no escopo. 

---

# 20. Módulo: Painel público do condomínio

O painel público será acessado por link com token criado pela Sombrear.

## Requisitos funcionais

**RF-052 — Gerar link público**
O sistema deve gerar um link público único para cada obra.

**RF-053 — Acessar sem login**
Síndicos e moradores devem conseguir acessar o painel sem criar conta.

**RF-054 — Validar token**
O sistema deve validar se o token existe e está ativo.

**RF-055 — Exibir status da obra**
O painel deve mostrar a etapa atual da obra.

**RF-056 — Exibir progresso**
O painel deve mostrar progresso visual das etapas.

**RF-057 — Exibir comunicados publicados**
Somente comunicados marcados como públicos devem aparecer.

**RF-058 — Exibir diários públicos**
Somente diários marcados como públicos devem aparecer.

**RF-059 — Exibir fotos autorizadas**
Somente fotos liberadas para o painel público devem aparecer.

## O painel público pode mostrar

```txt
Nome da obra
Status atual
Progresso
Etapas principais
Comunicados
Diários simplificados
Fotos autorizadas
Contato da Sombrear
```

## O painel público não pode mostrar

```txt
Comissão
Custos internos
Margem
Financeiro interno
Observações internas
Pendências sensíveis
Arquivos privados
```

---

# 21. Módulo: Configurações básicas

## Requisitos funcionais

**RF-060 — Cadastrar unidades**
O administrador deve conseguir criar e editar unidades.

**RF-061 — Cadastrar usuários**
O administrador deve conseguir criar e editar usuários.

**RF-062 — Configurar perfis**
O administrador deve conseguir definir perfil de acesso.

**RF-063 — Configurar produtos**
O administrador deve conseguir cadastrar e editar produtos.

**RF-064 — Configurar colunas do CRM**
O administrador deve conseguir editar colunas do kanban.

**RF-065 — Configurar status de obra**
O administrador deve conseguir editar etapas/status da obra.

**RF-066 — Configurar comissão padrão**
O administrador deve conseguir definir percentual padrão de comissão.

**RF-067 — Configurar tipos de cliente**
O administrador deve conseguir editar tipos de cliente.

**RF-068 — Configurar motivos de perda**
O administrador deve conseguir editar motivos de perda.

---

# 22. Requisitos não funcionais

## RNF-001 — Segurança

O sistema deve proteger os dados internos com autenticação, permissões por perfil e separação por unidade.

## RNF-002 — Separação por unidade

Usuários só devem visualizar dados das unidades às quais têm acesso.

## RNF-003 — Responsividade

O sistema deve funcionar bem em desktop, notebook e tablet.

## RNF-004 — Performance

Telas principais devem carregar de forma rápida, especialmente CRM e dashboard.

## RNF-005 — Histórico

Ações importantes devem ser registradas para auditoria.

## RNF-006 — Upload seguro

Arquivos internos não devem ficar públicos por padrão.

## RNF-007 — Painel público seguro

O painel público deve mostrar apenas dados liberados e depender de token válido.

## RNF-008 — Identidade visual

O sistema deve seguir a identidade visual da Sombrear, com uso de verde institucional, grafite, cinzas, branco e layout limpo. 

---

# 23. Critérios de aceite do MVP

O MVP será considerado funcional quando o seguinte fluxo estiver funcionando:

```txt
1. Administrador cria uma unidade.
2. Administrador cria um usuário.
3. Usuário acessa o sistema por login.
4. Usuário entra no Dashboard do Ecosistema.
5. Usuário acessa o CRM.
6. Usuário cria um cliente.
7. Cliente aparece no kanban.
8. Usuário move o card entre etapas.
9. Usuário adiciona contatos.
10. Usuário adiciona produtos.
11. Sistema calcula valor total.
12. Usuário cria proposta simplificada.
13. Sistema simula financiamento.
14. Sistema calcula comissão.
15. Usuário agenda assembleia ou próxima ação.
16. Usuário marca oportunidade como fechada.
17. Sistema gera obra.
18. Sistema gera token público.
19. Engenharia atualiza etapa da obra.
20. Painel público mostra a atualização.
```

---

# 24. Backlog para fase 2

Após o MVP, a próxima fase deve incluir:

```txt
Financeiro completo
Contas a pagar
Contas a receber
Fluxo de caixa
Pedidos integrado
Calculadora de materiais
Comanda de produção
Relatórios avançados
Dashboard TV completo
PDF premium das propostas
Modelos de comunicados em PDF
Integração com WhatsApp
Integração com e-mail
Notificações automáticas
Assinatura digital
Book digital da obra
Garantia digital
```

---

# 25. Próximo passo recomendado

Agora que temos o documento de requisitos, o próximo passo é montar o **backlog de desenvolvimento por etapas**, em formato de tarefas:

```txt
Sprint 1 — Base do sistema
Sprint 2 — CRM
Sprint 3 — Propostas, financiamento e comissão
Sprint 4 — Obras e painel público
Sprint 5 — Ajustes, testes e preparação para uso interno
```

Isso transforma o projeto em um plano de execução real.
Perfeito. O próximo passo é montar o **Backlog de Desenvolvimento do Ecosistema Sombrear MVP 1.0**.

Esse backlog é a lista organizada do que precisa ser desenvolvido, em ordem lógica, para sair do planejamento e virar sistema.

# Backlog de Desenvolvimento — Ecosistema Sombrear MVP 1.0

## Visão geral

O MVP será construído em 5 grandes etapas:

```txt
Sprint 1 — Base do sistema
Sprint 2 — CRM
Sprint 3 — Propostas, financiamento e comissão
Sprint 4 — Obras e painel público
Sprint 5 — Ajustes, testes e preparação para uso interno
```

O foco do MVP é validar o fluxo principal:

```txt
Cliente entra no CRM
→ recebe produtos e orçamento
→ gera proposta
→ calcula financiamento e comissão
→ fecha venda
→ gera obra
→ cria painel público com token
```

Esse fluxo segue o escopo inicial do Ecosistema Sombrear, que prevê CRM, propostas, cálculo de comissão, painel visual do condomínio, produção/execução e dashboard geral da empresa. 

---

# Sprint 1 — Base do sistema

## Objetivo

Criar a estrutura inicial do Ecosistema Sombrear: login, layout, unidades, usuários, permissões e dashboard inicial.

Essa sprint é a fundação. Sem ela, os outros módulos ficam soltos.

---

## Tarefa 1.1 — Criar projeto base

### Descrição

Criar o projeto web do Ecosistema Sombrear com a estrutura técnica inicial.

### Entregas

```txt
Criar projeto Next.js
Configurar TypeScript
Configurar Tailwind CSS
Criar estrutura de pastas
Configurar tema visual da Sombrear
Criar layout base
Criar rotas principais
```

### Estrutura inicial

```txt
ecosistema-sombrear/
├── app/
│   ├── login/
│   ├── ecossistema/
│   ├── crm/
│   ├── obras/
│   ├── painel/
│   └── configuracoes/
├── components/
├── lib/
├── styles/
└── types/
```

### Critério de aceite

O projeto deve abrir no navegador com uma tela inicial básica e layout visual da Sombrear.

---

## Tarefa 1.2 — Criar identidade visual do sistema

### Descrição

Aplicar a identidade da Sombrear no sistema.

O visual deve ser limpo, técnico e moderno, usando verde institucional, cinzas, branco e grafite. O manual de identidade visual reforça que a comunicação deve evitar poluição visual e usar o verde como destaque. 

### Entregas

```txt
Configurar paleta de cores
Configurar fonte principal
Criar padrão de botões
Criar padrão de cards
Criar padrão de badges
Criar padrão de formulários
Criar padrão de tabelas
```

### Paleta inicial

```txt
Verde principal: #8DC63F
Verde escuro: #5FA12B
Verde claro: #CFE8A9
Grafite: #2B2B2B
Cinza médio: #6F6F6F
Cinza claro: #F3F3F3
Branco: #FFFFFF
```

### Critério de aceite

Todas as primeiras telas devem parecer parte do mesmo sistema.

---

## Tarefa 1.3 — Configurar Supabase

### Descrição

Configurar banco de dados, autenticação e armazenamento de arquivos.

### Entregas

```txt
Criar projeto no Supabase
Configurar conexão com o front-end
Configurar Supabase Auth
Configurar Supabase Storage
Criar variáveis de ambiente
Criar cliente Supabase no projeto
```

### Critério de aceite

O sistema deve conseguir conectar ao Supabase e realizar uma consulta básica.

---

## Tarefa 1.4 — Criar autenticação

### Descrição

Criar login, logout e recuperação de senha.

### Entregas

```txt
Tela de login
Login com e-mail e senha
Logout
Recuperação de senha
Proteção de rotas internas
Redirecionamento após login
```

### Critério de aceite

Usuário não logado não pode acessar telas internas.

---

## Tarefa 1.5 — Criar cadastro de unidades

### Descrição

Criar a estrutura para cadastrar unidades da Sombrear.

### Campos

```txt
Nome da unidade
Slug
CNPJ
Estado
Cidade
Endereço
Responsável
Telefone
E-mail
Status
```

### Entregas

```txt
Tabela unidades no banco
Tela de listagem de unidades
Formulário de nova unidade
Formulário de edição
Ativar/desativar unidade
```

### Critério de aceite

O administrador deve conseguir criar, editar e desativar unidades.

---

## Tarefa 1.6 — Criar cadastro de usuários

### Descrição

Criar usuários internos vinculados a unidades e perfis.

### Campos

```txt
Nome
E-mail
Telefone
Unidade principal
Perfil
Status
```

### Perfis iniciais

```txt
Proprietário
Gestor geral
Administrador
Gestor de unidade
Vendedor
Engenharia
Financeiro
Líder de obra
Visualizador
```

### Entregas

```txt
Tabela de perfis de usuário
Tela de usuários
Criar usuário
Editar usuário
Vincular usuário a unidade
Definir perfil
Ativar/desativar usuário
```

### Critério de aceite

O administrador deve conseguir cadastrar usuários e definir a unidade/perfil de cada um.

---

## Tarefa 1.7 — Criar permissões básicas

### Descrição

Criar uma primeira camada de controle de acesso.

### Regras iniciais

```txt
Proprietário vê tudo
Gestor geral vê todas ou unidades autorizadas
Gestor de unidade vê apenas sua unidade
Vendedor vê CRM e seus clientes
Engenharia vê obras
Financeiro vê módulos financeiros autorizados
Visualizador apenas consulta
```

### Critério de aceite

Menus e dados devem mudar conforme o perfil do usuário.

---

## Tarefa 1.8 — Criar layout interno

### Descrição

Criar o layout padrão do sistema.

### Entregas

```txt
Cabeçalho
Menu lateral
Área de conteúdo
Componente de usuário logado
Seletor de unidade
Botão de sair
```

### Menu inicial

```txt
Início
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Relatórios
Configurações
```

### Critério de aceite

Todas as páginas internas devem usar o mesmo layout.

---

## Tarefa 1.9 — Criar Dashboard Ecosistema

### Descrição

Criar a tela mãe do Ecosistema.

O escopo pede um dashboard com ícones dos sistemas e dados gerais da empresa, como obras em andamento, obras vendidas e fase das obras. 

### Entregas

```txt
Cards dos módulos
Indicadores comerciais
Indicadores de obras
Indicadores de comissão
Alertas básicos
Filtro por unidade
```

### Cards dos módulos

```txt
CRM
Propostas
Pedidos
Calculadora de Materiais
Produção / Execução
Painel Condomínio
Financeiro
Configurações
```

### Critério de aceite

Após login, o usuário deve visualizar o Dashboard do Ecosistema com os módulos disponíveis para o perfil dele.

---

# Sprint 2 — CRM

## Objetivo

Criar o CRM comercial da Sombrear com kanban, cadastro de clientes, contatos, produtos e histórico.

O CRM é o coração do MVP.

---

## Tarefa 2.1 — Criar tabelas do CRM

### Entregas

```txt
Tabela clientes
Tabela contatos
Tabela oportunidades
Tabela colunas do CRM
Tabela histórico do CRM
Tabela produtos
Tabela oportunidade_produtos
```

### Critério de aceite

O banco deve estar pronto para cadastrar clientes, oportunidades, produtos e histórico.

---

## Tarefa 2.2 — Criar colunas do kanban

### Colunas iniciais

```txt
Prospecção
Qualificação
Visita técnica agendada
Visita técnica realizada
Fazer orçamento
Orçamento feito
Proposta enviada
Em negociação
Assembleia / aprovação
Fechado
Acompanhar futuro
Perdido
```

Essas colunas seguem o modelo de CRM kanban que você descreveu no escopo inicial. 

### Entregas

```txt
Cadastrar colunas padrão por unidade
Exibir colunas no CRM
Permitir ordenar colunas
Permitir ativar/desativar colunas
```

### Critério de aceite

O CRM deve carregar as colunas padrão e permitir visualizar os cards dentro delas.

---

## Tarefa 2.3 — Criar tela CRM Kanban

### Entregas

```txt
Tela principal do CRM
Visualização em kanban
Filtros
Busca
Botão novo cliente
Cards de oportunidades
```

### Filtros

```txt
Unidade
Vendedor
Tipo de cliente
Produto
Temperatura
Cidade
Status
Período
```

### Critério de aceite

O usuário deve conseguir visualizar oportunidades no kanban e filtrar os dados.

---

## Tarefa 2.4 — Criar cadastro rápido de cliente

### Campos obrigatórios

```txt
Nome do cliente
Tipo de cliente
Unidade
Cidade
Estado
Responsável principal
Telefone / WhatsApp
Produto de interesse
Vendedor responsável
Origem do lead
```

### Critério de aceite

O vendedor deve conseguir criar um cliente rapidamente e o card deve aparecer no kanban.

---

## Tarefa 2.5 — Criar ficha completa do cliente

### Abas

```txt
Resumo
Dados gerais
Contatos
Comercial
Produtos / Escopo
Orçamento
Financiamento
Comissão
Agenda
Arquivos
Histórico
```

### Critério de aceite

Ao clicar em um card, o usuário deve abrir a ficha completa do cliente.

---

## Tarefa 2.6 — Criar aba Dados gerais

### Campos

```txt
Nome do cliente
Tipo de cliente
Unidade responsável
CNPJ / CPF
Razão social
Nome fantasia
CEP
Endereço
Bairro
Cidade
Estado
Origem do lead
Vendedor responsável
Observações
```

### Tipos de cliente

```txt
Condomínio residencial
Condomínio comercial
Empresa privada
Escola
Comércio
Órgão público
Associação
Pessoa física
Outro
```

### Critério de aceite

O sistema deve aceitar condomínios e outros tipos de clientes.

---

## Tarefa 2.7 — Criar aba Contatos

### Campos

```txt
Nome
Cargo / função
Tipo de contato
Telefone
WhatsApp
E-mail
Contato principal
Observações
```

### Tipos de contato

```txt
Síndico
Subsíndico
Administradora
Financeiro
Técnico
Compras
Morador representante
Responsável da empresa
Outro
```

A Sombrear trabalha com síndicos, administradoras, moradores, assembleias e comunicação ativa com o condomínio, então vários contatos por cliente são necessários. 

### Critério de aceite

O usuário deve conseguir adicionar vários contatos a um mesmo cliente.

---

## Tarefa 2.8 — Criar aba Comercial

### Campos

```txt
Número de unidades
Número de blocos
Número de vagas
Área aproximada
Valor estimado
Valor por vaga
Valor por unidade/morador
Previsão de fechamento
Probabilidade
Temperatura
Principal necessidade
Principal objeção
Concorrente
Observações comerciais
```

### Critério de aceite

As informações comerciais devem alimentar o resumo do card e o dashboard.

---

## Tarefa 2.9 — Criar aba Produtos / Escopo

### Produtos iniciais

```txt
Sombrite garagem
Sombrite parquinho
Sombrite piscina
Sombrite área de lazer
Telha galvalume
Telha termoacústica / isotérmica
Carport solar
Manutenção preventiva
Manutenção corretiva
Produto personalizado
```

O portfólio operacional da Sombrear inclui sombrite, telha galvalume, telha isotérmica, carport solar e manutenção preventiva/corretiva. 

### Campos

```txt
Tipo de produto
Quantidade de vagas
Área em m²
Valor unitário
Valor total
Local de instalação
Tipo de solo
Tipo de fixação
Inclui iluminação
Inclui calha
Inclui rufo
Inclui bicicletário
Inclui projeto
Inclui ART
Observações técnicas
```

### Critério de aceite

Uma oportunidade deve permitir vários produtos e somar os valores.

---

## Tarefa 2.10 — Criar movimentação do kanban

### Entregas

```txt
Arrastar card entre colunas
Atualizar status da oportunidade
Registrar histórico automático
Atualizar data de última movimentação
```

### Critério de aceite

Ao mover um card, o sistema deve salvar a nova etapa e registrar no histórico.

---

## Tarefa 2.11 — Criar histórico do CRM

### Eventos automáticos

```txt
Cliente criado
Cliente editado
Card movido
Contato adicionado
Produto adicionado
Valor alterado
Proposta gerada
Agenda criada
Oportunidade fechada
Oportunidade perdida
```

### Critério de aceite

A aba Histórico deve exibir uma linha do tempo com as principais ações.

---

# Sprint 3 — Propostas, financiamento e comissão

## Objetivo

Permitir que o vendedor monte orçamento, gere proposta simplificada, simule financiamento e calcule comissão.

No seu escopo, o gerador de propostas deve calcular comissão e ajudar o vendedor a levar uma proposta ao condomínio durante a prospecção. 

---

## Tarefa 3.1 — Criar estrutura de orçamento

### Entregas

```txt
Tabela propostas
Tabela proposta_itens
Tela de orçamento dentro do cliente
Cálculo de valor bruto
Desconto
Valor final
Forma de pagamento
Validade
```

### Critério de aceite

O sistema deve somar produtos e gerar um orçamento com valor final.

---

## Tarefa 3.2 — Criar proposta simplificada

### Estrutura da proposta

```txt
Logo Sombrear
Cliente
Unidade
Vendedor
Produto / escopo
Quantidade
Valor total
Condição de pagamento
Validade
Observações
Contato
```

### Critério de aceite

O usuário deve conseguir gerar uma proposta visual a partir do orçamento.

---

## Tarefa 3.3 — Criar status da proposta

### Status

```txt
Rascunho
Gerada
Enviada
Em análise
Aprovada
Recusada
Vencida
Cancelada
```

### Critério de aceite

O usuário deve conseguir mudar o status da proposta.

---

## Tarefa 3.4 — Gerar PDF simples da proposta

### Entregas

```txt
Botão gerar PDF
Layout básico com identidade Sombrear
Salvar PDF vinculado à proposta
```

### Critério de aceite

O usuário deve conseguir baixar ou visualizar um PDF simples da proposta.

---

## Tarefa 3.5 — Criar simulação de financiamento

### Campos

```txt
Valor total
Entrada
Valor financiado
Número de unidades
Número de vagas
Número de parcelas
Taxa mensal
Tipo de financiamento
Valor por unidade
Valor por vaga
Observações
```

### Critério de aceite

O sistema deve calcular valor por unidade/morador e valor por vaga.

---

## Tarefa 3.6 — Enviar financiamento para proposta

### Entregas

```txt
Selecionar simulação
Exibir resultado na proposta
Salvar vínculo entre proposta e simulação
```

### Critério de aceite

A proposta deve conseguir exibir o valor estimado por unidade/morador.

---

## Tarefa 3.7 — Criar cálculo de comissão

### Campos

```txt
Vendedor
Valor base
Percentual
Valor da comissão
Status
Data prevista de pagamento
Data de pagamento
Observações
```

### Status

```txt
Prevista
Aprovada
A pagar
Paga parcialmente
Paga
Cancelada
```

### Critério de aceite

O sistema deve calcular comissão automaticamente com base no valor final da proposta.

---

## Tarefa 3.8 — Criar permissões de comissão

### Regras

```txt
Vendedor visualiza a própria comissão
Gestor pode aprovar
Financeiro pode marcar como paga
Proprietário pode editar tudo
```

### Critério de aceite

Usuários sem permissão não podem alterar percentual ou status financeiro da comissão.

---

## Tarefa 3.9 — Criar agenda comercial

### Tipos de evento

```txt
Ligação
WhatsApp
Reunião
Visita técnica
Envio de proposta
Retorno comercial
Assembleia
Plantão de dúvidas
Assinatura de contrato
Outro
```

A atuação da Sombrear inclui visita técnica, apoio em assembleias, apresentação, plantão de dúvidas e contratação. 

### Critério de aceite

A próxima ação deve aparecer no card do CRM.

---

# Sprint 4 — Obras e painel público

## Objetivo

Transformar cliente fechado em obra e criar o painel público para síndico/moradores.

O painel visual do condomínio deve mostrar status da obra, comunicados, diários e relatório simplificado, conforme seu escopo inicial. 

---

## Tarefa 4.1 — Criar ação “Marcar como fechado”

### Entregas

```txt
Botão Marcar como fechado
Confirmação antes de gerar obra
Atualizar status da oportunidade
Registrar data de fechamento
Registrar histórico
```

### Critério de aceite

O sistema deve permitir fechar uma oportunidade e preparar geração da obra.

---

## Tarefa 4.2 — Gerar obra automaticamente

### Dados copiados

```txt
Cliente
Unidade
Endereço
Produtos vendidos
Valor contratado
Vendedor
Proposta aprovada
Arquivos vinculados
```

### Critério de aceite

Ao gerar obra, ela deve aparecer no módulo Produção / Execução.

---

## Tarefa 4.3 — Criar etapas padrão da obra

### Etapas resumidas do MVP

```txt
Contrato
Plantão / financiamento
Fabricação
Canteiro
Fundações
Instalação
Retoques
Entrega
Finalizada
```

### Observação

No futuro, essas etapas podem ser detalhadas nas 15 fases operacionais previstas no escopo do painel visual do condomínio. 

### Critério de aceite

Toda obra criada deve receber etapas padrão automaticamente.

---

## Tarefa 4.4 — Criar tela Produção / Execução

### Entregas

```txt
Listagem de obras
Filtros por unidade
Filtros por status
Filtros por responsável
Cards de obra
Resumo de obras ativas
```

### Critério de aceite

A engenharia deve conseguir visualizar as obras em andamento.

---

## Tarefa 4.5 — Criar ficha da obra

### Abas

```txt
Resumo
Etapas
Checklist
Diário de obra
Fotos
Comunicados
Painel público
Arquivos
Histórico
```

### Critério de aceite

Ao abrir uma obra, o usuário deve ver seus dados, etapas e painel público.

---

## Tarefa 4.6 — Atualizar etapa da obra

### Entregas

```txt
Mudar etapa atual
Marcar etapa como concluída
Registrar data
Registrar responsável
Registrar histórico
Definir se etapa aparece no painel público
```

### Critério de aceite

Ao atualizar a etapa interna, o painel público deve refletir a nova fase se ela estiver liberada.

---

## Tarefa 4.7 — Criar diário de obra simples

### Campos

```txt
Data
Equipe presente
Clima
Atividades realizadas
Pendências
Próximos passos
Visível no painel público
```

### Critério de aceite

A engenharia deve conseguir registrar diário e decidir se aparece no painel público.

---

## Tarefa 4.8 — Criar comunicados da obra

### Tipos

```txt
Início de obra
Remoção de veículos
Interdição de área
Ruído
Poeira
Mudança de etapa
Retorno da equipe
Entrega
Geral
```

A comunicação ativa com moradores é um diferencial da Sombrear, incluindo comunicados, materiais prontos para WhatsApp e informações durante a obra. 

### Critério de aceite

O usuário deve criar comunicado e publicar no painel público quando desejar.

---

## Tarefa 4.9 — Criar upload de fotos da obra

### Visibilidades

```txt
Interno
Liberado para cliente
Liberado no painel público
```

### Critério de aceite

Apenas fotos marcadas como públicas devem aparecer no painel do condomínio.

---

## Tarefa 4.10 — Criar token público da obra

### Entregas

```txt
Gerar token único
Ativar token
Desativar token
Gerar novo token
Copiar link público
Registrar total de acessos
```

### Critério de aceite

Cada obra deve ter um link público único e controlado pela Sombrear.

---

## Tarefa 4.11 — Criar painel público do condomínio

### Exibir

```txt
Logo Sombrear
Nome da obra
Status atual
Progresso
Etapas liberadas
Comunicados públicos
Diários públicos
Fotos autorizadas
Contato da Sombrear
```

### Não exibir

```txt
Comissão
Custos internos
Margem
Financeiro interno
Observações internas
Pendências sensíveis
Arquivos privados
```

### Critério de aceite

Um síndico ou morador deve conseguir acessar o painel por link sem login e ver apenas as informações liberadas.

---

# Sprint 5 — Ajustes, testes e preparação para uso interno

## Objetivo

Refinar o MVP para uso real dentro da Sombrear.

---

## Tarefa 5.1 — Revisar identidade visual

### Entregas

```txt
Ajustar cores
Ajustar espaçamentos
Ajustar botões
Ajustar cards
Ajustar responsividade
Melhorar telas principais
```

### Critério de aceite

O sistema deve parecer profissional e coerente com a marca Sombrear.

---

## Tarefa 5.2 — Testar permissões

### Cenários

```txt
Proprietário acessando todas as unidades
Gestor acessando unidade própria
Vendedor vendo seus clientes
Engenharia vendo obras
Financeiro vendo comissões
Usuário sem permissão tentando acessar módulo restrito
```

### Critério de aceite

Usuários não devem acessar dados indevidos.

---

## Tarefa 5.3 — Testar fluxo comercial completo

### Fluxo

```txt
Criar cliente
Mover no kanban
Adicionar contato
Adicionar produto
Gerar orçamento
Gerar proposta
Simular financiamento
Calcular comissão
Agendar assembleia
Marcar como fechado
Gerar obra
```

### Critério de aceite

O fluxo deve funcionar sem travar e sem perder dados.

---

## Tarefa 5.4 — Testar fluxo da obra

### Fluxo

```txt
Abrir obra
Atualizar etapa
Criar diário
Criar comunicado
Enviar foto
Marcar visibilidade pública
Ver painel público
```

### Critério de aceite

Tudo que for marcado como público deve aparecer corretamente no painel do condomínio.

---

## Tarefa 5.5 — Testar painel público

### Cenários

```txt
Token válido
Token desativado
Token inexistente
Obra sem comunicados
Obra com fotos públicas
Obra com fotos internas
```

### Critério de aceite

Painel público deve ser seguro e não exibir dados internos.

---

## Tarefa 5.6 — Criar dados de exemplo

### Exemplos

```txt
Unidade: Sombrear DF
Unidade: Sombrear GO
Cliente: Residencial Rio Negro
Cliente: Condomínio Ipê Amarelo
Cliente: Greenport
Produto: Sombrite garagem
Produto: Telha galvalume
Produto: Sombrite parquinho
Obra: Rio Negro
```

### Critério de aceite

O sistema deve ter dados fictícios para apresentação e teste.

---

## Tarefa 5.7 — Criar tela “em construção” para módulos futuros

### Módulos

```txt
Pedidos
Calculadora de Materiais
Financeiro completo
Relatórios avançados
Dashboard TV completo
```

### Critério de aceite

Os módulos aparecem no Ecosistema, mas mostram que serão liberados em fase futura.

---

# Resumo das entregas por sprint

## Sprint 1 — Base

```txt
Projeto base
Identidade visual
Supabase
Login
Unidades
Usuários
Permissões
Layout interno
Dashboard Ecosistema
```

## Sprint 2 — CRM

```txt
Kanban
Cadastro de cliente
Contatos
Dados comerciais
Produtos / escopo
Histórico
Movimentação de cards
Filtros
Busca
```

## Sprint 3 — Comercial avançado

```txt
Orçamento
Proposta simplificada
PDF simples
Financiamento
Comissão
Agenda
Status de proposta
```

## Sprint 4 — Obra e painel público

```txt
Fechar oportunidade
Gerar obra
Etapas da obra
Produção simples
Diário
Comunicados
Fotos
Token público
Painel do condomínio
```

## Sprint 5 — Testes e preparação

```txt
Ajustes visuais
Testes de permissão
Testes de fluxo completo
Dados de exemplo
Telas em construção
Preparação para uso interno
```

# Priorização final

A prioridade absoluta é esta:

```txt
1. Login + unidades + usuários
2. Dashboard Ecosistema
3. CRM Kanban
4. Ficha do cliente
5. Produtos e orçamento
6. Proposta + financiamento + comissão
7. Gerar obra
8. Painel público por token
```

Com isso, o MVP já entrega valor real para a Sombrear.

O próximo passo é montar a **estrutura do banco de dados em SQL para Supabase**, com as primeiras tabelas do MVP.
