/**
 * Indeed France — première page uniquement.
 * Extrait : titre, entreprise, lien.
 */

import * as cheerio from 'cheerio';

/**
 * @param {string} html
 * @param {string} sourceId
 * @param {string} baseUrl
 * @returns {{ title: string, company: string, link: string }[]}
 */
export function parseIndeedPage(html, sourceId, baseUrl) {
  const $ = cheerio.load(html);
  const jobs = [];
  const base = new URL(baseUrl);

  // Indeed: cartes d'offres (structure peut varier)
  $('[data-jk]').each((_, el) => {
    const $el = $(el);
    const jk = $el.attr('data-jk');
    const titleEl = $el.find('h2.jobTitle a, a[data-jk]').first();
    const title = titleEl.text().trim();
    const href = titleEl.attr('href');
    const companyEl = $el.find('[data-testid="company-name"]').first();
    const company = companyEl.length ? companyEl.text().trim() : $el.find('.companyName').first().text().trim();

    if (!title || !href) return;
    const link = href.startsWith('http') ? href : new URL(href, base).href;
    jobs.push({ title, company: company || '—', link });
  });

  // Fallback: sélecteurs alternatifs
  if (jobs.length === 0) {
    $('.job_seen_beacon, .jobsearch-ResultsList li').each((_, el) => {
      const $el = $(el);
      const a = $el.find('h2 a, a.jcs-JobTitle').first();
      const title = a.text().trim();
      const href = a.attr('href');
      const company = $el.find('.companyName, [data-testid="company-name"]').first().text().trim();
      if (!title || !href) return;
      const link = href.startsWith('http') ? href : new URL(href, base).href;
      jobs.push({ title, company: company || '—', link });
    });
  }

  return jobs;
}
