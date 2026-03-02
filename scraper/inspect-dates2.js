import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));

// HelloWork
console.log('=== HelloWork ===');
const hw = readFileSync(join(__dirname, 'debug-output', 'hellowork-page.html'), 'utf8');
const $hw = cheerio.load(hw);
$hw('[data-cy="serpCard"]').slice(0, 3).each((i, el) => {
  const $el = $hw(el);
  const title = $el.find('[data-cy="offerTitle"]').first().attr('title') || '';
  const dateText = $el.text().match(/il y a [^,\n]{3,25}/i);
  const time = $el.find('time').first();
  const datetime = time.attr('datetime') || '';
  const timeText = time.text().trim();
  console.log(`${i+1}. ${title.slice(0, 50)}`);
  console.log(`   dateText: ${dateText ? dateText[0] : 'none'}`);
  console.log(`   <time>: datetime=${datetime} text=${timeText}`);
  // Chercher dans le HTML brut
  const outerHtml = $hw.html(el);
  const dateMatch = outerHtml.match(/il y a[^<]{2,30}/i);
  console.log(`   raw match: ${dateMatch ? dateMatch[0] : 'none'}`);
});

// Indeed
console.log('\n=== Indeed ===');
const ind = readFileSync(join(__dirname, 'debug-output', 'indeed-page.html'), 'utf8');
const $ind = cheerio.load(ind);
$ind('[data-jk]').slice(0, 3).each((i, el) => {
  const $el = $ind(el);
  const title = $el.find('h2').first().text().trim().slice(0, 50);
  const dateEl = $el.find('.date, [data-testid*="date"], .result-footer').first();
  const dateText = dateEl.text().trim().slice(0, 50);
  const time = $el.find('time').first();
  // Aussi chercher dans le texte complet de la carte
  const allText = $el.text();
  const dateMatch = allText.match(/(Publi[ée]+[^.]{3,30}|il y a[^.]{3,30}|\d+ jour)/i);
  console.log(`${i+1}. ${title}`);
  console.log(`   dateEl: ${dateText || 'none'}`);
  console.log(`   <time>: ${time.attr('datetime') || 'none'}`);
  console.log(`   text match: ${dateMatch ? dateMatch[0] : 'none'}`);
});

// WTJ
console.log('\n=== WTJ ===');
const wtj = readFileSync(join(__dirname, 'debug-output', 'wtj-page.html'), 'utf8');
const $wtj = cheerio.load(wtj);
$wtj('[data-testid="search-results-list-item-wrapper"]').slice(0, 3).each((i, el) => {
  const $el = $wtj(el);
  const a = $el.find('a[role="link"]').first();
  const title = (a.attr('aria-label') || '').slice(0, 50);
  const time = $el.find('time').first();
  const allText = $el.text();
  const dateMatch = allText.match(/(il y a[^.]{3,30}|Publi[^.]{3,30}|\d+ jour)/i);
  console.log(`${i+1}. ${title}`);
  console.log(`   <time>: ${time.attr('datetime') || 'none'} text=${time.text().trim()}`);
  console.log(`   text match: ${dateMatch ? dateMatch[0] : 'none'}`);
});
