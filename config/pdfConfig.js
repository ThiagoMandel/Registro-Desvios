(function () {
  'use strict';

  window.RD = window.RD || {};
  const RD = window.RD;
  RD.config = RD.config || {};

  // Paleta usada na geração do PDF — espelha os tokens de cor do style.css
  // (--primary, --bg-card etc.) para manter a mesma identidade visual
  // entre o app e o documento gerado.
  RD.config.PDF_CORES = {
    primary: [11, 92, 171],
    primaryHover: [8, 74, 140],
    primarySoft: [232, 241, 251],
    textPrimary: [31, 41, 55],
    textSecondary: [87, 100, 122],
    textMuted: [148, 160, 178],
    border: [225, 230, 237]
  };

  // Proporção largura/altura original do vetor da WEG (5991x4192) — usada
  // para redimensionar a logo no PDF sem nunca distorcer.
  RD.config.PROPORCAO_LOGO_WEG = 5991 / 4192;

})();
