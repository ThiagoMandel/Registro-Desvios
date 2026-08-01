-- ============================================================================
-- Registro NC — Balteau / Grupo WEG
-- Schema do banco de dados (Supabase / PostgreSQL)
--
-- Projeto Supabase: "Registro NC"
-- Fase 1 do plano de evolução (docs/ARQUITETURA.md): cria apenas a
-- infraestrutura de banco. O formulário AINDA NÃO grava aqui — isso é a
-- Fase 2.
--
-- Onde executar: painel do Supabase → seu projeto "Registro NC" →
-- "SQL Editor" (menu lateral) → "New query" → cole este arquivo inteiro →
-- "Run". Seguro rodar mais de uma vez, inclusive se você já tiver rodado
-- qualquer versão anterior deste script (v1 ou v2): o bloco 2b traz todo o
-- histórico de migração necessário, sem perder dados existentes.
-- ============================================================================

-- 1. Extensões ---------------------------------------------------------------
-- gen_random_uuid() já é nativo a partir do Postgres 13, mas mantemos o
-- pgcrypto por segurança/compatibilidade — é o que o Supabase já usa.
create extension if not exists pgcrypto;

-- 2a. Tabela principal (instalação nova) ---------------------------------------
-- "of" é escrito entre aspas duplas porque OF é uma palavra reservada em
-- alguns contextos do SQL (ex.: "CREATE TABLE ... OF tipo") — as aspas
-- eliminam qualquer ambiguidade, tanto aqui quanto em todo o resto deste
-- script.
create table if not exists public.nao_conformidades (
  id               uuid primary key default gen_random_uuid(),

  -- Auditoria / controle interno
  criado_em        timestamptz not null default now(),   -- preenchido pelo banco; o código de inserção nunca deve enviar valor para esta coluna
  atualizado_em    timestamptz not null default now(),   -- atualizado automaticamente pelo trigger da seção 4
  origem_registro  text not null default 'Aplicativo',   -- de onde o registro foi criado: 'Aplicativo', 'Desktop', ou o nome de uma futura integração

  -- Identificação (seção "Identificação" do formulário)
  -- data_ocorrencia / hora_ocorrencia = quando a não conformidade ACONTECEU (o que o
  -- líder informa no formulário). Isso é intencionalmente separado de
  -- criado_em, que é quando o REGISTRO foi salvo no banco — os dois raramente
  -- coincidem exatamente e servem a propósitos diferentes de auditoria.
  data_ocorrencia  date not null,
  hora_ocorrencia  time not null,
  lider            text not null check (char_length(trim(lider)) > 0),
  turno            text not null check (turno in ('1º Turno', '2º Turno')),
  setor            text check (setor is null or char_length(trim(setor)) > 0),  -- área da empresa (ex.: "Alta Tensão", "Média Tensão"); nulo até o formulário coletar esse dado

  -- Ordem de fabricação
  "of"             text not null check (char_length(trim("of")) > 0),
  peca             text not null check (char_length(trim(peca)) > 0),

  -- Processo e descrição da não conformidade
  -- "processo" e "setor" não têm CHECK de valores fixos de propósito: são
  -- listas que crescem (o <select> de processos já tem 15 opções hoje, e
  -- novas áreas da empresa podem ser adicionadas a qualquer momento).
  -- Duplicar essas listas aqui viraria uma segunda fonte de verdade para
  -- manter sincronizada. Se um dia isso incomodar, a evolução natural é
  -- normalizar para tabelas `processos` / `setores` à parte.
  processo         text not null check (char_length(trim(processo)) > 0),
  descricao        text not null check (char_length(descricao) <= 600),
  comentario       text check (comentario is null or char_length(comentario) <= 600),

  -- Evidência fotográfica (Fase 2 — Supabase Storage).
  -- Guarda só o caminho do arquivo no bucket, nunca a imagem em si.
  foto_url         text,

  -- Espaço livre (JSON) para atributos futuros sem exigir migração de schema.
  metadata         jsonb not null default '{}'::jsonb
);

-- 2b. Migração de quem já rodou uma versão anterior deste script ----------------
-- Instalação nova: os comandos abaixo não têm efeito (a tabela já sai
-- correta do create table acima). Quem já tinha a tabela (de qualquer
-- versão anterior, v1 ou v2): isto aplica todo o histórico de mudanças sem
-- perder os dados existentes.

-- v1 → v2: adicionar origem_registro/setor, remover status (mantido aqui
-- para quem for migrar direto de v1 para v3, pulando v2).
alter table public.nao_conformidades add column if not exists origem_registro text not null default 'Aplicativo';
alter table public.nao_conformidades add column if not exists setor text;
drop index if exists idx_nc_status;
alter table public.nao_conformidades drop column if exists status;

-- v2 → v3 (esta revisão): remover deletado_em (não haverá exclusão lógica
-- nesta fase — o Registro NC é um sistema de rastreabilidade), remover
-- usuario_id (fora do escopo atual; volta a ser avaliado na Fase 5, quando
-- a autenticação existir) e renomear numero_of → "of".
drop index if exists idx_nc_ativos_recentes;      -- dependia de deletado_em
alter table public.nao_conformidades drop column if exists deletado_em;
drop index if exists idx_nc_usuario_id;
alter table public.nao_conformidades drop column if exists usuario_id;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'nao_conformidades' and column_name = 'numero_of'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'nao_conformidades' and column_name = 'of'
  ) then
    alter table public.nao_conformidades rename column numero_of to "of";
  end if;
end $$;
drop index if exists idx_nc_numero_of;

comment on table public.nao_conformidades is
  'Registros de não conformidade de produção, preenchidos pelo formulário do chão de fábrica. Sistema de rastreabilidade: apenas registrar e armazenar ocorrências para consulta e análise posterior (sem workflow/status, sem exclusão lógica).';
comment on column public.nao_conformidades.origem_registro is
  'De onde o registro foi criado: "Aplicativo", "Desktop" ou o nome de uma futura integração. Sem CHECK fixo para não exigir migração a cada nova origem.';
comment on column public.nao_conformidades.setor is
  'Área da empresa onde a não conformidade ocorreu (ex.: "Alta Tensão", "Média Tensão"). Nulo porque o formulário atual ainda não coleta esse dado — precisa ser adicionado à interface antes da Fase 2 popular esta coluna.';
comment on column public.nao_conformidades.foto_url is
  'Caminho do arquivo no Supabase Storage (bucket ainda a criar na Fase 2). Nulo quando não há evidência anexada.';
comment on column public.nao_conformidades.metadata is
  'Campo livre reservado para atributos futuros sem exigir alteração de schema.';

-- 3. Índices -------------------------------------------------------------------
create index if not exists idx_nc_criado_em      on public.nao_conformidades (criado_em desc);
create index if not exists idx_nc_of             on public.nao_conformidades ("of");
create index if not exists idx_nc_processo       on public.nao_conformidades (processo);
create index if not exists idx_nc_turno          on public.nao_conformidades (turno);
create index if not exists idx_nc_setor          on public.nao_conformidades (setor);
-- Sem índice em "origem_registro": poucos valores possíveis e baixo valor
-- de filtro isolado (diferente de processo/turno/setor, que são os eixos
-- de análise esperados para consulta futura).
-- Sem índice parcial de "registros ativos": não existe mais soft delete —
-- idx_nc_criado_em já cobre sozinho a consulta "mais recentes primeiro".

-- 4. Atualização automática de "atualizado_em" ----------------------------------
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists trg_nc_atualizado_em on public.nao_conformidades;
create trigger trg_nc_atualizado_em
  before update on public.nao_conformidades
  for each row
  execute function public.set_atualizado_em();

-- 5. Row Level Security ---------------------------------------------------------
alter table public.nao_conformidades enable row level security;

-- Leitura: restrita a "authenticated". "anon" (a chave pública usada pelo
-- app hoje, sem login) NÃO tem política de SELECT — ou seja, com RLS
-- habilitado e nenhuma política de leitura para esse papel, a resposta é
-- sempre "nenhuma linha", mesmo que alguém tente consultar a tabela
-- diretamente com a anon key. Isso evita a leitura ampla dos registros por
-- usuários anônimos, e já deixa o caminho pronto para a Fase 5: quando a
-- autenticação existir, os usuários logados passam a enxergar todos os
-- registros automaticamente, sem precisar tocar nesta política. Como não
-- há mais soft delete nem dono do registro (usuario_id foi removido), a
-- condição de leitura é simplesmente "true" — qualquer usuário autenticado
-- vê todos os registros, coerente com o objetivo de rastreabilidade.
--
-- Importante: isso restringe apenas o acesso público via API (a mesma que
-- o formulário usa). Consultas feitas por você diretamente no painel do
-- Supabase (SQL Editor / Table Editor) continuam funcionando normalmente —
-- elas usam uma conexão com privilégio de administrador, que ignora o RLS.
drop policy if exists "Leitura publica de registros ativos" on public.nao_conformidades;
drop policy if exists "Leitura autenticada de registros ativos" on public.nao_conformidades;
drop policy if exists "Leitura autenticada de registros" on public.nao_conformidades;
create policy "Leitura autenticada de registros"
  on public.nao_conformidades
  for select
  to authenticated
  using (true);

-- Inserção: liberada para "anon" e "authenticated", pois o formulário do
-- chão de fábrica (Fase 2) ainda não terá login.
drop policy if exists "Insercao publica de novos registros" on public.nao_conformidades;
create policy "Insercao publica de novos registros"
  on public.nao_conformidades
  for insert
  to anon, authenticated
  with check (true);

-- Atualização e exclusão: nenhuma política criada agora. Com RLS
-- habilitado e sem política de UPDATE/DELETE, "anon" e "authenticated"
-- não conseguem alterar nem apagar nenhum registro — coerente com o
-- Registro NC ser um sistema de rastreabilidade (registrar e armazenar
-- para consulta e análise posterior, sem edição e sem exclusão, nem
-- mesmo lógica).

-- 6. Permissões de tabela --------------------------------------------------------
-- RLS decide QUAIS linhas cada papel enxerga; o GRANT abaixo autoriza QUE
-- COMANDOS cada papel pode tentar executar na tabela. "anon" só recebe
-- INSERT (nunca SELECT) — mesmo em caso de erro futuro na política de
-- RLS, a ausência do GRANT de SELECT já bloqueia a leitura por esse papel.
--
-- O revoke abaixo é necessário para quem já rodou a versão v1 deste script
-- (que concedia SELECT a "anon"): GRANT é aditivo no Postgres, então só
-- rodar os grants novos não removeria essa permissão antiga. É seguro
-- rodar mesmo em uma instalação nova, onde o grant nunca existiu.
revoke select on public.nao_conformidades from anon;

grant insert on public.nao_conformidades to anon;
grant select, insert on public.nao_conformidades to authenticated;
