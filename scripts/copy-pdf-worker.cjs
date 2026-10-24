const fs = require('node:fs');
const path = require('node:path');
fs.copyFileSync(require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs'), path.join(__dirname, '../public/pdf.worker.min.mjs'));
