const fs = require('fs');
const path = require('path');
const inputPath = path.join(__dirname, 'part1.txt');
const outputPath = path.join(__dirname, 'index.html');

let raw = fs.readFileSync(inputPath, 'utf8');
raw = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
raw = raw.replace(/-\s*\n\s*/g, '-');
fs.writeFileSync(outputPath, raw, 'utf8');
console.log('Done.');
