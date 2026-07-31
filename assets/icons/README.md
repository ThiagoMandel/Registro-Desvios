# assets/icons/

Reservada para os **ícones do sistema** — diferente de `assets/logo/`,
que guarda a marca da empresa, esta pasta é para ícones de interface e de
instalação do app.

## O que colocar aqui

| Arquivo esperado | Tamanho | Uso |
|---|---|---|
| `favicon.ico` ou `favicon.png` | 32×32 ou 48×48 | Ícone da aba do navegador |
| `icon-192.png` | 192×192 | Ícone do PWA (já referenciado em `manifest.json`) |
| `icon-512.png` | 512×512 | Ícone do PWA em telas de alta resolução (já referenciado em `manifest.json`) |
| `apple-touch-icon.png` | 180×180 | Ícone ao adicionar à tela inicial no iOS |

## Como ativar depois de adicionar os arquivos
O `manifest.json` já aponta para `icon-192.png` e `icon-512.png` — assim
que esses arquivos existirem aqui, nenhuma alteração no manifest é
necessária.

Para o favicon e o ícone de iOS, adicione no `<head>` do `index.html`:

```html
<link rel="icon" href="assets/icons/favicon.png">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
```

Os ícones internos da interface (formulário, botões etc.) **não** ficam
aqui — eles são SVGs escritos diretamente no `index.html`, para carregar
instantaneamente sem depender de arquivos externos.
