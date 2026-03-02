/**
 * JobSniper — Script de debug
 * Ouvre chaque source, accepte les cookies, scrolle,
 * sauvegarde le HTML + screenshot + résultat du parser.
 *
 * Usage : node debug.js
 * Usage ciblé : node debug.js indeed
 */

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseIndeedPage } from './sources/indeed.js';
import { parseWtjPage } from './sources/wtj.js';
import { parseHelloworkPage } from './sources/hellowork.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, 'config', 'search-urls.json');
const DEBUG_DIR = join(__dirname, 'debug-output');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const parsers = {
  indeed: parseIndeedPage,
  wtj: parseWtjPage,
  hellowork: parseHelloworkPage,
};

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
        console.log(`  cookies acceptés (${sel})`);
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

async function main() {
  const filter = process.argv[2];
  const raw = await readFile(CONFIG_PATH, 'utf-8');
  const config = JSON.parse(raw);
  let sources = config.sources;

  if (filter) {
    sources = sources.filter((s) => s.id === filter);
    if (sources.length === 0) {
      console.error(`Source "${filter}" non trouvée. Dispo : ${config.sources.map(s => s.id).join(', ')}`);
      process.exit(1);
    }
  }

  await mkdir(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });

  for (const source of sources) {
    console.log(`\n=== ${source.name} (${source.id}) ===`);
    console.log(`URL: ${source.url}\n`);

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      locale: 'fr-FR',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    try {
      await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await dismissCookies(page);

      try {
        for (let i = 0; i < 5; i++) {
          await page.evaluate(() => window.scrollBy(0, 400));
          await page.waitForTimeout(400);
        }
        await page.waitForTimeout(2000);
      } catch {
        console.log('  scroll échoué (page fermée ou redirigée)');
      }

      let html = '';
      try {
        const screenshotPath = join(DEBUG_DIR, `${source.id}-screenshot.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  screenshot → ${screenshotPath}`);

        html = await page.content();
        const htmlPath = join(DEBUG_DIR, `${source.id}-page.html`);
        await writeFile(htmlPath, html, 'utf-8');
        console.log(`  HTML (${(html.length / 1024).toFixed(0)} KB) → ${htmlPath}`);
      } catch {
        console.log('  impossible de capturer la page (blocage / captcha / redirection)');
      }

      if (html) {
        const parser = parsers[source.id];
        if (parser) {
          const jobs = parser(html, source.id, source.url);
          console.log(`  parser → ${jobs.length} offres trouvées`);
          if (jobs.length > 0) {
            console.log(`\n  Exemples :`);
            jobs.slice(0, 5).forEach((j, i) => {
              console.log(`    ${i + 1}. ${j.title}`);
              console.log(`       ${j.company}`);
              console.log(`       ${j.link}`);
            });
          } else {
            console.log('\n  Aucune offre trouvée — ouvre le HTML dans un navigateur pour inspecter les sélecteurs.');
          }

          const resultsPath = join(DEBUG_DIR, `${source.id}-results.json`);
          await writeFile(resultsPath, JSON.stringify(jobs, null, 2), 'utf-8');
          console.log(`\n  résultats → ${resultsPath}`);
        }
      }
    } catch (err) {
      console.log(`  ERREUR: ${err.message}`);
    } finally {
      try { await context.close(); } catch { /* ignore */ }
    }
  }

  await browser.close();
  console.log(`\nDebug terminé. Fichiers dans : ${DEBUG_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
