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

A Project URL e a anon key do Supabase **não ficam em nenhum arquivo
versionado**. Elas vêm de `config/env.js`, que é carregado como um
`<script>` normal em `index.html` (antes de `services/supabase.js`) e
está listado no `.gitignore` da raiz do projeto — ou seja, nunca é
enviado ao GitHub.

- **Versionado**: `config/env.example.js` — modelo com os dois campos
  vazios e instruções em comentário.
- **Não versionado**: `config/env.js` — arquivo real, com os valores
  preenchidos, que cada pessoa/ambiente cria localmente a partir do
  exemplo. Sem ele (ou com os campos vazios), o app continua abrindo
  normalmente; só o salvamento no Supabase fica indisponível, com o
  aviso claro descrito acima.

Essa abordagem (arquivo de config separado + `.gitignore`, em vez de
`fetch()` de um `.env`) foi escolhida porque este projeto precisa
continuar abrindo via `file://` (duplo clique) — e `fetch()` é bloqueado
nesse protocolo, exatamente como já documentado para a logo em
[`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md). Um `<script>`
clássico não tem essa restrição.

Importante: isso mantém a anon key fora do repositório, não fora do
navegador — como qualquer chave pública de cliente, ela continua visível
a quem inspecionar o site publicado. A proteção real dos dados é o Row
Level Security, já configurado em `supabase/schema.sql`.

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
