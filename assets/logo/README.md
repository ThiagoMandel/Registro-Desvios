# assets/logo/

Logo oficial da **WEG** (marca-mãe da Balteau), já em uso no sistema.

## Arquivo presente

| Arquivo | Origem | Uso |
|---|---|---|
| `logo_weg.png` | Rasterizado a partir do vetor original enviado pela empresa (1600×1120px, fundo transparente) | Arquivo de origem da logo (ver abaixo) |

## Onde este arquivo é referenciado

- **Na página** (`index.html`): atualmente **não** é exibido na página —
  o bloco visual da logo (`.brand-logo`) foi removido. Este arquivo fica
  guardado aqui como origem oficial da marca, caso a exibição na página
  seja reintroduzida no futuro.

- **No PDF gerado**: **não** é lido deste arquivo em tempo de execução.
  Os mesmos bytes estão embutidos como uma constante
  (`RD.config.LOGO_WEG_BASE64`) em `config/pdfLogoBase64.js`. Isso é
  proposital — veja a explicação completa em
  [`../../docs/ARQUITETURA.md`](../../docs/ARQUITETURA.md#logo-da-weg-no-pdf).

## Se o arquivo de logo precisar ser trocado no futuro

1. Substitua `logo_weg.png` por um arquivo novo (mantenha o nome, ou
   atualize as referências a este arquivo).
2. Gere uma nova constante base64 para o PDF e substitua
   `RD.config.LOGO_WEG_BASE64` em `config/pdfLogoBase64.js` — e ajuste
   `RD.config.PROPORCAO_LOGO_WEG` (em `config/pdfConfig.js`) se a
   proporção largura/altura do novo logo for diferente.
3. Prefira sempre partir de um arquivo vetorial (SVG) de alta qualidade e
   rasterizar em resolução alta (1200px+ de largura), para evitar
   pixelização tanto na tela quanto no PDF.
