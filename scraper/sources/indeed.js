/**
 * Indeed France — première page uniquement.
 * Extrait : titre, entreprise, lien.
 * Indeed est agressif contre le scraping ; les sélecteurs peuvent casser.
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

  const seen = new Set();

  // Stratégie 1 : data-jk (identifiant unique d'offre Indeed)
  $('[data-jk]').each((_, el) => {
    const $el = $(el);
    const jk = $el.attr('data-jk');
    if (seen.has(jk)) return;
    seen.add(jk);

    const titleEl = $el.find('h2 a, a.jcs-JobTitle, a[data-jk]').first();
    const title = titleEl.text().trim() || $el.find('h2').first().text().trim();
    const href = titleEl.attr('href');
    const company =
      $el.find('[data-testid="company-name"]').first().text().trim() ||
      $el.find('.companyName, .company_location .companyName').first().text().trim() ||
      $el.find('span[data-testid="company-name"]').first().text().trim();

    if (!title) return;
    const link = href
      ? (href.startsWith('http') ? href : new URL(href, base).href)
      : `https://fr.indeed.com/viewjob?jk=${jk}`;
    jobs.push({ title, company: company || '—', link, postedAt: '' });
  });

  // Stratégie 2 : .job_seen_beacon (fallback)
  if (jobs.length === 0) {
    $('.job_seen_beacon, .resultContent, .jobsearch-ResultsList > li').each((_, el) => {
      const $el = $(el);
      const a = $el.find('h2 a, a.jcs-JobTitle').first();
      const title = a.text().trim() || $el.find('h2').first().text().trim();
      const href = a.attr('href');
      const company =
        $el.find('[data-testid="company-name"]').first().text().trim() ||
        $el.find('.companyName').first().text().trim();
      if (!title || !href) return;
      const link = href.startsWith('http') ? href : new URL(href, base).href;
      if (seen.has(link)) return;
      seen.add(link);
      jobs.push({ title, company: company || '—', link, postedAt: '' });
    });
  }

  // Stratégie 3 : tous les liens vers /viewjob ou /rc/clk (dernier recours)
  if (jobs.length === 0) {
    $('a[href*="/viewjob"], a[href*="/rc/clk"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : new URL(href, base).href;
      if (seen.has(link)) return;
      seen.add(link);
      const title = $el.text().trim() || $el.closest('td, div').find('h2').first().text().trim();
      if (!title || title.length < 3) return;
      const company = $el.closest('td, div, li').find('.companyName, [data-testid="company-name"]').first().text().trim();
      jobs.push({ title, company: company || '—', link, postedAt: '' });
    });
  }

  return jobs;
}
