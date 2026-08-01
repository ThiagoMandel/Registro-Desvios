(function () {
  'use strict';

  window.RD = window.RD || {};
  const RD = window.RD;
  RD.config = RD.config || {};

  // Tamanho máximo aceito para a foto de evidência (MB).
  RD.config.TAMANHO_MAXIMO_MB = 8;

  // Ícones usados no toast de notificação (sucesso / erro).
  RD.config.ICONE_SUCESSO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
  RD.config.ICONE_ERRO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

  // Duração (ms) do toast antes de desaparecer.
  RD.config.TOAST_DURACAO_MS = 4000;

})();
