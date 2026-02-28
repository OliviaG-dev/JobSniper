/**
 * Welcome to the Jungle — première page uniquement.
 * Extrait : titre, entreprise, lien.
 */

import * as cheerio from 'cheerio';

/**
 * @param {string} html
 * @param {string} sourceId
 * @param {string} baseUrl
 * @returns {{ title: string, company: string, link: string }[]}
 */
export function parseWtjPage(html, sourceId, baseUrl) {
  const $ = cheerio.load(html);
  const jobs = [];
  const base = new URL(baseUrl);

  $('a[href*="/fr/companies/"][href*="/jobs/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    if (!href) return;
    const link = href.startsWith('http') ? href : new URL(href, base).href;
    const title = $el.find('h3, [class*="title"], [class*="Title"]').first().text().trim() || $el.text().trim().split('\n')[0]?.trim();
    const company = $el.find('[class*="company"], [class*="Company"]').first().text().trim() || '—';
    if (!title && !link.includes('/jobs/')) return;
    jobs.push({ title: title || 'Offre', company, link });
  });

  if (jobs.length === 0) {
    $('a[href*="/jobs/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href || !href.includes('/fr/')) return;
      const link = href.startsWith('http') ? href : new URL(href, base).href;
      const title = $el.find('h3, h4').first().text().trim() || $el.text().trim().slice(0, 80);
      const company = $el.find('[class*="company"]').first().text().trim() || '—';
      jobs.push({ title: title || 'Offre', company, link });
    });
  }

  return jobs;
}
