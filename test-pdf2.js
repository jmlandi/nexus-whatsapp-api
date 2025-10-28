const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function testPDF() {
  try {
    const pdfPath = '[ai]-[m]-luci-mar_01-09-2025_a_30-09-2025.pdf';
    const dataBuffer = fs.readFileSync(pdfPath);
    
    console.log('PDF carregado, tamanho:', dataBuffer.length, 'bytes');
    
    const parser = new PDFParse();
    const data = await parser.parse(dataBuffer);
    
    console.log('\n=== RESULTADO ===');
    console.log('Páginas:', data.numpages);
    console.log('Caracteres:', data.text.length);
    console.log('\nPrimeiros 500 caracteres:');
    console.log(data.text.substring(0, 500));
  } catch (error) {
    console.error('Erro:', error.message);
    console.error(error.stack);
  }
}

testPDF();
