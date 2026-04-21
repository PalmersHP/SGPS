Atue como um Desenvolvedor Front-end Sênior e Engenheiro de Software. 
Sua tarefa é desenvolver um aplicativo web (Single Page Application - SPA) em HTML, CSS e JavaScript puro (Vanilla JS), focado no cálculo de materiais para coberturas de sombreamento (Sombrite) e geração de relatórios em PDF. O aplicativo é de uso interno da "Sombrear Estruturas Inteligentes".

OBJETIVO DO APP:
O usuário (Engenheiro) inserirá dados básicos de uma obra (quantidade de vagas, módulos, alinhamentos) e o app deverá calcular automaticamente a quantidade exata de insumos (tubos em barras de 6m, chapas, rolos de tela, parafusos), calcular o custo estimado e gerar um relatório profissional em PDF para impressão.

1. IDENTIDADE VISUAL E UI/UX (Obrigatório)
O visual deve ser limpo, técnico, moderno e transmitir credibilidade de engenharia.
- Cores da Marca: 
  - Verde Principal: #9ACD32
  - Verde Secundário: #6FAE2E
  - Cinza Principal (Textos): #5A5A5A
  - Fundo Geral: Branco (#FFFFFF) e Cinza Claro (#F3F3F3) para caixas de destaque.
- Tipografia: 'Poppins' para títulos e destaques; 'Calibri' ou 'Arial' para o corpo do texto e tabelas.
- Estrutura: Uma única página dividida em seções claras (Cards). 
- Responsividade: Deve funcionar bem no desktop.

2. ESTRUTURA DA PÁGINA (Interface)
A interface deve conter as seguintes seções na mesma tela:

A. Cabeçalho: Logo da Sombrear (use um placeholder de imagem <img src="logo.png" alt="Sombrear">), título "Calculadora de Insumos - Sombrite" e CNPJ da empresa no rodapé.
B. Dados do Responsável:
   - Nome de quem está preenchendo.
   - Função na empresa.
C. Dados do Projeto (Inputs Principais):
   - Nome do Condomínio.
   - Tipo de Fundação (Select: Fundação Direta ou Pé com Chapa).
   - Fator de Redução de Tela (Select: 0%, 5%, 10%, 15%, 20%) - Para aproveitamento de sobras.
D. Dimensionamento (Inputs Numéricos):
   - Quantidade total de vagas.
   - Quantidade de Alinhamentos (Sequências). Se o usuário não souber, deve haver um checkbox "Sem parâmetro" (neste caso, considere 1 alinhamento para cada 4 módulos como padrão).
   - Qtd de Módulos 2V MA.
   - Qtd de Módulos 3V MA.
   - Qtd de Módulos 2V MT.
   - Qtd de Módulos 3V MT.
   (Nota visual: Adicione um botão "Sugerir Distribuição" que pega a Qtd Total de Vagas, divide por 2.5 para achar o total de módulos, e distribui 20% para 2V e 80% para 3V).
E. Banco de Insumos e Custos (Editável):
   - Uma tabela onde o usuário pode ver os insumos listados na regra de negócio.
   - Deve permitir adicionar novos itens, excluir e editar o Preço Unitário de cada um.
F. Resultados e Geração de Relatório:
   - Resumo em tela das quantidades calculadas.
   - Custo total estimado.
   - Botão grande e chamativo: "Gerar Relatório Técnico (PDF)".

3. REGRAS DE NEGÓCIO E CÁLCULOS (Lógica de Engenharia)
Considere:
- Vaga padrão: 5m x 2,5m = 12,5 m².
- 1 Módulo Padrão (2V ou 3V) = 2 Pés, 2 Braços, 4 Arcos, 2 Estrelas.
- Lógica de Alinhamento: Módulos consecutivos economizam Pés e Braços. A regra é: Total de Pés = Total de Módulos + Total de Alinhamentos. Total de Braços = Total de Módulos + Total de Alinhamentos.
- Tubos são vendidos em barras de 6 metros. (Sempre arredondar o resultado final de barras para cima, usando Math.ceil).

FÓRMULAS DE MATERIAIS (Lógica de Extração):
Crie as funções JS aplicando as seguintes fórmulas para extrair os quantitativos:

# PÉS (Fundação Direta)
- Tubo 4"#11 = (3 * Qtd de Pés) / 6
- Tubo 2"#14 = (3.3 * Qtd de Pés) / 6
- Bandeja = 1 unidade por Pé
- Cantoneira 20cm = (0.2 * Qtd de Pés) / 6

# PÉS (Com Chapa)
- Usa a mesma fórmula do Pé Fundação Direta, adicionando:
- Chapa 300x250 #14 = 1 unidade por Pé

# PÉ MT (Duplo)
- Dobra a quantidade do Tubo de 2"#14 e da Cantoneira em relação ao Pé MA.
- Tubo 4"#11 = (3 * Qtd de Braços MT) / 6
- Tubo 2 1/2" #14 = (6.6 * Qtd de Braços MT) / 6

# BRAÇOS (MA e MT)
- Tubo 2 1/2" #14 = 1 barra por Braço
- Tubo 1 3/4" #16 = (2 * Qtd de Braços) / 6
- Cantoneira = (0.6 * Qtd de Braços) / 6

# ARCOS
- Arco 3V: Tubo 1 3/4" #12 = (16 * Qtd Módulos 3V) / 6
- Arco 2V: Tubo 1 3/4" #12 = (8 * Qtd Módulos 2V) / 6

# ESTRELAS
- Estrela 3V: 
  - Tubo 2"#14 = (1.5 * Qtd Módulos 3V * 2) / 6
  - Ferro chato 2 1/4" = (0.4 * Qtd Módulos 3V * 2) / 6
- Estrela 2V:
  - Tubo 2"#14 = (3.0 * Qtd Módulos 2V * 2) / 6
  - Ferro chato 2 1/4" = (0.4 * Qtd Módulos 2V * 2) / 6

# TELA (Sombrites) - Aplique o fator de redução (%) escolhido pelo usuário na metragem final antes de dividir pelo rolo.
- Tela 3V = ((7.8 * Qtd Módulos 3V) * (1 - fator_reducao)) / 50 -> Qtd de Rolos
- Tela 2V = ((5.2 * Qtd Módulos 2V) * (1 - fator_reducao)) / 50 -> Qtd de Rolos

# FERRAGENS (Parafusos e Porcas) - Multiplicar pela Qtd Total de Módulos:
- Parafuso 1/2" x 1 1/2" = 20 por módulo
- Porca Travante 1/2" x 2 1/4" = 8 por módulo
- Porca Polida 1/2" = 8 por módulo
- Parafuso 1/2" x 4" = 1 por módulo
- Parafuso 1/2" x 2 1/4" = 3 por módulo
- Porca 1/2" = 3 por módulo

4. GERAÇÃO DO RELATÓRIO PDF (Use a biblioteca html2pdf.js ou jsPDF + autoTable)
O PDF gerado deve ter padrão corporativo de alto nível:
- Cabeçalho: Logo à esquerda, "MEMORIAL DE CÁLCULO DE MATERIAIS" em verde (#9ACD32) à direita. Uma linha verde fina separando o cabeçalho.
- Data e Hora de emissão geradas automaticamente.
- Seção 1: Dados do Projeto (Condomínio, Vagas, Tipo de Fundação, Responsável).
- Seção 2: Resumo Estrutural (Quantidade de Módulos, Pés, Braços).
- Seção 3: Lista de Materiais para Compra (Tabela limpa com Item, Unidade de Medida, Quantidade e Custo Estimado). Use linhas com fundo cinza claro alternado.
- Rodapé: Campo de assinatura centralizado com uma linha superior, contendo o Nome e Função do responsável que preencheu o relatório.

Entregue o código completo (HTML contendo CSS e JS integrados no mesmo arquivo para facilitar a execução) e pronto para ser aberto diretamente em qualquer navegador. Adicione comentários explicando as lógicas matemáticas.

Recomendações Técnicas para o Uso:

Acesso Simplificado: Como o prompt instrui a criação de tudo em um único arquivo (HTML + CSS + JS), basta você salvar o código gerado em um bloco de notas com o final .html (ex: calculadora_sombrear.html) e abrir em qualquer navegador (Chrome, Edge) no seu computador. Não requer instalação de servidores.

Personalização da Logo: Quando o arquivo estiver pronto, coloque a imagem Logo Sombrear.png (que você já possui) na mesma pasta do arquivo HTML e renomeie-a para logo.png para que ela apareça no cabeçalho.

Proteção da Planilha de Custos: Como os preços variam frequentemente, a exigência do "banco de insumos editável" na tela evitará que você precise mexer no código-fonte do sistema toda vez que o preço do aço ou da tela mudar.