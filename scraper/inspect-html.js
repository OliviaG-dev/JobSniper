import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(__dirname, 'debug-output', 'wtj-page.html'), 'utf8');

// Liens vers les offres
const links = html.match(/href="[^"]*companies[^"]*jobs[^"]*"/g) || [];
console.log(`Liens companies/jobs: ${links.length}`);
links.slice(0, 5).forEach(l => console.log(' ', l));

// data-testid search-results
const items = html.match(/data-testid="search-results-list-item[^"]*"/g) || [];
console.log(`\nsearch-results-list-item: ${items.length}`);
items.slice(0, 5).forEach(i => console.log(' ', i));

// Extraire un bloc autour du premier item
const idx = html.indexOf('search-results-list-item');
if (idx > -1) {
  const start = Math.max(0, idx - 200);
  const end = Math.min(html.length, idx + 600);
  console.log('\n--- Contexte HTML autour du premier item ---');
  console.log(html.slice(start, end));
}

// Titres d'offres visibles
const titles = html.match(/Développeur[^<]{0,80}/gi) || [];
console.log(`\nTitres "Développeur": ${titles.length}`);
titles.slice(0, 10).forEach(t => console.log(' ', t));
