(function () {
  'use strict';

  const RD = window.RD;

  let contadorSessao = 0;

  // Quando não-nulo, significa "este registro já foi salvo no banco, só
  // falta gerar o PDF" — o próximo clique em "Registrar não conformidade" deve
  // tentar gerar o PDF de novo a partir DESTE registro, sem validar nem
  // salvar outra vez (evita duplicar o registro no banco).
  let registroSalvoAguardandoPdf = null;

  function primeiroCampoInvalido() {
    return RD.dom.form.querySelector('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea');
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
    const arquivoImagem = RD.dom.campoEvidencia.files && RD.dom.campoEvidencia.files[0];
    let imagem = null;

    if (arquivoImagem && RD.dom.previewImg.src) {
      const normalizado = RD.pdf.normalizarImagemParaPDF(RD.dom.previewImg);
      imagem = {
        dataUrl: normalizado.dataUrl,
        formato: normalizado.formato,
        nomeArquivo: arquivoImagem.name,
        largura: RD.dom.previewImg.naturalWidth,
        altura: RD.dom.previewImg.naturalHeight
      };
    }

    return {
      data: RD.dom.campoData.value,
      hora: RD.dom.campoHora.value,
      lider: RD.dom.campoLider.value.trim(),
      turno: (RD.dom.form.querySelector('input[name="turno"]:checked') || {}).value || '',
      of: RD.dom.campoOF.value.trim(),
      peca: RD.dom.campoPeca.value.trim(),
      processo: RD.dom.campoProcesso.value,
      descricao: RD.dom.campoDescricao.value.trim(),
      comentario: RD.dom.campoComentario.value.trim(),
      imagem: imagem
    };
  }

  function limparFormulario() {
    registroSalvoAguardandoPdf = null;

    RD.dom.form.reset();
    RD.upload.esconderPreview();
    RD.ofPeca.atualizar();
    RD.datetime.atualizar();
    RD.dom.contadorDescricao.textContent = '0/600';
    RD.dom.contadorComentario.textContent = '0/600';

    RD.dom.form.querySelectorAll('.field.is-invalid').forEach(RD.validation.limparErro);
    RD.dom.form.querySelectorAll('.field--shake').forEach((campo) => campo.classList.remove('field--shake'));

    RD.dom.btnRegistrarTexto.textContent = 'Registrar não conformidade';
  }

  // Reabilita o botão de envio no rótulo padrão. Usado apenas quando o
  // SALVAMENTO falhou — nesse caso o formulário continua preenchido de
  // propósito, então não chamamos limparFormulario() aqui.
  function resetarBotaoAposFalhaAoSalvar() {
    RD.dom.btnRegistrar.disabled = false;
    RD.dom.btnRegistrarTexto.textContent = 'Registrar não conformidade';
  }

  // Gera o PDF de um registro que JÁ foi salvo no banco (com sucesso).
  // Usada tanto logo após o salvamento quanto em uma nova tentativa
  // manual, caso a geração do PDF tenha falhado da primeira vez — em
  // nenhum dos dois casos o registro é enviado ao banco novamente.
  //
  // Importante: sempre gera o PDF a partir do "registro" recebido (o que
  // foi efetivamente salvo), e não dos valores atuais dos campos do
  // formulário — evita gerar um PDF que não bate com o que está no banco,
  // caso o usuário edite algum campo enquanto uma tentativa de PDF ainda
  // estiver pendente.
  function gerarPdfDoRegistroSalvo(registro) {
    RD.dom.btnRegistrar.disabled = true;
    RD.dom.btnRegistrarTexto.textContent = 'Gerando PDF...';

    try {
      RD.pdf.gerarPDF(registro);

      console.log('Não conformidade registrada:', {
        ...registro,
        imagem: registro.imagem ? '[imagem anexada: ' + registro.imagem.nomeArquivo + ']' : null
      });

      RD.toast.mostrar('Não conformidade registrada', 'O registro foi salvo e o PDF de "' + registro.peca + '" foi gerado e baixado.', 'sucesso');
      limparFormulario();
      RD.dom.btnRegistrar.disabled = false;
    } catch (erroPdf) {
      console.error('Registro salvo, mas falhou a geração do PDF:', erroPdf);
      registroSalvoAguardandoPdf = registro;
      RD.toast.mostrar(
        'Registro salvo — PDF não gerado',
        'O registro já está salvo no banco de dados (não será enviado de novo). Não foi possível gerar o PDF agora — verifique sua conexão e clique em "Tentar gerar PDF novamente".',
        'erro'
      );
      RD.dom.btnRegistrar.disabled = false;
      RD.dom.btnRegistrarTexto.textContent = 'Tentar gerar PDF novamente';
    }
  }

  RD.dom.form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Já existe um registro salvo aguardando só o PDF: este clique tenta
    // gerar o PDF de novo, sem validar nem salvar outra vez.
    if (registroSalvoAguardandoPdf) {
      gerarPdfDoRegistroSalvo(registroSalvoAguardandoPdf);
      return;
    }

    if (!RD.validation.validarFormulario()) {
      const campoInvalido = primeiroCampoInvalido();
      if (campoInvalido) {
        campoInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        campoInvalido.focus({ preventScroll: true });
        chamarAtencao(campoInvalido.closest('.field'));
      }
      RD.toast.mostrar('Verifique o formulário', 'Preencha os campos destacados em vermelho para continuar.', 'erro');
      return;
    }

    const registro = coletarRegistro();

    RD.dom.btnRegistrar.disabled = true;
    RD.dom.btnRegistrarTexto.textContent = 'Salvando registro...';

    // O registro é salvo no banco ANTES do PDF ser gerado. Se o
    // salvamento falhar, nada foi persistido: avisamos o usuário e
    // mantemos o formulário preenchido, para que ele possa tentar de
    // novo sem perder nada nem duplicar um registro que já tenha sido
    // salvo.
    RD.services.supabase.salvarRegistro(registro)
      .then(() => {
        contadorSessao += 1;
        RD.dom.contadorSessaoValor.textContent = String(contadorSessao);
        gerarPdfDoRegistroSalvo(registro);
      })
      .catch((erroSalvar) => {
        console.error('Erro ao salvar o registro:', erroSalvar);
        RD.toast.mostrar(
          'Não foi possível salvar',
          (erroSalvar && erroSalvar.message ? erroSalvar.message : 'Verifique sua conexão com a internet e tente novamente.') +
            ' Os dados preenchidos não foram perdidos.',
          'erro'
        );
        // Formulário NÃO é limpo: nada foi salvo, então os dados
        // continuam preenchidos para o usuário tentar novamente.
        resetarBotaoAposFalhaAoSalvar();
      });
  });

  // Botão "Limpar formulário": pede confirmação antes de descartar os dados
  // já preenchidos, já que essa ação não pode ser desfeita. Também esquece
  // qualquer PDF pendente de uma tentativa anterior (o registro já salvo
  // no banco não é afetado, só deixa de ser possível reimprimir o PDF
  // dele por aqui).
  RD.dom.btnLimpar.addEventListener('click', () => {
    const confirmou = window.confirm('Deseja limpar todos os campos preenchidos? Essa ação não pode ser desfeita.');
    if (!confirmou) return;

    limparFormulario();
    RD.toast.mostrar('Formulário limpo', 'Todos os campos foram reiniciados.', 'sucesso');
  });

})();
