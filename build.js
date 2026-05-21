// build.js — converts Netlify CMS _cakes/ markdown files to cakes.json
// Run automatically by Netlify on each deploy

const fs = require('fs');
const path = require('path');

const cakesDir = path.join(__dirname, '_cakes');
const outputFile = path.join(__dirname, 'cakes.json');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const obj = {};
  yaml.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Booleans
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    obj[key] = val;
  });
  return obj;
}

try {
  if (!fs.existsSync(cakesDir)) {
    console.log('No _cakes directory found, writing empty cakes.json');
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
  }

  const files = fs.readdirSync(cakesDir).filter(f => f.endsWith('.md'));
  const cakes = files.map(file => {
    const content = fs.readFileSync(path.join(cakesDir, file), 'utf8');
    const data = parseFrontmatter(content);
    return data;
  }).filter(c => c.available !== false); // hide unavailable

  fs.writeFileSync(outputFile, JSON.stringify(cakes, null, 2));
  console.log(`✅ Built cakes.json with ${cakes.length} cake(s)`);
} catch (err) {
  console.error('Build error:', err);
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
}
