/**
 * Script de teste para extração de PDF
 * Testa a extração de texto do PDF local
 */

const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPDF() {
  try {
    const pdfPath = path.join(__dirname, '../[ai]-[m]-luci-mar_01-09-2025_a_30-09-2025.pdf');
    
    console.log('📄 Testando extração de PDF...');
    console.log('Arquivo:', pdfPath);
    
    // Verifica se arquivo existe
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ Arquivo não encontrado!');
      return;
    }
    
    // Lê o arquivo
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('✅ Arquivo lido:', dataBuffer.length, 'bytes');
    
    // Extrai texto
    const data = await pdf(dataBuffer);
    
    console.log('\n📊 Resultados:');
    console.log('- Páginas:', data.numpages);
    console.log('- Caracteres:', data.text.length);
    console.log('- Info:', data.info);
    console.log('\n📝 Primeiros 500 caracteres:');
    console.log(data.text.substring(0, 500));
    console.log('\n✅ Extração bem-sucedida!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  }
}

testPDF();
