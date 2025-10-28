const pdf = require('pdf-parse');

console.log('Tipo de pdf:', typeof pdf);
console.log('Tem default?', typeof pdf.default);
console.log('Keys:', Object.keys(pdf));
