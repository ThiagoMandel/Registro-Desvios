(function () {
  'use strict';

  const RD = window.RD;

  function atualizarOfPeca() {
    const of = RD.dom.campoOF.value.trim();
    const peca = RD.dom.campoPeca.value.trim();

    if (of && peca) {
      RD.dom.ofPecaTexto.textContent = 'OF ' + of + '  •  Peça ' + peca;
      RD.dom.ofPecaDisplay.classList.add('is-filled');
    } else {
      RD.dom.ofPecaTexto.textContent = 'Preencha a OF e a peça para visualizar';
      RD.dom.ofPecaDisplay.classList.remove('is-filled');
    }
  }

  RD.dom.campoOF.addEventListener('input', atualizarOfPeca);
  RD.dom.campoPeca.addEventListener('input', atualizarOfPeca);

  RD.ofPeca = { atualizar: atualizarOfPeca };

  // Estado inicial (equivalente à chamada única feita ao final do script.js original)
  RD.ofPeca.atualizar();

})();
