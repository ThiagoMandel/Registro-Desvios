(function () {
  'use strict';

  const RD = window.RD;

  function marcarErro(elementoField) {
    elementoField.classList.add('is-invalid');
  }

  function limparErro(elementoField) {
    elementoField.classList.remove('is-invalid');
  }

  function validarCampoTexto(campo) {
    const wrapper = campo.closest('.field');
    const valido = campo.value.trim().length > 0;
    valido ? limparErro(wrapper) : marcarErro(wrapper);
    return valido;
  }

  function validarSelect(campo) {
    const wrapper = campo.closest('.field');
    const valido = campo.value.trim().length > 0;
    valido ? limparErro(wrapper) : marcarErro(wrapper);
    return valido;
  }

  function validarTurno() {
    const wrapper = document.getElementById('fieldTurno');
    const marcado = RD.dom.form.querySelector('input[name="turno"]:checked');
    const valido = !!marcado;
    valido ? limparErro(wrapper) : marcarErro(wrapper);
    return valido;
  }

  function validarFormulario() {
    let valido = true;

    if (!validarCampoTexto(RD.dom.campoLider)) valido = false;
    if (!validarTurno()) valido = false;
    if (!validarCampoTexto(RD.dom.campoOF)) valido = false;
    if (!validarCampoTexto(RD.dom.campoPeca)) valido = false;
    if (!validarSelect(RD.dom.campoProcesso)) valido = false;
    if (!validarCampoTexto(RD.dom.campoDescricao)) valido = false;

    return valido;
  }

  RD.validation = {
    marcarErro: marcarErro,
    limparErro: limparErro,
    validarCampoTexto: validarCampoTexto,
    validarSelect: validarSelect,
    validarTurno: validarTurno,
    validarFormulario: validarFormulario
  };

})();
