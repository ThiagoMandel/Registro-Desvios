# pdf/

Reservada para **implementações futuras relacionadas à geração de PDF**.

## Situação atual
Hoje o PDF é gerado inteiramente no navegador do usuário, em tempo real,
usando a biblioteca jsPDF (carregada via CDN em `index.html`). Não
existe nenhum arquivo de modelo/template — o layout do documento é
montado por código, função por função, dentro de `modules/pdfGenerator.js`.

## Possíveis usos futuros desta pasta
- **Modelos/templates de PDF**: se o layout evoluir para usar uma
  biblioteca baseada em templates (em vez de desenhar tudo via código),
  os arquivos de modelo entrariam aqui.
- **PDFs de exemplo**: um PDF de referência gerado pelo sistema, útil
  para validar mudanças de layout sem precisar preencher o formulário
  inteiro de novo.
- **Geração no servidor**: caso o projeto evolua para gerar o PDF em um
  backend (em vez de no navegador) — por exemplo, para permitir
  reimpressão de registros antigos a partir de um banco de dados —, o
  código desse serviço poderia viver aqui.

Nenhuma dessas evoluções está implementada agora; a pasta existe apenas
para já reservar o espaço na estrutura do projeto.
