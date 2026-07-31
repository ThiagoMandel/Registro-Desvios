(function () {
  'use strict';

  /* ==========================================================================
     Referências dos elementos
     ========================================================================== */

  const form = document.getElementById('formDesvio');

  const campoData = document.getElementById('campoData');
  const campoHora = document.getElementById('campoHora');
  const campoLider = document.getElementById('campoLider');

  const campoOF = document.getElementById('campoOF');
  const campoPeca = document.getElementById('campoPeca');
  const ofPecaDisplay = document.getElementById('ofPecaDisplay');
  const ofPecaTexto = document.getElementById('ofPecaTexto');

  const campoProcesso = document.getElementById('campoProcesso');
  const campoDescricao = document.getElementById('campoDescricao');
  const contadorDescricao = document.getElementById('contadorDescricao');

  const campoEvidencia = document.getElementById('campoEvidencia');
  const previewWrapper = document.getElementById('previewWrapper');
  const previewImg = document.getElementById('previewImg');
  const previewFileName = document.getElementById('previewFileName');
  const btnRemoverImagem = document.getElementById('btnRemoverImagem');

  const campoComentario = document.getElementById('campoComentario');
  const contadorComentario = document.getElementById('contadorComentario');

  const btnRegistrar = document.getElementById('btnRegistrar');
  const btnRegistrarTexto = document.getElementById('btnRegistrarTexto');
  const btnLimpar = document.getElementById('btnLimpar');

  const toast = document.getElementById('toast');
  const toastIcone = document.getElementById('toastIcone');
  const toastTitulo = document.getElementById('toastTitulo');
  const toastMensagem = document.getElementById('toastMensagem');

  const ICONE_SUCESSO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>';
  const ICONE_ERRO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

  const contadorSessaoValor = document.getElementById('contadorSessaoValor');

  let contadorSessao = 0;
  let toastTimeoutId = null;

  /* ==========================================================================
     Data e hora automáticas
     ========================================================================== */

  function formatarData(date) {
    return date.toLocaleDateString('pt-BR');
  }

  function formatarHora(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function atualizarDataHora() {
    const agora = new Date();
    campoData.value = formatarData(agora);
    campoHora.value = formatarHora(agora);
  }

  atualizarDataHora();
  setInterval(atualizarDataHora, 30000);

  /* ==========================================================================
     Exibição automática OF + Peça
     ========================================================================== */

  function atualizarOfPeca() {
    const of = campoOF.value.trim();
    const peca = campoPeca.value.trim();

    if (of && peca) {
      ofPecaTexto.textContent = 'OF ' + of + '  •  Peça ' + peca;
      ofPecaDisplay.classList.add('is-filled');
    } else {
      ofPecaTexto.textContent = 'Preencha a OF e a peça para visualizar';
      ofPecaDisplay.classList.remove('is-filled');
    }
  }

  campoOF.addEventListener('input', atualizarOfPeca);
  campoPeca.addEventListener('input', atualizarOfPeca);

  /* ==========================================================================
     Contadores de caracteres
     ========================================================================== */

  function ligarContador(campo, contadorEl) {
    const max = campo.getAttribute('maxlength');
    const atualizar = () => {
      contadorEl.textContent = campo.value.length + '/' + max;
    };
    campo.addEventListener('input', atualizar);
    atualizar();
  }

  ligarContador(campoDescricao, contadorDescricao);
  ligarContador(campoComentario, contadorComentario);

  /* ==========================================================================
     Upload e prévia de evidência
     ========================================================================== */

  const TAMANHO_MAXIMO_MB = 8;

  campoEvidencia.addEventListener('change', () => {
    const arquivo = campoEvidencia.files && campoEvidencia.files[0];

    if (!arquivo) {
      esconderPreview();
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      mostrarToast('Arquivo inválido', 'Selecione um arquivo de imagem (JPG ou PNG).', 'erro');
      campoEvidencia.value = '';
      esconderPreview();
      return;
    }

    const tamanhoMB = arquivo.size / (1024 * 1024);
    if (tamanhoMB > TAMANHO_MAXIMO_MB) {
      mostrarToast('Imagem muito grande', 'Selecione uma imagem de até ' + TAMANHO_MAXIMO_MB + ' MB.', 'erro');
      campoEvidencia.value = '';
      esconderPreview();
      return;
    }

    const leitor = new FileReader();
    leitor.onload = (evento) => {
      previewImg.src = evento.target.result;
      previewFileName.textContent = arquivo.name;
      previewWrapper.hidden = false;
    };
    leitor.readAsDataURL(arquivo);
  });

  btnRemoverImagem.addEventListener('click', () => {
    campoEvidencia.value = '';
    esconderPreview();
  });

  function esconderPreview() {
    previewWrapper.hidden = true;
    previewImg.src = '';
    previewFileName.textContent = '';
  }

  /* ==========================================================================
     Validação
     ========================================================================== */

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
    const marcado = form.querySelector('input[name="turno"]:checked');
    const valido = !!marcado;
    valido ? limparErro(wrapper) : marcarErro(wrapper);
    return valido;
  }

  function validarFormulario() {
    let valido = true;

    if (!validarCampoTexto(campoLider)) valido = false;
    if (!validarTurno()) valido = false;
    if (!validarCampoTexto(campoOF)) valido = false;
    if (!validarCampoTexto(campoPeca)) valido = false;
    if (!validarSelect(campoProcesso)) valido = false;
    if (!validarCampoTexto(campoDescricao)) valido = false;

    return valido;
  }

  /* ==========================================================================
     Toast de feedback
     ========================================================================== */

  function mostrarToast(titulo, mensagem, tipo) {
    toastTitulo.textContent = titulo;
    toastMensagem.textContent = mensagem;
    toast.classList.toggle('toast--erro', tipo === 'erro');
    toastIcone.innerHTML = tipo === 'erro' ? ICONE_ERRO : ICONE_SUCESSO;

    toast.classList.add('is-visible');

    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  /* ==========================================================================
     Geração de PDF (jsPDF)
     ========================================================================== */

  // Paleta usada na geração do PDF — espelha os tokens de cor do style.css
  // (--primary, --bg-card etc.) para manter a mesma identidade visual
  // entre o app e o documento gerado.
  const PDF_CORES = {
    primary: [11, 92, 171],
    primaryHover: [8, 74, 140],
    primarySoft: [232, 241, 251],
    textPrimary: [31, 41, 55],
    textSecondary: [87, 100, 122],
    textMuted: [148, 160, 178],
    border: [225, 230, 237]
  };

  // Logo da WEG embutido diretamente como base64 (em vez de carregado de
  // assets/logo/logo_weg.png em tempo de execução). Isso é proposital:
  // quando o sistema é aberto via duplo clique (protocolo file://), o
  // Chrome bloqueia tanto fetch() quanto a leitura de imagens locais via
  // <canvas> ("tainted canvas" / SecurityError) por política de segurança
  // de origem. Embutir os bytes aqui garante que o PDF funcione igual em
  // qualquer forma de abertura do sistema (file://, servidor local ou
  // publicado). A imagem exibida na página (assets/logo/logo_weg.png)
  // continua sendo o arquivo real — essa restrição vale só para "ler de
  // volta" os pixels via JavaScript, não para exibir a imagem normalmente.
  const LOGO_WEG_BASE64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABkAAAARgCAYAAACxP5q4AAAnH0lEQVR4nO3cv6qlVx3H4d8K2zKkSJpAwGq6dNqMFnMFYifOTCPO' +
    'aezU9KIX4NQaPeVsLaxyBWphI0JqsXYglRCxknmtvIHhnHfp5zzPFXxh8+5/H9Zac/Pq7zPrwwEAAAAAAEg4Xr+zewIAAAAAAMBd' +
    'E0AAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAA' +
    'gBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAA' +
    'AADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAA' +
    'AAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEE' +
    'AAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgR' +
    'QAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACA' +
    'HAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAA' +
    'AMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAA' +
    'AACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQA' +
    'AAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFA' +
    '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' +
    'yBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAA' +
    'AIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAA' +
    'AAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAA' +
    'AAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwB' +
    'BAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADI' +
    'EUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAA' +
    'gBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAA' +
    'AADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAA' +
    'AAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEE' +
    'AAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgJzL7gEAAABpx7yc22ef7J7BCW6uT2fmunsGAG/hmM/m9tm3d8/gBN//zdfn' +
    'nePPu2dwDidAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADI' +
    'EUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAA' +
    'gBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAA' +
    'AADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAA' +
    'AAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEE' +
    'AAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgR' +
    'QAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACA' +
    'HAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAA' +
    'AMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAA' +
    'AACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQA' +
    'AAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFA' +
    'AAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAc' +
    'AQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAA' +
    'yBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAA' +
    'AICcy+4BAAAAcY/n5tVPd4/gBMd8PGv3CAAA/ksAAQAAuE9rHs+sx7tncALxAwDgf4orsAAAAAAAgBwBBAAAAAAAyBFAAAAAAACA' +
    'HAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAA' +
    'AMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAA' +
    'AACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQA' +
    'AAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFA' +
    'AAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAc' +
    'AQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAA' +
    'yBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAA' +
    'AIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAA' +
    'AAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAA' +
    'AAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwB' +
    'BAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADI' +
    'EUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAA' +
    'gBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAA' +
    'AADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAnMvuAQAAAGnHvJzbZ5/sngEAAA+NEyAAAAAAAECO' +
    'AAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA' +
    '5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAA' +
    'AECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAA' +
    'AAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAA' +
    'AAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4A' +
    'AgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADk' +
    'CCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAA' +
    'QI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAA' +
    'AADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAA' +
    'AAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgAC' +
    'AAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQI' +
    'IAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABA' +
    'jgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAA' +
    'AOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQM5lZt7sHsFpfjk313/u' +
    'HsEJjuPjmbV7BWd4c/x4bq7f3T2DExzz1d0TAHhL6/jO3Fy/tnsGcIeO+Xxun/1w9wzgLh3fnJvr73ev4Axv3vW/2cNxmXUsL/hD' +
    'sfzoeiiWZ/rBWPNoZh7tnsEJPNYA/8fWRzPz0e4VwF06fDuDmrXen5knu2dwBm/hD4krsAAAAAAAgBwBBAAAAAAAyBFAAAAAAACA' +
    'HAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAA' +
    'AMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAA' +
    'AACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQA' +
    'AAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFA' +
    'AAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAc' +
    'AQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAA' +
    'yBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAA' +
    'AIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAA' +
    'AAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAA' +
    'AAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwB' +
    'BAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADI' +
    'EUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAA' +
    'gBwBBAAAAAAAyBFAAAAAAACAHAEEAAAAAADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyBFAAAAAAACAHAEEAAAA' +
    'AADIEUAAAAAAAIAcAQQAAAAAAMgRQAAAAAAAgBwBBAAAAAAAyLnMsf40az7YPQQAgJlZ64vdEzjL+tvM/GH3CgDexvp89wJO8uYr' +
    '/5r5t89r6HmyewDnWLsHAAAAAADAaW6u/5iZ93bP4L4dr12BBQAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAA' +
    'AOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAA' +
    'AABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIA' +
    'AAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5Agg' +
    'AAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECO' +
    'AAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA' +
    '5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAA' +
    'AECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAA' +
    'AAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAA' +
    'AAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4A' +
    'AgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADk' +
    'CCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAA' +
    'QI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAA' +
    'AADkCCAAAAAAAECOAAIAAAAAAOQIIAAAAAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkCCAAAAAAAECOAAIAAAAAAOQIIAAA' +
    'AAAAQI4AAgAAAAAA5AggAAAAAABAjgACAAAAAADkXObF9Xez5oPdQwAAAAAA4ATv7R7AOS6zjm/MrA93DwEAAAAAALgrrsACAAAA' +
    'AAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAA' +
    'AAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwAB' +
    'AAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIE' +
    'EAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAg' +
    'RwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAA' +
    'AHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAA' +
    'AAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEA' +
    'AAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQ' +
    'AAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBH' +
    'AAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAA' +
    'cgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAA' +
    'ACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAA' +
    'AAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAA' +
    'AAAAACBHAAEAAAAAAHIEEAAAAAAAIEcAAQAAAAAAcgQQAAAAAAAgRwABAAAAAAByBBAAAAAAACDnMrN+PnO8u3sIAAAAAADA3Vhf' +
    '/gd4eGNUryQhcAAAAABJRU5ErkJggg==';

  // Proporção largura/altura original do vetor da WEG (5991x4192) — usada
  // para redimensionar a logo no PDF sem nunca distorcer.
  const PROPORCAO_LOGO_WEG = 5991 / 4192;

  function detectarFormatoImagem(dataUrl) {
    const match = /^data:image\/(\w+);/.exec(dataUrl || '');
    if (!match) return 'JPEG';
    const tipo = match[1].toUpperCase();
    return tipo === 'JPG' ? 'JPEG' : tipo;
  }

  // Converte a imagem já carregada para um formato aceito de forma confiável pelo
  // jsPDF (JPEG ou PNG), evitando problemas com formatos incomuns vindos da câmera.
  // Quando o formato já é PNG/JPEG, os pixels originais são usados sem
  // nenhuma recompressão — a melhor qualidade possível é a da própria foto.
  function normalizarImagemParaPDF(imgEl) {
    const formatoOriginal = detectarFormatoImagem(imgEl.src);

    if (formatoOriginal === 'PNG' || formatoOriginal === 'JPEG') {
      return { dataUrl: imgEl.src, formato: formatoOriginal };
    }

    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    canvas.getContext('2d').drawImage(imgEl, 0, 0);

    return { dataUrl: canvas.toDataURL('image/jpeg', 0.95), formato: 'JPEG' };
  }

  function sanitizarParaArquivo(valor) {
    return (valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
  }

  function montarNomeArquivo(of, peca) {
    const ofSanitizado = sanitizarParaArquivo(of) || 'SEMOF';
    const pecaSanitizada = sanitizarParaArquivo(peca) || 'SEMPECA';
    return 'Registro_Desvio_OF' + ofSanitizado + '_P' + pecaSanitizada + '.pdf';
  }

  function desenharCabecalho(doc, larguraPagina, alturaCabecalho, margemX) {
    doc.setFillColor.apply(doc, PDF_CORES.primary);
    doc.rect(0, 0, larguraPagina, alturaCabecalho, 'F');

    // Selo branco atrás da logo: a marca da WEG é azul, então precisa de um
    // fundo claro para não "sumir" dentro da faixa azul do cabeçalho.
    const logoAltura = 12;
    const logoLargura = logoAltura * PROPORCAO_LOGO_WEG;
    const patchX = margemX;
    const patchY = 5;
    const patchPadding = 2;
    const patchLargura = logoLargura + patchPadding * 2;
    const patchAltura = logoAltura + patchPadding * 2;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(patchX, patchY, patchLargura, patchAltura, 2, 2, 'F');
    doc.addImage(LOGO_WEG_BASE64, 'PNG', patchX + patchPadding, patchY + patchPadding, logoLargura, logoAltura);

    // Título e subtítulo começam depois do selo da logo
    const textoX = patchX + patchLargura + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('REGISTRO DE DESVIO DE PRODUÇÃO', textoX, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(210, 224, 240);
    doc.text('Balteau Produtos Elétricos Ltda. – Grupo WEG', textoX, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 206, 226);
    doc.text('Emitido em ' + new Date().toLocaleString('pt-BR'), larguraPagina - margemX, alturaCabecalho - 4, { align: 'right' });
  }

  // Desenha um grupo de campos "label em cima, valor embaixo" dividindo
  // `largura` igualmente entre eles. `alturaLinha` controla o espaçamento
  // vertical até a próxima linha (mais compacto no layout paisagem).
  function linhaCampos(doc, campos, x, y, largura, alturaLinha) {
    const colWidth = largura / campos.length;

    campos.forEach((campo, i) => {
      const cx = x + i * colWidth;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor.apply(doc, PDF_CORES.textSecondary);
      doc.text(campo.label.toUpperCase(), cx, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor.apply(doc, PDF_CORES.textPrimary);
      const valorTexto = campo.valor && String(campo.valor).trim() ? String(campo.valor) : '—';
      doc.text(valorTexto, cx, y + 5.5);
    });

    return y + alturaLinha;
  }

  // Escreve um parágrafo (título + texto) que se ajusta para caber sempre
  // dentro de `alturaMaxima`, reduzindo o tamanho da fonte automaticamente
  // se o texto for longo. Isso é o que garante que a Descrição e o
  // Comentário — mesmo no limite de 600 caracteres cada — nunca empurrem o
  // conteúdo para uma segunda página: o "encaixe" é decidido antes de
  // desenhar, não depois.
  function paragrafoAjustado(doc, titulo, texto, x, y, largura, alturaMaxima) {
    const textoFinal = texto && texto.trim() ? texto : '—';
    const alturaTitulo = 5;
    const tamanhosTentativa = [9, 8.5, 8, 7.5, 7, 6.5, 6];

    let linhasEscolhidas = null;
    let fonteEscolhida = tamanhosTentativa[tamanhosTentativa.length - 1];
    let alturaLinhaEscolhida = fonteEscolhida * 0.5;

    for (const tamanho of tamanhosTentativa) {
      doc.setFontSize(tamanho);
      const linhas = doc.splitTextToSize(textoFinal, largura);
      const alturaLinha = tamanho * 0.5;
      const alturaTexto = linhas.length * alturaLinha;

      if (alturaTitulo + alturaTexto <= alturaMaxima) {
        linhasEscolhidas = linhas;
        fonteEscolhida = tamanho;
        alturaLinhaEscolhida = alturaLinha;
        break;
      }
    }

    // Salvaguarda para um cenário extremo (não deve acontecer com o limite
    // de 600 caracteres do formulário, mas garante que o PDF nunca "vaze"
    // para fora da área reservada mesmo assim).
    if (!linhasEscolhidas) {
      doc.setFontSize(fonteEscolhida);
      let linhas = doc.splitTextToSize(textoFinal, largura);
      const maxLinhas = Math.max(1, Math.floor((alturaMaxima - alturaTitulo) / alturaLinhaEscolhida));
      linhas = linhas.slice(0, maxLinhas);
      if (linhas.length) {
        linhas[linhas.length - 1] = linhas[linhas.length - 1].replace(/.{3}$/, '...');
      }
      linhasEscolhidas = linhas;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor.apply(doc, PDF_CORES.textSecondary);
    doc.text(titulo.toUpperCase(), x, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fonteEscolhida);
    doc.setTextColor.apply(doc, PDF_CORES.textPrimary);
    doc.text(linhasEscolhidas, x, y + alturaTitulo + alturaLinhaEscolhida * 0.7);
  }

  // Encaixa a foto (ou um placeholder, se não houver) dentro de uma caixa
  // fixa — sempre preservando a proporção original (nunca distorce) e
  // sempre cabendo dentro dos limites informados (por isso não existe
  // lógica de segunda página aqui: a caixa já é do tamanho certo).
  function inserirFotoColuna(doc, imagem, x, y, largura, altura) {
    if (!imagem || !imagem.dataUrl) {
      doc.setDrawColor.apply(doc, PDF_CORES.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, largura, altura, 2, 2, 'S');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor.apply(doc, PDF_CORES.textMuted);
      doc.text('Nenhuma evidência', x + largura / 2, y + altura / 2 - 3, { align: 'center' });
      doc.text('fotográfica anexada.', x + largura / 2, y + altura / 2 + 3, { align: 'center' });
      return;
    }

    const razaoCaixa = largura / altura;
    const razaoImagem = imagem.largura / imagem.altura;

    let larguraFinal;
    let alturaFinal;

    if (razaoImagem > razaoCaixa) {
      // Imagem proporcionalmente mais larga que a caixa: a largura é o limite
      larguraFinal = largura;
      alturaFinal = largura / razaoImagem;
    } else {
      // Imagem proporcionalmente mais alta que a caixa: a altura é o limite
      alturaFinal = altura;
      larguraFinal = altura * razaoImagem;
    }

    const xImagem = x + (largura - larguraFinal) / 2;
    const yImagem = y + (altura - alturaFinal) / 2;

    doc.setDrawColor.apply(doc, PDF_CORES.border);
    doc.setLineWidth(0.3);
    doc.rect(xImagem - 1, yImagem - 1, larguraFinal + 2, alturaFinal + 2, 'S');
    doc.addImage(imagem.dataUrl, imagem.formato, xImagem, yImagem, larguraFinal, alturaFinal);
  }

  function adicionarRodape(doc, larguraPagina, alturaPagina, margemX) {
    const totalPaginas = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);

      doc.setDrawColor.apply(doc, PDF_CORES.border);
      doc.setLineWidth(0.2);
      doc.line(margemX, alturaPagina - 12, larguraPagina - margemX, alturaPagina - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, PDF_CORES.textMuted);
      doc.text('Balteau · Grupo WEG — Registro de desvio de produção', margemX, alturaPagina - 7);
      doc.text('Página ' + i + ' de ' + totalPaginas, larguraPagina - margemX, alturaPagina - 7, { align: 'right' });
    }
  }

  function gerarPDF(registro) {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });

    doc.setProperties({
      title: 'Registro de Desvio - OF ' + registro.of,
      subject: 'Registro de desvio de produção',
      author: registro.lider || 'Balteau',
      creator: 'Sistema de Registro de Desvios - Balteau'
    });

    const larguraPagina = doc.internal.pageSize.getWidth();   // 297mm (A4 paisagem)
    const alturaPagina = doc.internal.pageSize.getHeight();   // 210mm

    // Margens pequenas, como pedido, e layout de duas colunas: 60% para os
    // dados do registro, 40% para a foto — calculado a partir da largura
    // de conteúdo disponível (já descontada a margem entre as colunas).
    const margemX = 12;
    const alturaCabecalho = 26;
    const inicioConteudoY = 34;
    const fimConteudoY = alturaPagina - 18; // deixa espaço para o rodapé

    const larguraConteudo = larguraPagina - margemX * 2;
    const gapColunas = 10;
    const larguraEsquerda = (larguraConteudo - gapColunas) * 0.6;
    const larguraDireita = larguraConteudo - gapColunas - larguraEsquerda;
    const xColunaDireita = margemX + larguraEsquerda + gapColunas;

    desenharCabecalho(doc, larguraPagina, alturaCabecalho, margemX);

    // ---- Coluna esquerda: dados do registro ----
    const alturaLinha = 12;
    let y = inicioConteudoY;

    y = linhaCampos(doc, [
      { label: 'Data', valor: registro.data },
      { label: 'Hora', valor: registro.hora }
    ], margemX, y, larguraEsquerda, alturaLinha);

    y = linhaCampos(doc, [
      { label: 'Líder', valor: registro.lider },
      { label: 'Turno', valor: registro.turno }
    ], margemX, y, larguraEsquerda, alturaLinha);

    y = linhaCampos(doc, [
      { label: 'OF', valor: registro.of },
      { label: 'Peça', valor: registro.peca }
    ], margemX, y, larguraEsquerda, alturaLinha);

    y = linhaCampos(doc, [
      { label: 'Processo', valor: registro.processo }
    ], margemX, y, larguraEsquerda, alturaLinha);

    // Os dois parágrafos a seguir recebem uma "fatia" fixa do espaço restante
    // (Descrição — o campo principal — com mais espaço que o Comentário).
    // Ambos se ajustam sozinhos para caber nessa fatia, então a soma nunca
    // ultrapassa fimConteudoY, não importa o quanto o líder escreveu.
    const espacoRestante = fimConteudoY - y - 10; // 10mm reservados para os 2 respiros entre blocos
    const alturaDescricao = espacoRestante * 0.62;
    const alturaComentario = espacoRestante * 0.38;

    y += 4;
    paragrafoAjustado(doc, 'Descrição do desvio', registro.descricao, margemX, y, larguraEsquerda, alturaDescricao);
    y += alturaDescricao;

    y += 6;
    paragrafoAjustado(doc, 'Comentário ao operador', registro.comentario || 'Nenhum comentário registrado.', margemX, y, larguraEsquerda, alturaComentario);

    // ---- Coluna direita: foto da ocorrência ----
    inserirFotoColuna(doc, registro.imagem, xColunaDireita, inicioConteudoY, larguraDireita, fimConteudoY - inicioConteudoY);

    adicionarRodape(doc, larguraPagina, alturaPagina, margemX);

    doc.save(montarNomeArquivo(registro.of, registro.peca));
  }

  /* ==========================================================================
     Envio do formulário
     ========================================================================== */

  function primeiroCampoInvalido() {
    return form.querySelector('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea');
  }

  // Reinicia a animação de "chacoalhar" mesmo que a classe já esteja presente:
  // remover, forçar reflow (leitura de offsetWidth) e reaplicar é o truque
  // padrão para reiniciar uma animação CSS que acabou de rodar.
  function chamarAtencao(elementoField) {
    if (!elementoField) return;
    elementoField.classList.remove('field--shake');
    void elementoField.offsetWidth;
    elementoField.classList.add('field--shake');
  }

  function coletarRegistro() {
    const arquivoImagem = campoEvidencia.files && campoEvidencia.files[0];
    let imagem = null;

    if (arquivoImagem && previewImg.src) {
      const normalizado = normalizarImagemParaPDF(previewImg);
      imagem = {
        dataUrl: normalizado.dataUrl,
        formato: normalizado.formato,
        nomeArquivo: arquivoImagem.name,
        largura: previewImg.naturalWidth,
        altura: previewImg.naturalHeight
      };
    }

    return {
      data: campoData.value,
      hora: campoHora.value,
      lider: campoLider.value.trim(),
      turno: (form.querySelector('input[name="turno"]:checked') || {}).value || '',
      of: campoOF.value.trim(),
      peca: campoPeca.value.trim(),
      processo: campoProcesso.value,
      descricao: campoDescricao.value.trim(),
      comentario: campoComentario.value.trim(),
      imagem: imagem
    };
  }

  function limparFormulario() {
    form.reset();
    esconderPreview();
    atualizarOfPeca();
    atualizarDataHora();
    contadorDescricao.textContent = '0/600';
    contadorComentario.textContent = '0/600';

    form.querySelectorAll('.field.is-invalid').forEach(limparErro);
    form.querySelectorAll('.field--shake').forEach((campo) => campo.classList.remove('field--shake'));
  }

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!validarFormulario()) {
      const campoInvalido = primeiroCampoInvalido();
      if (campoInvalido) {
        campoInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        campoInvalido.focus({ preventScroll: true });
        chamarAtencao(campoInvalido.closest('.field'));
      }
      mostrarToast('Verifique o formulário', 'Preencha os campos destacados em vermelho para continuar.', 'erro');
      return;
    }

    btnRegistrar.disabled = true;
    btnRegistrarTexto.textContent = 'Gerando PDF...';

    // Pequeno atraso para transmitir a sensação de processamento real.
    setTimeout(() => {
      try {
        const registro = coletarRegistro();
        gerarPDF(registro);

        console.log('Desvio registrado:', {
          ...registro,
          imagem: registro.imagem ? '[imagem anexada: ' + registro.imagem.nomeArquivo + ']' : null
        });

        contadorSessao += 1;
        contadorSessaoValor.textContent = String(contadorSessao);

        mostrarToast('Desvio registrado', 'O PDF de "' + registro.peca + '" foi gerado e baixado.', 'sucesso');

        limparFormulario();
      } catch (erro) {
        console.error('Erro ao gerar PDF:', erro);
        mostrarToast('Erro ao gerar PDF', 'Verifique sua conexão com a internet e tente novamente.', 'erro');
      }

      btnRegistrar.disabled = false;
      btnRegistrarTexto.textContent = 'Registrar desvio';
    }, 500);
  });

  // Botão "Limpar formulário": pede confirmação antes de descartar os dados
  // já preenchidos, já que essa ação não pode ser desfeita.
  btnLimpar.addEventListener('click', () => {
    const confirmou = window.confirm('Deseja limpar todos os campos preenchidos? Essa ação não pode ser desfeita.');
    if (!confirmou) return;

    limparFormulario();
    mostrarToast('Formulário limpo', 'Todos os campos foram reiniciados.', 'sucesso');
  });

  /* ==========================================================================
     Estado inicial
     ========================================================================== */

  atualizarOfPeca();

})();
