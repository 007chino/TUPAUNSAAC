const fs = require('fs');
const path = require('path');

const targetPdf = path.join(__dirname, 'Proyecto Semestre 2026-I.pdf');
const outputTxt = path.join(__dirname, 'Proyecto_Semestre_2026-I.txt');

try {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(targetPdf);

  pdfParse(dataBuffer).then(function(data) {
    fs.writeFileSync(outputTxt, data.text, 'utf8');
    console.log(`Successfully extracted PDF text to ${outputTxt}`);
  }).catch(err => {
    console.error('Error parsing PDF:', err);
  });
} catch (error) {
  console.error('Failed to run PDF extraction script:', error);
}

