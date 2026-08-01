(function () {
  'use strict';

  const RD = window.RD;

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
    return 'Registro_NC_OF' + ofSanitizado + '_P' + pecaSanitizada + '.pdf';
  }

  function desenharCabecalho(doc, larguraPagina, alturaCabecalho, margemX) {
    doc.setFillColor.apply(doc, RD.config.PDF_CORES.primary);
    doc.rect(0, 0, larguraPagina, alturaCabecalho, 'F');

    // Selo branco atrás da logo: a marca da WEG é azul, então precisa de um
    // fundo claro para não "sumir" dentro da faixa azul do cabeçalho.
    const logoAltura = 12;
    const logoLargura = logoAltura * RD.config.PROPORCAO_LOGO_WEG;
    const patchX = margemX;
    const patchY = 5;
    const patchPadding = 2;
    const patchLargura = logoLargura + patchPadding * 2;
    const patchAltura = logoAltura + patchPadding * 2;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(patchX, patchY, patchLargura, patchAltura, 2, 2, 'F');
    doc.addImage(RD.config.LOGO_WEG_BASE64, 'PNG', patchX + patchPadding, patchY + patchPadding, logoLargura, logoAltura);

    // Título e subtítulo começam depois do selo da logo
    const textoX = patchX + patchLargura + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('REGISTRO NC', textoX, 13);

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
      doc.setTextColor.apply(doc, RD.config.PDF_CORES.textSecondary);
      doc.text(campo.label.toUpperCase(), cx, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor.apply(doc, RD.config.PDF_CORES.textPrimary);
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
    doc.setTextColor.apply(doc, RD.config.PDF_CORES.textSecondary);
    doc.text(titulo.toUpperCase(), x, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fonteEscolhida);
    doc.setTextColor.apply(doc, RD.config.PDF_CORES.textPrimary);
    doc.text(linhasEscolhidas, x, y + alturaTitulo + alturaLinhaEscolhida * 0.7);
  }

  // Encaixa a foto (ou um placeholder, se não houver) dentro de uma caixa
  // fixa — sempre preservando a proporção original (nunca distorce) e
  // sempre cabendo dentro dos limites informados (por isso não existe
  // lógica de segunda página aqui: a caixa já é do tamanho certo).
  function inserirFotoColuna(doc, imagem, x, y, largura, altura) {
    if (!imagem || !imagem.dataUrl) {
      doc.setDrawColor.apply(doc, RD.config.PDF_CORES.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, largura, altura, 2, 2, 'S');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor.apply(doc, RD.config.PDF_CORES.textMuted);
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

    doc.setDrawColor.apply(doc, RD.config.PDF_CORES.border);
    doc.setLineWidth(0.3);
    doc.rect(xImagem - 1, yImagem - 1, larguraFinal + 2, alturaFinal + 2, 'S');
    doc.addImage(imagem.dataUrl, imagem.formato, xImagem, yImagem, larguraFinal, alturaFinal);
  }

  function adicionarRodape(doc, larguraPagina, alturaPagina, margemX) {
    const totalPaginas = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);

      doc.setDrawColor.apply(doc, RD.config.PDF_CORES.border);
      doc.setLineWidth(0.2);
      doc.line(margemX, alturaPagina - 12, larguraPagina - margemX, alturaPagina - 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, RD.config.PDF_CORES.textMuted);
      doc.text('Balteau · Grupo WEG — Registro de não conformidade de produção', margemX, alturaPagina - 7);
      doc.text('Página ' + i + ' de ' + totalPaginas, larguraPagina - margemX, alturaPagina - 7, { align: 'right' });
    }
  }

  function gerarPDF(registro) {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });

    // Metadados fixos, sem nenhum dado dinâmico do registro (OF, líder etc.)
    // e sem qualquer URL/endereço do projeto ou do repositório — o PDF deve
    // conter apenas informações do Registro NC. O jsPDF preenche sozinho o
    // campo /Producer com o nome da própria biblioteca ("jsPDF 2.5.1"); não
    // definimos esse campo, mas ele nunca contém link algum (conferido nos
    // bytes brutos de um PDF gerado).
    doc.setProperties({
      title: 'Registro NC',
      subject: 'Registro de Não Conformidade',
      author: 'Balteau / WEG',
      creator: 'Registro NC',
      keywords: 'Não Conformidade, Produção, Qualidade'
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
    paragrafoAjustado(doc, 'Descrição da não conformidade', registro.descricao, margemX, y, larguraEsquerda, alturaDescricao);
    y += alturaDescricao;

    y += 6;
    paragrafoAjustado(doc, 'Comentário ao operador', registro.comentario || 'Nenhum comentário registrado.', margemX, y, larguraEsquerda, alturaComentario);

    // ---- Coluna direita: foto da ocorrência ----
    inserirFotoColuna(doc, registro.imagem, xColunaDireita, inicioConteudoY, larguraDireita, fimConteudoY - inicioConteudoY);

    adicionarRodape(doc, larguraPagina, alturaPagina, margemX);

    doc.save(montarNomeArquivo(registro.of, registro.peca));
  }

  RD.pdf = {
    gerarPDF: gerarPDF,
    normalizarImagemParaPDF: normalizarImagemParaPDF
  };

})();
