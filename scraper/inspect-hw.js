import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'debug-output', 'hellowork-page.html'), 'utf8');

// data-cy serpCard
const serpCards = html.match(/data-cy="serpCard"/g) || [];
console.log(`data-cy="serpCard": ${serpCards.length}`);

// Contexte autour du premier serpCard
const idx = html.indexOf('data-cy="serpCard"');
if (idx > -1) {
  const start = Math.max(0, idx - 300);
  const end = Math.min(html.length, idx + 1000);
  console.log('\n--- Contexte premier serpCard ---');
  console.log(html.slice(start, end));
}

// Liens emploi
const links = html.match(/href="[^"]*\/emploi\/[^"]+\.html"/g) || [];
console.log(`\nLiens /emploi/*.html: ${links.length}`);
links.slice(0, 10).forEach(l => console.log(' ', l));

// data-testid
const testids = html.match(/data-testid="[^"]*"/g) || [];
const unique = [...new Set(testids)];
console.log(`\ndata-testid uniques (${unique.length}):`);
unique.slice(0, 30).forEach(t => console.log(' ', t));

// Titres
const titles = html.match(/Développeur[^<]{0,100}/gi) || [];
console.log(`\nTitres "Développeur": ${titles.length}`);
titles.slice(0, 10).forEach(t => console.log(' ', t));
