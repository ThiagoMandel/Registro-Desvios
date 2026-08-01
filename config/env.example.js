// MODELO de configuração de ambiente — este arquivo É versionado.
//
// Para configurar o projeto localmente:
//   1. Copie este arquivo para "env.js", na mesma pasta (config/env.js).
//   2. Preencha os dois valores abaixo com os dados reais do projeto
//      Supabase ("Registro NC"): painel do Supabase → Project Settings → API.
//        SUPABASE_URL       → campo "Project URL"
//        SUPABASE_ANON_KEY  → campo "anon" "public", em "Project API keys"
//   3. Não renomeie as propriedades — services/supabase.js espera
//      exatamente RD.env.SUPABASE_URL e RD.env.SUPABASE_ANON_KEY.
//
// "config/env.js" (o arquivo real, com os valores preenchidos) TAMBÉM é
// versionado e enviado ao GitHub — o site é publicado via GitHub Pages,
// puramente estático, sem nenhuma etapa de build/deploy que poderia
// injetar esse arquivo depois. Sem ele no repositório, o site publicado
// nunca teria as credenciais e o salvamento no Supabase falharia sempre.
//
// Nota sobre segurança: a "anon key" do Supabase é uma chave pública por
// design — ela é enviada, dentro do próprio JavaScript, a todo visitante
// do site publicado, esteja ela num arquivo versionado ou não. A proteção
// real dos dados é o Row Level Security, configurado em
// supabase/schema.sql (leitura bloqueada para o papel "anon"; só
// inserção é permitida). NUNCA coloque aqui a "service_role key" — essa
// sim é secreta e nunca deve existir em código que roda no navegador.
(function () {
  'use strict';

  window.RD = window.RD || {};
  const RD = window.RD;

  RD.env = {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: ''
  };

})();
