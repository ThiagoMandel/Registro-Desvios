(function () {
  'use strict';

  const RD = window.RD;

  function formatarData(date) {
    return date.toLocaleDateString('pt-BR');
  }

  function formatarHora(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function atualizarDataHora() {
    const agora = new Date();
    RD.dom.campoData.value = formatarData(agora);
    RD.dom.campoHora.value = formatarHora(agora);
  }

  atualizarDataHora();
  setInterval(atualizarDataHora, 30000);

  RD.datetime = { atualizar: atualizarDataHora };

})();
