const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Bump sizes
  content = content.replace(/text-\[10px\]/g, 'text-[12px]');
  content = content.replace(/text-\[11px\]/g, 'text-[13px]');
  content = content.replace(/text-\[12px\]/g, 'text-[14px]');
  content = content.replace(/text-\[13px\]/g, 'text-[14px]');

  // Lighten text colors
  content = content.replace(/#71717a/g, '#a1a1aa');
  content = content.replace(/#52525b/g, '#a1a1aa');
  content = content.replace(/#3f3f46/g, '#71717a'); // slightly lighter for borders/placeholders if they were text

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
