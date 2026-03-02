/**
 * JobSniper — Scraper ultra safe
 * - 1ère page par source
 * - Titre + entreprise + lien uniquement
 * - Délai aléatoire 2–5 s entre requêtes
 * - Stockage + déduplication par lien
 * - Gestion cookies, scroll, user-agent réaliste
 */

import { chromium } from 'playwright';
import { readFile, copyFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadJobs, mergeAndDeduplicate, saveJobs } from './storage.js';
import { parseIndeedPage } from './sources/indeed.js';
import { parseWtjPage } from './sources/wtj.js';
import { parseHelloworkPage } from './sources/hellowork.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config', 'search-urls.json');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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

async function dismissCookies(page) {
  const selectors = [
    'button#onetrust-accept-btn-handler',
    'button[id*="accept"]',
    'button[id*="Accept"]',
    'button[data-testid*="accept"]',
    'button[class*="accept"]',
    'button[class*="consent"]',
    'button:has-text("Tout accepter")',
    'button:has-text("Accepter")',
    'button:has-text("J\'accepte")',
    'button:has-text("Accept")',
    'button:has-text("Continuer")',
  ];

  for (const sel of selectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1500 })) {
        await btn.click();
        await page.waitForTimeout(1000);
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 300;
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, distance);
      await new Promise((r) => setTimeout(r, delay));
    }
  });
  await page.waitForTimeout(1500);
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

  console.log('JobSniper — démarrage\n');

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
      const context = await browser.newContext({
        userAgent: USER_AGENT,
        locale: 'fr-FR',
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();

      try {
        await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        const dismissed = await dismissCookies(page);
        if (dismissed) console.log('  cookies acceptés');

        await autoScroll(page);

        const html = await page.content();
        const jobs = parser(html, source.id, source.url);
        const withMeta = jobs.map((j) => ({
          id: generateId(),
          title: j.title,
          company: j.company,
          link: j.link,
          source: source.id,
          postedAt: j.postedAt || '',
          scrapedAt: new Date().toISOString(),
        }));
        allNew.push(...withMeta);
        console.log(`  → ${withMeta.length} offres trouvées`);
      } finally {
        await context.close();
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

  const src = join(__dirname, 'data', 'jobs.json');
  const dest = join(__dirname, '..', 'public', 'jobs.json');
  await copyFile(src, dest);

  console.log(`\nTerminé. ${added} nouvelles offres, ${merged.length} au total.`);
  console.log(`Copié vers public/jobs.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
