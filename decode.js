const fs = require('fs');
const path = require('path');
const inputPath = path.join(__dirname, 'encoded_input.txt');
const outputPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(inputPath)) {
  fs.writeFileSync(inputPath, '# Paste the HTML-encoded content here (entities: &lt; &gt; &quot; &#39; &amp;), then re-run.', 'utf8');
  fs.writeFileSync(outputPath, '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Placeholder</title></head><body><p>Placeholder. Write the encoded HTML to encoded_input.txt and re-run the decoder.</p></body></html>', 'utf8');
  console.log('PLACEHOLDER: encoded_input.txt did not exist. Created placeholder files. Parent should write the encoded content to encoded_input.txt first, then re-run.');
  process.exit(1);
}

let raw = fs.readFileSync(inputPath, 'utf8');
raw = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
raw = raw.replace(/-\s*\n\s*/g, '-');
fs.writeFileSync(outputPath, raw, 'utf8');
console.log('SUCCESS: Decoded encoded_input.txt and wrote index.html');
