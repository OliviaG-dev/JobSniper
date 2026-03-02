/**
 * Welcome to the Jungle — première page uniquement.
 * Extrait : titre, entreprise, lien.
 *
 * Structure réelle (vérifiée) :
 * - li[data-testid="search-results-list-item-wrapper"]
 *   - a[aria-label][href*="companies"][href*="jobs"]
 *   - div[data-testid="job-thumb-..."]
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
  const seen = new Set();

  $('[data-testid="search-results-list-item-wrapper"]').each((_, el) => {
    const $el = $(el);

    const a = $el.find('a[role="link"]').first();
    const href = a.attr('href');
    if (!href || !href.includes('/jobs/')) return;

    const link = href.startsWith('http') ? href : new URL(href, base).href;
    if (seen.has(link)) return;
    seen.add(link);

    const ariaLabel = a.attr('aria-label') || '';
    const title = ariaLabel.replace(/^Consultez l'offre\s*/i, '').trim() ||
                  $el.find('h3, h4').first().text().trim() ||
                  a.text().trim().split('\n').map(s => s.trim()).filter(Boolean)[0] || '';

    const companyImg = $el.find('img').first();
    const company = companyImg.attr('alt')?.trim() || '—';

    const timeEl = $el.find('time').first();
    const postedAt = timeEl.attr('datetime') || '';

    if (!title || title.length < 3) return;
    jobs.push({ title, company, link, postedAt });
  });

  // Fallback : chercher directement les liens vers companies/jobs
  if (jobs.length === 0) {
    $('a[role="link"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href || !href.includes('companies') || !href.includes('jobs')) return;

      const link = href.startsWith('http') ? href : new URL(href, base).href;
      if (seen.has(link)) return;
      seen.add(link);

      const ariaLabel = $el.attr('aria-label') || '';
      const title = ariaLabel.replace(/^Consultez l'offre\s*/i, '').trim() ||
                    $el.text().trim().slice(0, 120);
      if (!title || title.length < 3) return;
      jobs.push({ title, company: '—', link, postedAt: '' });
    });
  }

  return jobs;
}
