# Guia de uso — Registro de Desvios de Produção

Sistema para líderes de produção registrarem, de forma rápida e
padronizada, desvios encontrados durante a fabricação — pelo celular ou
computador — gerando automaticamente um PDF do registro. Pensado para
levar **menos de um minuto** por registro.

## Passo a passo

1. **Identificação** — data e hora são preenchidas automaticamente.
   Informe seu nome e selecione o turno (1º ou 2º).
2. **Ordem de fabricação** — informe a OF e a peça. A combinação
   "OF + Peça" aparece automaticamente destacada em azul, como
   conferência visual antes de continuar.
3. **Processo e descrição do desvio** — selecione em qual etapa da
   produção o desvio foi identificado, e descreva livremente o que foi
   encontrado no campo de descrição — este é o campo principal do
   formulário, então capriche nos detalhes: o quê, onde e como
   identificou o problema.
4. **Evidência** — opcionalmente, tire uma foto ou selecione uma
   imagem já existente. Uma prévia aparece imediatamente; é possível
   trocar ou remover a foto antes de enviar.
5. **Comentário ao operador** — registre a orientação dada (ex: parar a
   produção, refazer a peça, encaminhar para retrabalho).
6. Clique em **Registrar desvio**. O sistema valida os campos
   obrigatórios (destacados com **\***) e, se tudo estiver certo, gera e
   baixa automaticamente um PDF do registro.

Se algum campo obrigatório não for preenchido, o sistema destaca o
primeiro campo com problema, rola a tela até ele e mostra uma mensagem
explicando o que falta.

## Botão "Limpar formulário"
Reinicia todos os campos. Como essa ação não pode ser desfeita, o
sistema sempre pede uma confirmação antes de apagar os dados.

## Sobre o PDF gerado
- É baixado automaticamente pelo navegador (verifique a pasta
  Downloads do celular ou computador).
- O nome do arquivo é gerado a partir da OF e da peça, por exemplo:
  `Registro_Desvio_OF255660_PPÇ1.pdf`.
- Folha A4 em **orientação paisagem**, sempre com **uma única página**:
  os dados do registro ficam na coluna esquerda e a foto de evidência
  ocupa a coluna direita, em alta qualidade.
- **Requer conexão com a internet no momento do clique em "Registrar
  desvio"** — a biblioteca que monta o PDF é carregada de um serviço
  externo (CDN). Sem internet nesse momento, o sistema avisa com uma
  mensagem clara e **não perde os dados já preenchidos** — é só tentar
  novamente ao recuperar a conexão.

## Onde os dados ficam salvos
Esta versão **não usa banco de dados**. Os dados existem apenas durante
o preenchimento, no navegador; ao gerar o PDF, esse é o único registro
que persiste. Guarde os PDFs gerados em uma pasta compartilhada da
empresa para manter o histórico.

## Compatibilidade
Testado em Chrome e Edge, em computador e Android. Funciona sem
instalação — basta abrir o `index.html` em um navegador.
