/**
 * HelloWork — première page uniquement.
 * Extrait : titre, entreprise, lien.
 */

import * as cheerio from 'cheerio';

/**
 * @param {string} html
 * @param {string} sourceId
 * @param {string} baseUrl
 * @returns {{ title: string, company: string, link: string }[]}
 */
export function parseHelloworkPage(html, sourceId, baseUrl) {
  const $ = cheerio.load(html);
  const jobs = [];
  const base = new URL(baseUrl);

  $('a[href*="hellowork.com"][href*="emploi"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    if (!href) return;
    const link = href.startsWith('http') ? href : new URL(href, base).href;
    const title = $el.find('h2, h3, .title, [class*="offer-title"]').first().text().trim() || $el.text().trim().slice(0, 100);
    const company = $el.find('[class*="company"], [class*="employer"]').first().text().trim() || '—';
    jobs.push({ title: title || 'Offre', company, link });
  });

  if (jobs.length === 0) {
    $('article a[href*="emploi"], .offer a[href*="emploi"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : new URL(href, base).href;
      const title = $el.text().trim().slice(0, 120) || 'Offre';
      jobs.push({ title, company: '—', link });
    });
  }

  return jobs;
}
