const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../public/sw.template.js');
const outputPath = path.join(__dirname, '../public/sw.js');

const template = fs.readFileSync(templatePath, 'utf8');
const timestamp = Date.now();
const result = template.replace('{{BUILD_TIMESTAMP}}', timestamp);

fs.writeFileSync(outputPath, result);
console.log('Generated sw.js with cache name:', timestamp);
