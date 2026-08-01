(function () {
  'use strict';

  // Referências centralizadas de todos os elementos do DOM usados pelos
  // demais módulos. Deve ser o primeiro <script> carregado após a config.
  window.RD = window.RD || {};
  const RD = window.RD;

  RD.dom = {
    form: document.getElementById('formNaoConformidade'),

    campoData: document.getElementById('campoData'),
    campoHora: document.getElementById('campoHora'),
    campoLider: document.getElementById('campoLider'),

    campoOF: document.getElementById('campoOF'),
    campoPeca: document.getElementById('campoPeca'),
    ofPecaDisplay: document.getElementById('ofPecaDisplay'),
    ofPecaTexto: document.getElementById('ofPecaTexto'),

    campoProcesso: document.getElementById('campoProcesso'),
    campoDescricao: document.getElementById('campoDescricao'),
    contadorDescricao: document.getElementById('contadorDescricao'),

    campoEvidencia: document.getElementById('campoEvidencia'),
    previewWrapper: document.getElementById('previewWrapper'),
    previewImg: document.getElementById('previewImg'),
    previewFileName: document.getElementById('previewFileName'),
    btnRemoverImagem: document.getElementById('btnRemoverImagem'),

    campoComentario: document.getElementById('campoComentario'),
    contadorComentario: document.getElementById('contadorComentario'),

    btnRegistrar: document.getElementById('btnRegistrar'),
    btnRegistrarTexto: document.getElementById('btnRegistrarTexto'),
    btnLimpar: document.getElementById('btnLimpar'),

    toast: document.getElementById('toast'),
    toastIcone: document.getElementById('toastIcone'),
    toastTitulo: document.getElementById('toastTitulo'),
    toastMensagem: document.getElementById('toastMensagem'),
    contadorSessaoValor: document.getElementById('contadorSessaoValor'),
  };

})();
