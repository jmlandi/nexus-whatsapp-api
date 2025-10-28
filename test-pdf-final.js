const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function testPDF() {
  try {
    const pdfPath = '[ai]-[m]-luci-mar_01-09-2025_a_30-09-2025.pdf';
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('PDF carregado, tamanho:', dataBuffer.length, 'bytes');
    
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    
    console.log('\n=== RESULTADO ===');
    console.log('Páginas:', result.numPages);
    console.log('Caracteres:', result.text.length);
    console.log('\nPrimeiros 1000 caracteres:');
    console.log(result.text.substring(0, 1000));
  } catch (error) {
    console.error('Erro:', error.message);
    console.error(error.stack);
  }
}

testPDF();
