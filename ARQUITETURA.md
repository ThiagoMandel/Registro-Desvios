# Arquitetura e decisões técnicas

Documento voltado a quem for **dar manutenção ou evoluir** o projeto.
Para instruções de uso, veja [GUIA_USO.md](./GUIA_USO.md).

## Stack

HTML, CSS e JavaScript puros — **sem frameworks, sem build step, sem
dependências de desenvolvimento**. A única dependência externa é a
biblioteca [jsPDF](https://github.com/parallax/jsPDF) (via CDN), usada
apenas para montar o PDF no momento do envio do formulário.

Essa escolha foi deliberada: qualquer pessoa com conhecimento básico de
HTML/CSS/JS consegue abrir e entender o projeto inteiro sem precisar
instalar `node_modules`, rodar `npm install` ou entender um bundler.

## Estrutura dos três arquivos principais

```
index.html   → estrutura e conteúdo (semântico, sem estilo inline)
style.css    → toda a aparência (nenhum estilo dentro do HTML ou JS)
script.js    → toda a lógica (nenhum HTML ou CSS gerado via JS, exceto
               o necessário para montar o PDF e alternar classes)
```

Os três arquivos precisam estar **na mesma pasta** — `index.html`
referencia os outros dois por caminho relativo (`style.css`,
`script.js`). Se um deles for movido ou renomeado isoladamente, os
caminhos quebram.

### `index.html`
Um único formulário (`#formDesvio`), dividido em seções (`<section
class="card">`), cada uma com um `<h2>` e um ícone SVG inline no
cabeçalho. Todo ícone do sistema é SVG escrito diretamente no HTML —
isso é proposital (ver nota de compatibilidade abaixo).

### `style.css`
Organizado em 15 blocos numerados (tokens, reset, cabeçalho, layout,
cards, campos, etc. — veja o índice no topo do próprio arquivo). Usa
variáveis CSS (`:root { --primary: ...; }`) para centralizar cores,
espaçamento e tamanhos — trocar a paleta de cores do projeto todo
significa editar apenas a seção de tokens no topo.

### `script.js`
Uma única IIFE `(function () { ... })()` para não vazar variáveis
globais. Dividido por comentários de seção: referências a elementos,
data/hora automática, exibição "OF + Peça", validação, upload de
evidência, geração de PDF, e o handler de envio do formulário.

## Nota de compatibilidade: por que não há gradientes nem `mask-image`

Uma versão anterior deste projeto apresentou blocos pretos sólidos ao
ser aberta em determinados navegadores Android — causado pelo modo
escuro automático ("Force Dark") do Chrome/Edge para Android, que tenta
reinterpretar as cores de páginas sem esquema de cor declarado, e é
conhecido por renderizar `linear-gradient()` incorretamente.

Duas decisões no código atual existem especificamente por causa disso:

1. `index.html` declara `<meta name="color-scheme" content="light">` e
   `style.css` reforça com `color-scheme: light` no `:root` — isso
   impede o navegador de tentar "adivinhar" as cores da página.
2. Nenhum background usa `linear-gradient()` — todas as cores são
   sólidas. Os ícones de erro de validação também **não** usam
   `mask-image` (suporte inconsistente em navegadores Android mais
   antigos) — são SVGs inline comuns.

Ao adicionar novos estilos, **evite gradientes em elementos de fundo**
e prefira sempre SVG inline a técnicas de CSS mais recentes para
ícones, para manter a compatibilidade ampla que o projeto já validou.

## Geração de PDF

Toda a lógica de PDF está em `script.js`, na seção "Geração de PDF
(jsPDF)". O documento é desenhado manualmente, coordenada por
coordenada (em milímetros, já que o jsPDF é inicializado com `unit:
'mm', format: 'a4', orientation: 'landscape'`), sem usar nenhum
template pronto. As cores usadas no PDF (`PDF_CORES`) replicam
manualmente os mesmos tokens de cor do `style.css`, para que o
documento gerado combine visualmente com o sistema.

### Layout: paisagem, 2 colunas, sempre 1 página

O PDF é sempre uma única página, em A4 paisagem (297×210mm), dividida
em duas colunas dentro de `gerarPDF()`:

- **Coluna esquerda (60%)** — Data, Hora, Líder, Turno, OF, Peça,
  Processo, Descrição do desvio e Comentário ao operador.
- **Coluna direita (40%)** — a foto da ocorrência, redimensionada para
  caber inteira na coluna preservando a proporção (nunca distorce).

Diferente da versão anterior (retrato, com quebra de página quando o
conteúdo não cabia), este layout **nunca chama `doc.addPage()`** — a
garantia de página única vem da forma como o espaço é calculado, não de
uma verificação feita depois de desenhar:

- Os quatro campos fixos do topo (Data/Hora, Líder/Turno, OF/Peça,
  Processo) sempre ocupam a mesma altura (`alturaLinha = 12mm` cada).
- O espaço que sobra é dividido em duas fatias **fixas**: 62% para a
  Descrição do desvio, 38% para o Comentário ao operador.
- Cada fatia é preenchida pela função `paragrafoAjustado()`, que testa
  tamanhos de fonte decrescentes (de 9pt até 6pt) até o texto caber
  dentro da fatia — em vez de estourar a página, o texto fica um pouco
  menor. Com o limite de 600 caracteres já existente em cada campo,
  simulamos o pior caso (600 caracteres nos dois campos) com métricas
  reais de fonte e confirmamos que cabe confortavelmente até no maior
  tamanho de fonte (9pt) — a redução de fonte é uma salvaguarda extra,
  não algo que deveria disparar em uso normal.
- A foto (`inserirFotoColuna()`) é sempre encaixada dentro de uma caixa
  de tamanho fixo (a coluna direita inteira), com a mesma lógica de
  "conter preservando proporção" — por isso nunca cria uma segunda
  página nem estica a imagem.

Se um novo campo de texto livre for adicionado no futuro, siga o mesmo
padrão: reserve uma fatia fixa de altura e use `paragrafoAjustado()`
para desenhar dentro dela, em vez de deixar o conteúdo "empurrar" o que
vem depois.

### Logo da WEG no PDF

O cabeçalho do PDF (`desenharCabecalho`) desenha a logo da WEG dentro de
um "selo" branco arredondado no canto superior esquerdo — necessário
porque a logo é azul e, sem um fundo claro atrás dela, desapareceria
sobre a faixa azul do cabeçalho.

A logo **não** é carregada de `assets/logo/logo_weg.png` em tempo de
execução — os mesmos bytes estão embutidos como uma string base64
(constante `LOGO_WEG_BASE64`) diretamente no início da seção de PDF em
`script.js`. Isso foi uma decisão deliberada, não redundância acidental:

Testamos que, ao abrir o sistema via `file://` (duplo clique, sem
servidor), o Chrome bloqueia tanto `fetch('assets/logo/logo_weg.png')`
quanto o uso de `<canvas>` para ler de volta uma imagem local carregada
via `<img>` — ambos lançam erro de segurança (`SecurityError` /
`TypeError: Failed to fetch`), pois cada arquivo `file://` é tratado
como uma origem isolada. Embutir os bytes como constante evita esse
problema por completo, e funciona de forma idêntica em qualquer forma
de abertura do sistema (arquivo local, servidor local, ou publicado).

Se a logo precisar ser trocada no futuro, siga os passos em
[`../assets/logo/README.md`](../assets/logo/README.md).

Ideias de evolução para essa parte estão documentadas em
[`../pdf/README.md`](../pdf/README.md).

## Preparação para PWA

O `manifest.json` na raiz já contém os metadados básicos (nome, cores,
ícones) e já está referenciado no `<head>` do `index.html`. **Não há
service worker implementado** — ou seja, o site não funciona offline
nem é instalável ainda. Para completar essa evolução:

1. Adicionar os arquivos de ícone reais em `assets/icons/` (veja o
   README dentro dessa pasta para os tamanhos esperados).
2. Criar um arquivo `service-worker.js` e registrá-lo em `script.js`
   com `navigator.serviceWorker.register(...)`.
3. Definir uma estratégia de cache (ex: cache-first para os arquivos
   estáticos) para permitir uso offline.

## Como estender o formulário

Para adicionar um novo campo:

1. Adicione o HTML dentro da seção (`.card`) apropriada em
   `index.html`, seguindo o padrão `.field` já usado pelos outros
   campos (label + input + span de erro).
2. Se for obrigatório, adicione a validação correspondente na função
   `validarFormulario()` em `script.js`.
3. Inclua o novo campo em `coletarRegistro()` para que ele passe a
   fazer parte dos dados coletados.
4. Se o campo deve aparecer no PDF, adicione uma chamada equivalente às
   já existentes (`linhaCampos` para campos curtos, ou `paragrafoAjustado`
   para texto livre) dentro de `gerarPDF()` — lembrando de reservar uma
   fatia de altura fixa para ele, para manter a garantia de página única
   (veja a explicação em "Layout: paisagem, 2 colunas, sempre 1 página"
   acima).

## O que este projeto **não** tem (por decisão, não por esquecimento)

- Sem banco de dados / persistência entre sessões.
- Sem dashboard ou relatórrios agregados.
- Sem autenticação de usuário.
- Sem testes automatizados no repositório (o projeto foi validado
  manualmente durante o desenvolvimento, mas não há suíte de testes
  incluída).

Essas são possíveis próximas fases, não bugs do estado atual.
