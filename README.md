# Registro NC — Balteau / Grupo WEG

Sistema para líderes de produção registrarem, de forma rápida e
padronizada, não conformidades encontradas durante a fabricação — gerando
automaticamente um PDF do registro, com foto de evidência opcional.

Para o passo a passo de uso no dia a dia, veja
[docs/GUIA_USO.md](./docs/GUIA_USO.md). Para decisões técnicas e como
estender o projeto, veja [docs/ARQUITETURA.md](./docs/ARQUITETURA.md).

## Como abrir

HTML, CSS e JavaScript puros — **sem build step, sem instalação**.
Basta abrir `index.html` diretamente no navegador (duplo clique) ou
publicá-lo em qualquer servidor estático. É necessária conexão com a
internet no momento de registrar uma não conformidade, pois o registro é salvo no
Supabase e o PDF é gerado com uma biblioteca (jsPDF) carregada via CDN.

Antes de usar pela primeira vez, copie `config/env.example.js` para
`config/env.js` e preencha com as credenciais do projeto Supabase — veja
[services/README.md](./services/README.md). Sem esse passo, o app abre
normalmente, mas o salvamento de registros falha com um aviso claro.
`config/env.js` é versionado (enviado ao GitHub junto com o resto do
projeto) — o site é publicado via GitHub Pages, sem nenhuma etapa de
build/deploy separada que pudesse gerar esse arquivo depois.

## Estrutura do projeto

```
index.html          → estrutura e conteúdo do formulário
style.css           → toda a aparência
manifest.json        → metadados de PWA (preparação futura)

config/              → constantes e configuração
  env.js                 credenciais do Supabase — versionado (publicado no GitHub Pages)
  env.example.js          modelo de env.js para configurar um clone local do zero
  appConfig.js          textos/ícones do toast, tamanho máx. de imagem
  pdfConfig.js           paleta de cores e proporção da logo no PDF
  pdfLogoBase64.js       logo da WEG embutida em base64

services/            → integração com serviços externos
  supabase.js            conexão e salvamento de registros no Supabase

modules/              → lógica da aplicação, um módulo por responsabilidade
  dom.js                 referências centralizadas do DOM
  toast.js                notificações
  datetime.js             data/hora automáticas
  ofPeca.js                exibição "OF + Peça"
  charCounter.js           contadores de caracteres
  upload.js                upload/prévia/remoção da foto de evidência
  validation.js            validação do formulário
  pdfGenerator.js          geração do PDF (jsPDF)
  formHandler.js           valida, salva no Supabase, gera o PDF e reseta o formulário

assets/              → logo, ícones e imagens estáticas
docs/                → documentação de uso e arquitetura
pdf/                 → reservada para futuras evoluções da geração de PDF
```

Todos os módulos são scripts clássicos (`<script defer>`, sem
`type="module"`) que se registram em um único namespace global
`window.RD` — decisão deliberada para manter compatibilidade com a
abertura via `file://` (duplo clique). Detalhes em
[docs/ARQUITETURA.md](./docs/ARQUITETURA.md).

## Sobre este projeto

Cada registro é salvo em um banco de dados (Supabase, projeto "Registro
NC" — ver [supabase/schema.sql](./supabase/schema.sql)) antes de o PDF
ser gerado. Ainda não existem:

- Armazenamento das fotos de evidência (hoje elas só vão para o PDF).
- Autenticação de usuário.
- Dashboard ou relatórios agregados.

Essas são evoluções planejadas, não bugs do estado atual — o
planejamento de próximas fases (armazenamento de fotos, dashboards,
autenticação, PWA, integrações) está documentado em
[docs/ARQUITETURA.md](./docs/ARQUITETURA.md).
