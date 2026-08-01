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
// "config/env.js" (o arquivo real, com os valores preenchidos) NÃO deve
// ser enviado ao GitHub — ele já está listado no .gitignore da raiz do
// projeto. Só este arquivo de exemplo é versionado.
//
// Nota sobre segurança: a "anon key" do Supabase é uma chave pública por
// design — ela é enviada, dentro do próprio JavaScript, a todo visitante
// do site publicado. Mantê-la fora do repositório não a torna secreta;
// o objetivo é apenas não deixá-la exposta no histórico do GitHub e
// facilitar trocar/rotacionar a chave sem mexer em código versionado. A
// proteção real dos dados é o Row Level Security, configurado em
// supabase/schema.sql. NUNCA coloque aqui a "service_role key" — essa
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
