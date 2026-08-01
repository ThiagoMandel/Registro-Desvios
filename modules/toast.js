(function () {
  'use strict';

  const RD = window.RD;

  let toastTimeoutId = null;

  function mostrarToast(titulo, mensagem, tipo) {
    RD.dom.toastTitulo.textContent = titulo;
    RD.dom.toastMensagem.textContent = mensagem;
    RD.dom.toast.classList.toggle('toast--erro', tipo === 'erro');
    RD.dom.toastIcone.innerHTML = tipo === 'erro' ? RD.config.ICONE_ERRO : RD.config.ICONE_SUCESSO;

    RD.dom.toast.classList.add('is-visible');

    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      RD.dom.toast.classList.remove('is-visible');
    }, RD.config.TOAST_DURACAO_MS);
  }

  RD.toast = { mostrar: mostrarToast };

})();
