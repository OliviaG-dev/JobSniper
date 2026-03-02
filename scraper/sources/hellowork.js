/**
 * HelloWork — première page uniquement.
 * Extrait : titre, entreprise, lien.
 *
 * Structure réelle (vérifiée) :
 * - [data-cy="serpCard"]
 *   - a[data-cy="offerTitle"][href*="/emplois/"]
 *   - aria-label contient "chez {company}"
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
  const seen = new Set();

  $('[data-cy="serpCard"]').each((_, el) => {
    const $el = $(el);
    const a = $el.find('[data-cy="offerTitle"]').first();
    const href = a.attr('href');
    if (!href) return;

    const link = href.startsWith('http') ? href : new URL(href, base).href;
    if (seen.has(link)) return;
    seen.add(link);

    const title = a.attr('title')?.trim() || a.text().trim();
    const ariaLabel = a.attr('aria-label') || '';
    const companyMatch = ariaLabel.match(/chez\s+(.+?)(?:,|$)/);
    const company = companyMatch ? companyMatch[1].trim() : '—';

    const cardText = $el.text();
    const dateMatch = cardText.match(/il y a [^,\n]{2,25}/i);
    const postedAt = dateMatch ? dateMatch[0].trim() : '';

    if (!title || title.length < 3) return;
    jobs.push({ title, company, link, postedAt });
  });

  // Fallback : liens vers /emplois/XXXXX.html
  if (jobs.length === 0) {
    $('a[href*="/emplois/"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href || !href.match(/\/emplois\/\d+\.html/)) return;

      const link = href.startsWith('http') ? href : new URL(href, base).href;
      if (seen.has(link)) return;
      seen.add(link);

      const title = $el.attr('title')?.trim() || $el.text().trim();
      const ariaLabel = $el.attr('aria-label') || '';
      const companyMatch = ariaLabel.match(/chez\s+(.+?)(?:,|$)/);
      const company = companyMatch ? companyMatch[1].trim() : '—';

      if (!title || title.length < 3) return;
      jobs.push({ title, company, link, postedAt: '' });
    });
  }

  return jobs;
}
