(function () {
  'use strict';

  window.RD = window.RD || {};
  const RD = window.RD;
  RD.services = RD.services || {};

  // A Project URL e a anon key NÃO ficam neste arquivo — elas vêm de
  // config/env.js (ver config/env.example.js e services/README.md para
  // como configurar e por que esse arquivo também é versionado).
  function obterConfiguracaoAmbiente() {
    return (window.RD && window.RD.env) || {};
  }

  // Nome da tabela criada em supabase/schema.sql — centralizado aqui para
  // que os módulos que forem usar o Supabase (Fase 2 em diante) não
  // precisem repetir essa string.
  const TABELA_NAO_CONFORMIDADES = 'nao_conformidades';

  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  let clientePromise = null;

  // Carrega o SDK do Supabase via CDN sob demanda. Enquanto nenhum outro
  // módulo chamar getClient(), nenhuma requisição relacionada ao Supabase
  // é feita — este arquivo pode ficar presente no projeto sem nenhum
  // efeito no funcionamento atual do app.
  function carregarSdk() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(
        'Não foi possível carregar a biblioteca do Supabase. Verifique a conexão com a internet.'
      ));
      document.head.appendChild(script);
    });
  }

  // Retorna uma Promise para uma instância única (singleton) do cliente
  // Supabase, já configurada com a URL e a anon key de config/env.js.
  function getClient() {
    const env = obterConfiguracaoAmbiente();
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      return Promise.reject(new Error(
        'Configuração do Supabase ausente: copie config/env.example.js para ' +
        'config/env.js e preencha SUPABASE_URL e SUPABASE_ANON_KEY.'
      ));
    }
    if (!clientePromise) {
      clientePromise = carregarSdk().then(() => window.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));
    }
    return clientePromise;
  }

  // Converte o "registro" coletado pelo formulário (ver
  // modules/formHandler.js) para o formato de linha esperado pela tabela
  // nao_conformidades (ver supabase/schema.sql). Campos que a interface
  // ainda não coleta (setor, foto_url) ficam de fora — o banco já os
  // aceita como nulos. "id", "criado_em", "atualizado_em" e
  // "origem_registro" também ficam de fora de propósito: são preenchidos
  // automaticamente pelo banco (ver comentários do schema.sql).
  function mapearRegistroParaLinha(registro) {
    const [dia, mes, ano] = registro.data.split('/');
    return {
      data_ocorrencia: ano + '-' + mes + '-' + dia,
      hora_ocorrencia: registro.hora,
      lider: registro.lider,
      turno: registro.turno,
      of: registro.of,
      peca: registro.peca,
      processo: registro.processo,
      descricao: registro.descricao,
      comentario: registro.comentario ? registro.comentario : null
    };
  }

  // Salva um registro na tabela nao_conformidades. Resolve em caso de
  // sucesso; rejeita com um Error (mensagem amigável) em caso de falha —
  // seja de configuração, de conexão, ou retornada pelo próprio Supabase
  // (ex.: violação de uma constraint).
  function salvarRegistro(registro) {
    return getClient().then((client) => {
      return client.from(TABELA_NAO_CONFORMIDADES).insert(mapearRegistroParaLinha(registro));
    }).then((resposta) => {
      if (resposta.error) {
        throw new Error(resposta.error.message || 'Não foi possível salvar o registro no banco de dados.');
      }
    });
  }

  RD.services.supabase = {
    getClient: getClient,
    salvarRegistro: salvarRegistro,
    TABELA_NAO_CONFORMIDADES: TABELA_NAO_CONFORMIDADES
  };

})();
