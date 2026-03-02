import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// HelloWork
const hw = readFileSync(join(__dirname, 'debug-output', 'hellowork-page.html'), 'utf8');
const hwIdx = hw.indexOf('data-cy="serpCard"');
const hwChunk = hw.slice(hwIdx, hwIdx + 3000);
const hwDates = hwChunk.match(/il y a[^<]{0,40}|publi[^<]{0,50}|datetime="[^"]+"|<time[^>]*>[^<]*/gi) || [];
console.log('=== HelloWork dates ===');
console.log(`Trouvé: ${hwDates.length}`);
hwDates.forEach(d => console.log(' ', d));

// Chercher la date sur toute la carte
const hwDatePattern = hw.match(/data-cy="serpCard"[\s\S]{0,4000}?(?:il y a|Publiée?|jour|heure|semaine|mois)[^<]{0,50}/gi) || [];
console.log(`\nPatterns date dans serpCard: ${hwDatePattern.length}`);
hwDatePattern.slice(0, 3).forEach(d => {
  const dateMatch = d.match(/(il y a[^<]{0,40}|Publiée?[^<]{0,40}|\d+ jour|\d+ heure|\d+ semaine|\d+ mois)/i);
  if (dateMatch) console.log(' ', dateMatch[0]);
});

// WTJ
const wtj = readFileSync(join(__dirname, 'debug-output', 'wtj-page.html'), 'utf8');
const wtjIdx = wtj.indexOf('search-results-list-item');
const wtjChunk = wtj.slice(wtjIdx, wtjIdx + 3000);
const wtjDates = wtjChunk.match(/il y a[^<]{0,40}|publi[^<]{0,50}|datetime="[^"]+"|<time[^>]*>[^<]*/gi) || [];
console.log('\n=== WTJ dates ===');
console.log(`Trouvé: ${wtjDates.length}`);
wtjDates.forEach(d => console.log(' ', d));

// Indeed
try {
  const ind = readFileSync(join(__dirname, 'debug-output', 'indeed-page.html'), 'utf8');
  const indDates = ind.match(/data-testid="myJobsStateDate"[^>]*>[^<]*/gi) || [];
  const indDates2 = ind.match(/class="date"[^>]*>[^<]*/gi) || [];
  const indDates3 = ind.match(/Publiée?[^<]{0,40}|il y a[^<]{0,40}/gi) || [];
  console.log('\n=== Indeed dates ===');
  console.log(`myJobsStateDate: ${indDates.length}`);
  indDates.slice(0, 3).forEach(d => console.log(' ', d));
  console.log(`class="date": ${indDates2.length}`);
  indDates2.slice(0, 3).forEach(d => console.log(' ', d));
  console.log(`Publiée/il y a: ${indDates3.length}`);
  indDates3.slice(0, 5).forEach(d => console.log(' ', d));
} catch { console.log('\n=== Indeed: pas de HTML ==='); }
