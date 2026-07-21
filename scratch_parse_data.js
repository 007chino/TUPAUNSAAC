const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Helper to parse SQL INSERT value strings into JS objects/arrays
function parseSQLInsertLine(line) {
  // Extract the part between VALUES ( ... );
  const valuesIndex = line.indexOf('VALUES');
  if (valuesIndex === -1) return [];
  let valuesStr = line.substring(valuesIndex + 6).trim();
  if (valuesStr.endsWith(';')) {
    valuesStr = valuesStr.substring(0, valuesStr.length - 1);
  }

  // Parse SQL values. Values are represented as (val1, val2, ...), (val3, val4, ...)
  // We can write a custom regex-based parser to split by ),( while respecting quotes.
  const records = [];
  let currentRecord = [];
  let currentVal = '';
  let inString = false;
  let escape = false;
  let inRecord = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];

    if (escape) {
      currentVal += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '\'') {
      inString = !inString;
      continue; // Skip the quote itself
    }

    if (inString) {
      currentVal += char;
      continue;
    }

    if (char === '(' && !inRecord) {
      inRecord = true;
      currentRecord = [];
      currentVal = '';
      continue;
    }

    if (char === ')' && inRecord) {
      // End of record
      currentRecord.push(formatVal(currentVal.trim()));
      records.push(currentRecord);
      inRecord = false;
      continue;
    }

    if (char === ',' && inRecord) {
      currentRecord.push(formatVal(currentVal.trim()));
      currentVal = '';
      continue;
    }

    if (inRecord) {
      currentVal += char;
    }
  }

  return records;
}

function formatVal(val) {
  if (val.toUpperCase() === 'NULL') return null;
  if (val.toUpperCase() === 'TRUE') return true;
  if (val.toUpperCase() === 'FALSE') return false;
  if (!isNaN(val) && val !== '') return Number(val);
  return val;
}

async function extractData() {
  const sqlFile = path.join(__dirname, 'bdtupa20260511.sql');
  const fileStream = fs.createReadStream(sqlFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const catalog = [];
  const requisites = [];
  const costs = [];
  const offices = [];

  for await (const line of rl) {
    if (line.includes('INSERT INTO `tcatalogotramite`')) {
      const parsed = parseSQLInsertLine(line);
      parsed.forEach(rec => {
        catalog.push({
          codigo: rec[0],
          denominacion: rec[1],
          descripcion: rec[2],
          codigoBanco: rec[3],
          tieneMontoFijo: rec[4] === 1 || rec[4] === true
        });
      });
    } else if (line.includes('INSERT INTO `trequisitotramite`')) {
      const parsed = parseSQLInsertLine(line);
      parsed.forEach(rec => {
        requisites.push({
          id: rec[0],
          codigoTramite: rec[1],
          descripcionRequisito: rec[2]
        });
      });
    } else if (line.includes('INSERT INTO `tmontotramite`')) {
      const parsed = parseSQLInsertLine(line);
      parsed.forEach(rec => {
        costs.push({
          id: rec[0],
          codigoTramite: rec[1],
          monto: rec[2],
          descripcionPago: rec[3],
          fechaInicio: rec[4],
          fechaFin: rec[5]
        });
      });
    } else if (line.includes('INSERT INTO `tunidadorganizativa`')) {
      const parsed = parseSQLInsertLine(line);
      parsed.forEach(rec => {
        offices.push({
          id: rec[0],
          nombre: rec[1]
        });
      });
    }
  }

  const outputData = {
    catalog,
    requisites,
    costs,
    offices
  };

  fs.writeFileSync(
    path.join(__dirname, 'extracted_tupa_data.json'),
    JSON.stringify(outputData, null, 2),
    'utf8'
  );

  console.log(`Extraction complete!`);
  console.log(`Procedures: ${catalog.length}`);
  console.log(`Requisites: ${requisites.length}`);
  console.log(`Costs: ${costs.length}`);
  console.log(`Offices: ${offices.length}`);
}

extractData();
