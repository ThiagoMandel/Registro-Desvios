(function () {
  'use strict';

  const RD = window.RD;

  function ligarContador(campo, contadorEl) {
    const max = campo.getAttribute('maxlength');
    const atualizar = () => {
      contadorEl.textContent = campo.value.length + '/' + max;
    };
    campo.addEventListener('input', atualizar);
    atualizar();
  }

  ligarContador(RD.dom.campoDescricao, RD.dom.contadorDescricao);
  ligarContador(RD.dom.campoComentario, RD.dom.contadorComentario);

  RD.charCounter = { ligar: ligarContador };

})();
