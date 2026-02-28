/**
 * JobSniper — Scraper ultra safe
 * - 1ère page par source
 * - Titre + entreprise + lien uniquement
 * - Délai aléatoire 2–5 s entre requêtes
 * - Stockage + déduplication par lien
 *
 * Lancer 1x par jour via cron : node run.js
 */

import { chromium } from 'playwright';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadJobs, mergeAndDeduplicate, saveJobs } from './storage.js';
import { parseIndeedPage } from './sources/indeed.js';
import { parseWtjPage } from './sources/wtj.js';
import { parseHelloworkPage } from './sources/hellowork.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config', 'search-urls.json');

function randomDelay(minSec, maxSec) {
  const sec = minSec + Math.random() * (maxSec - minSec);
  return new Promise((r) => setTimeout(r, sec * 1000));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function loadConfig() {
  const raw = await readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

const parsers = {
  indeed: parseIndeedPage,
  wtj: parseWtjPage,
  hellowork: parseHelloworkPage,
};

async function main() {
  const config = await loadConfig();
  const { sources, delayMinSeconds = 2, delayMaxSeconds = 5 } = config;
  const allNew = [];

  console.log('JobSniper — démarrage (1 page par source, délais 2–5 s)\n');

  const browser = await chromium.launch({ headless: true });

  try {
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      const parser = parsers[source.id];
      if (!parser) {
        console.warn(`Source inconnue: ${source.id}, ignorée.`);
        continue;
      }

      console.log(`[${i + 1}/${sources.length}] ${source.name}...`);
      const page = await browser.newPage();

      try {
        await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        const html = await page.content();
        const jobs = parser(html, source.id, source.url);
        const withMeta = jobs.map((j) => ({
          id: generateId(),
          title: j.title,
          company: j.company,
          link: j.link,
          source: source.id,
          scrapedAt: new Date().toISOString(),
        }));
        allNew.push(...withMeta);
        console.log(`  → ${withMeta.length} offres trouvées`);
      } finally {
        await page.close();
      }

      if (i < sources.length - 1) {
        const delay = delayMinSeconds + Math.random() * (delayMaxSeconds - delayMinSeconds);
        console.log(`  attente ${delay.toFixed(1)} s...`);
        await randomDelay(delayMinSeconds, delayMaxSeconds);
      }
    }
  } finally {
    await browser.close();
  }

  const existing = await loadJobs();
  const { jobs: merged, added } = mergeAndDeduplicate(existing, allNew);
  await saveJobs(merged);

  console.log(`\nTerminé. ${added} nouvelles offres, ${merged.length} au total (dédupliquées).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
