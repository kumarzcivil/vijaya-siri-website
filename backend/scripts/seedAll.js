import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scripts = ['seedProFix.js', 'seedQuickFix.js', 'seedOffers.js', 'seedPackages.js', 'seedMarketing.js'];

console.log('=== Running all seed scripts ===\n');

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`--- ${script} ---`);
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('');
  } catch (err) {
    console.error(`Failed: ${script}\n`);
  }
}

console.log('=== All seed scripts complete ===');
