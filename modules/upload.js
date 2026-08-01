(function () {
  'use strict';

  const RD = window.RD;

  function esconderPreview() {
    RD.dom.previewWrapper.hidden = true;
    RD.dom.previewImg.src = '';
    RD.dom.previewFileName.textContent = '';
  }

  RD.dom.campoEvidencia.addEventListener('change', () => {
    const arquivo = RD.dom.campoEvidencia.files && RD.dom.campoEvidencia.files[0];

    if (!arquivo) {
      esconderPreview();
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      RD.toast.mostrar('Arquivo inválido', 'Selecione um arquivo de imagem (JPG ou PNG).', 'erro');
      RD.dom.campoEvidencia.value = '';
      esconderPreview();
      return;
    }

    const tamanhoMB = arquivo.size / (1024 * 1024);
    if (tamanhoMB > RD.config.TAMANHO_MAXIMO_MB) {
      RD.toast.mostrar('Imagem muito grande', 'Selecione uma imagem de até ' + RD.config.TAMANHO_MAXIMO_MB + ' MB.', 'erro');
      RD.dom.campoEvidencia.value = '';
      esconderPreview();
      return;
    }

    const leitor = new FileReader();
    leitor.onload = (evento) => {
      RD.dom.previewImg.src = evento.target.result;
      RD.dom.previewFileName.textContent = arquivo.name;
      RD.dom.previewWrapper.hidden = false;
    };
    leitor.readAsDataURL(arquivo);
  });

  RD.dom.btnRemoverImagem.addEventListener('click', () => {
    RD.dom.campoEvidencia.value = '';
    esconderPreview();
  });

  RD.upload = { esconderPreview: esconderPreview };

})();
