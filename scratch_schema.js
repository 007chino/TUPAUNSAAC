const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extractSchema() {
  const sqlFile = path.join(__dirname, 'bdtupa20260511.sql');
  const outFile = path.join(__dirname, 'database_schema.txt');
  const outStream = fs.createWriteStream(outFile);
  const fileStream = fs.createReadStream(sqlFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let inTable = false;
  let tableLines = [];

  for await (const line of rl) {
    if (line.toUpperCase().includes('CREATE TABLE')) {
      inTable = true;
      tableLines = [line];
    } else if (inTable) {
      tableLines.push(line);
      if (line.trim().endsWith(';') || line.startsWith(') ENGINE=') || line.startsWith(')')) {
        inTable = false;
        outStream.write('--- TABLE SCHEMA ---\n');
        outStream.write(tableLines.join('\n') + '\n\n');
      }
    }
  }
  outStream.end();
  console.log('Saved all table schemas to database_schema.txt');
}

extractSchema();
