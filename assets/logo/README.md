# assets/logo/

Logo oficial da **WEG** (marca-mãe da Balteau), já em uso no sistema.

## Arquivo presente

| Arquivo | Origem | Uso |
|---|---|---|
| `logo_weg.png` | Rasterizado a partir do vetor original enviado pela empresa (1600×1120px, fundo transparente) | Exibido no topo da página (`index.html`) |

## Onde este arquivo é referenciado

- **Na página** (`index.html`): `<img src="assets/logo/logo_weg.png">`, dentro do
  bloco `.brand-logo`, centralizado acima do cabeçalho azul. O tamanho de
  exibição (150px de largura, altura automática) é controlado inteiramente
  pelo CSS (`.brand-logo__img` em `style.css`) — o arquivo em si está em
  resolução mais alta (1600px) de propósito, para continuar nítido em telas
  de alta densidade de pixels (Retina/celulares modernos).

- **No PDF gerado** (`script.js`): **não** é lido deste arquivo em tempo de
  execução. Os mesmos bytes estão embutidos como uma constante
  (`LOGO_WEG_BASE64`) diretamente no `script.js`. Isso é proposital — veja a
  explicação completa em
  [`../../docs/ARQUITETURA.md`](../../docs/ARQUITETURA.md#logo-da-weg-no-pdf).

## Se o arquivo de logo precisar ser trocado no futuro

1. Substitua `logo_weg.png` por um arquivo novo (mantenha o nome, ou
   atualize a referência em `index.html`).
2. Gere uma nova constante base64 para o PDF e substitua `LOGO_WEG_BASE64`
   em `script.js` — e ajuste `PROPORCAO_LOGO_WEG` se a proporção
   largura/altura do novo logo for diferente.
3. Prefira sempre partir de um arquivo vetorial (SVG) de alta qualidade e
   rasterizar em resolução alta (1200px+ de largura), para evitar
   pixelização tanto na tela quanto no PDF.
