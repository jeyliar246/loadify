const fs = require('fs');
const path = require('path');

const dir = __dirname;
const sectionsPath = path.join(dir, 'sections_fragment.html');
const scriptPath = path.join(dir, 'script_fragment.js');
const indexPath = path.join(dir, 'index.html');

const sectionsPlaceholder = '<!-- placeholder: add single/bulk/tracking sections -->';
const scriptPlaceholder = '// placeholder: add app script';

if (!fs.existsSync(sectionsPath)) {
  fs.writeFileSync(sectionsPath, sectionsPlaceholder, 'utf8');
}
if (!fs.existsSync(scriptPath)) {
  fs.writeFileSync(scriptPath, scriptPlaceholder, 'utf8');
}

const sectionsContent = fs.readFileSync(sectionsPath, 'utf8');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace('MAIN_FORMS_PLACEHOLDER', sectionsContent);
indexContent = indexContent.replace(sectionsPlaceholder, sectionsContent);
indexContent = indexContent.replace('SCRIPT_PLACEHOLDER', scriptContent);
indexContent = indexContent.replace(scriptPlaceholder, scriptContent);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Done.');
