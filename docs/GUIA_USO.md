# Guia de uso — Registro NC

Sistema para líderes de produção registrarem, de forma rápida e
padronizada, não conformidades encontradas durante a fabricação — pelo celular ou
computador — gerando automaticamente um PDF do registro. Pensado para
levar **menos de um minuto** por registro.

## Passo a passo

1. **Identificação** — data e hora são preenchidas automaticamente.
   Informe seu nome e selecione o turno (1º ou 2º).
2. **Ordem de fabricação** — informe a OF e a peça. A combinação
   "OF + Peça" aparece automaticamente destacada em azul, como
   conferência visual antes de continuar.
3. **Processo e descrição da não conformidade** — selecione em qual etapa da
   produção a não conformidade foi identificada, e descreva livremente o que foi
   encontrado no campo de descrição — este é o campo principal do
   formulário, então capriche nos detalhes: o quê, onde e como
   identificou o problema.
4. **Evidência** — opcionalmente, tire uma foto ou selecione uma
   imagem já existente. Uma prévia aparece imediatamente; é possível
   trocar ou remover a foto antes de enviar.
5. **Comentário ao operador** — registre a orientação dada (ex: parar a
   produção, refazer a peça, encaminhar para retrabalho).
6. Clique em **Registrar não conformidade**. O sistema valida os campos
   obrigatórios (destacados com **\***) e, se tudo estiver certo, salva o
   registro no banco de dados e, em seguida, gera e baixa automaticamente
   um PDF do registro.

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
  `Registro_NC_OF255660_PPÇ1.pdf`.
- Folha A4 em **orientação paisagem**, sempre com **uma única página**:
  os dados do registro ficam na coluna esquerda e a foto de evidência
  ocupa a coluna direita, em alta qualidade.
- **Requer conexão com a internet no momento do clique em "Registrar
  não conformidade"** — o registro precisa ser salvo no banco de dados, e a
  biblioteca que monta o PDF é carregada de um serviço externo (CDN).
  Sem internet nesse momento, o sistema avisa com uma mensagem clara e
  **não perde os dados já preenchidos** — é só tentar novamente ao
  recuperar a conexão. Se o registro já tiver sido salvo com sucesso mas
  o PDF não puder ser gerado, o sistema também avisa — nesse caso, o
  registro já está seguro no banco de dados.

## Onde os dados ficam salvos
Cada registro é salvo no banco de dados (Supabase, projeto "Registro
NC") no momento do envio — esse passa a ser o histórico oficial das
não conformidades. O PDF baixado continua sendo gerado normalmente a cada envio,
como um documento local do registro; guarde os PDFs em uma pasta
compartilhada da empresa se quiser manter cópias além do banco de dados.

## Compatibilidade
Testado em Chrome e Edge, em computador e Android. Funciona sem
instalação — basta abrir o `index.html` em um navegador.
