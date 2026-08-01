# services/

Camada de integração com serviços externos — hoje, o Supabase.

## Arquivo presente

| Arquivo | Conteúdo |
|---|---|
| `supabase.js` | `RD.services.supabase.getClient()` (cliente Supabase, carregado sob demanda) e `RD.services.supabase.salvarRegistro(registro)` (grava um registro na tabela `nao_conformidades`). |

## Situação atual (Fase 2 implementada)

`modules/formHandler.js` chama `RD.services.supabase.salvarRegistro(registro)`
**antes** de gerar o PDF, com três desfechos possíveis:

1. **Salvamento falha** (configuração ausente, sem internet, erro do
   banco): nada foi persistido. O formulário permanece preenchido, o PDF
   não é gerado, e um toast explica o problema — o usuário pode tentar
   de novo sem perder nada.
2. **Salvamento funciona, PDF falha**: o registro já está seguro no
   banco (reenviá-lo criaria uma linha duplicada), então o formulário
   **não** é limpo ainda — em vez disso, o botão "Registrar não conformidade" vira
   "Tentar gerar PDF novamente". Um novo clique tenta gerar o PDF outra
   vez a partir dos mesmos dados já salvos, **sem** chamar
   `salvarRegistro()` de novo. Só quando o PDF sai com sucesso (ou o
   usuário clica em "Limpar formulário") esse estado é encerrado.
3. **Os dois funcionam**: PDF baixado, toast de sucesso, formulário
   limpo — fluxo de sempre.

Para este serviço funcionar de verdade, é preciso:
1. Ter executado [`../supabase/schema.sql`](../supabase/schema.sql) no
   projeto Supabase.
2. Ter criado `config/env.js` (copiando `config/env.example.js`) com a
   Project URL e a anon key reais do projeto "Registro NC" — ver
   "Configuração de credenciais" abaixo.

Sem isso, `salvarRegistro()` rejeita imediatamente com uma mensagem
clara ("Configuração do Supabase ausente...") — o app não trava, mas
nenhum registro é salvo até a configuração ser preenchida.

## Configuração de credenciais (`config/env.js`)

A Project URL e a anon key do Supabase vêm de `config/env.js`, que é
carregado como um `<script>` normal em `index.html` (antes de
`services/supabase.js`).

- `config/env.example.js` — modelo com os dois campos vazios e
  instruções em comentário. Serve para configurar um clone local do zero.
- `config/env.js` — arquivo real, com os valores preenchidos.

**Os dois arquivos são versionados** (enviados ao GitHub). Isso mudou em
relação à primeira versão desta configuração: originalmente
`config/env.js` era propositalmente deixado de fora do repositório
(`.gitignore`), pensando em um fluxo de desenvolvimento local. Só que o
site é publicado via **GitHub Pages** — puramente estático, direto a
partir do conteúdo do repositório, sem nenhuma etapa de build/deploy que
pudesse gerar ou injetar esse arquivo depois. Deixar `config/env.js` fora
do Git significava que ele nunca existia no site publicado, e o
salvamento no Supabase falhava sempre em produção. Por isso ele passou a
ser versionado como qualquer outro arquivo do projeto.

Isso continua seguro porque a anon key do Supabase é uma chave pública
por design — ela sempre é enviada, dentro do próprio JavaScript, a todo
visitante do site publicado, esteja o arquivo que a contém versionado ou
não; não existe versão "secreta" dela num app cliente puro como este. A
proteção real dos dados é o Row Level Security, já configurado em
`supabase/schema.sql`: o papel `anon` só pode inserir registros, nunca
lê-los. A única credencial que precisa permanecer secreta é a
`service_role key`, que este projeto nunca usa e nunca deve usar em
código que roda no navegador.

Essa abordagem (arquivo de config separado carregado como `<script>`, em
vez de `fetch()` de um `.env`) segue sendo necessária pelo motivo já
documentado em [`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md): o
projeto também precisa continuar abrindo via `file://` (duplo clique), e
`fetch()` é bloqueado nesse protocolo — um `<script>` clássico não tem
essa restrição.

## Mapeamento de campos

`salvarRegistro()` converte o objeto `registro` (produzido por
`coletarRegistro()` em `modules/formHandler.js`) para o formato da
tabela. `id`, `criado_em`, `atualizado_em` e `origem_registro` não são
enviados — o banco os preenche sozinho. `setor` e `foto_url` também não
são enviados: a interface atual não coleta setor, e o upload de fotos
para o Storage é a próxima fase (ver
[`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md)) — até lá, essas
colunas ficam nulas.

## Próximo passo

O upload de fotos para o Supabase Storage deve seguir o mesmo padrão,
como uma função exposta por este mesmo arquivo ou por um novo
`services/storage.js`, mantendo `modules/formHandler.js` sem conhecer os
detalhes de como os dados são persistidos.
