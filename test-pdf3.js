const pdf = require('pdf-parse');
const fs = require('fs');

async function testPDF() {
  try {
    const pdfPath = '[ai]-[m]-luci-mar_01-09-2025_a_30-09-2025.pdf';
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('PDF carregado, tamanho:', dataBuffer.length, 'bytes');
    console.log('Tipo de pdf:', typeof pdf);
    console.log('Keys:', Object.keys(pdf));
    
    // Tenta acessar PDFParse
    if (pdf.PDFParse) {
      console.log('\nTestando pdf.PDFParse...');
      const parser = new pdf.PDFParse();
      console.log('Parser criado:', typeof parser);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
    console.error(error.stack);
  }
}

testPDF();
