# supabase/

Scripts SQL do banco de dados do projeto Supabase **"Registro NC"** —
Fase 1 do plano de evolução descrito em
[`../docs/ARQUITETURA.md`](../docs/ARQUITETURA.md).

## Arquivo presente

| Arquivo | Conteúdo |
|---|---|
| `schema.sql` | Script completo: tabela `nao_conformidades`, índices, trigger de `atualizado_em`, Row Level Security e políticas de acesso. |

## Como executar

1. Acesse [supabase.com](https://supabase.com) e abra o projeto **Registro NC**.
2. No menu lateral, clique em **SQL Editor**.
3. Clique em **New query**.
4. Cole o conteúdo inteiro de `schema.sql`.
5. Clique em **Run**.

O script é idempotente — pode ser executado mais de uma vez sem causar
erro ou duplicar dados (usa `if not exists` / `or replace` / `drop ...
if exists` em tudo), inclusive se você já tinha rodado uma versão
anterior: ele adiciona as colunas novas e remove as descontinuadas sem
apagar os dados já existentes. Se o schema precisar mudar depois que já
houver dados reais em produção, escreva um script de migração dedicado
em vez de reexecutar este arquivo inteiro.

## Situação atual (Fase 2 implementada)

O formulário (`modules/formHandler.js`, via `services/supabase.js`) já
grava cada registro nesta tabela **antes** de gerar o PDF. O PDF
continua sendo gerado e baixado normalmente — o banco passou a ser a
fonte de dados principal, e o PDF continua existindo como documento
local de cada registro.

## Sobre a Row Level Security

O script habilita RLS e libera **apenas inserção** para o papel `anon`
(o mesmo usado pela chave pública/anon key do projeto) — o formulário do
chão de fábrica ainda não terá login quando a Fase 2 for implementada,
então ele precisa conseguir criar novos registros sem autenticação.
`anon` **não** tem política nem permissão de leitura: a partir do
momento em que a Fase 2 conectar o app a este banco, ninguém consegue
ler os registros através da anon key — só é possível inserir. A leitura
fica reservada ao papel `authenticated`, hoje sem uso (não existe login
ainda), já pronta para a Fase 5.

Isso não impede você de consultar e analisar os dados agora: o SQL
Editor e o Table Editor do Supabase usam uma conexão de administrador
que ignora o RLS, então continuam mostrando todos os registros
normalmente — o RLS restringe apenas o acesso público via API, que é o
caminho usado pelo próprio aplicativo.

Não há política de `UPDATE`/`DELETE` para nenhum papel: nem mesmo um
usuário autenticado consegue alterar ou apagar um registro já enviado —
o Registro NC existe apenas para registrar e armazenar ocorrências.
