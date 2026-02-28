/**
 * Stockage et déduplication des offres (JSON).
 * Clé de déduplication : lien de l'offre.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const JOBS_FILE = join(DATA_DIR, 'jobs.json');

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} company
 * @property {string} link
 * @property {string} source
 * @property {string} scrapedAt
 */

/**
 * @returns {Promise<Job[]>}
 */
export async function loadJobs() {
  try {
    const raw = await readFile(JOBS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data.jobs) ? data.jobs : [];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

/**
 * Déduplique par `link`, ajoute les nouvelles, conserve les existantes.
 * @param {Job[]} existing
 * @param {Job[]} newJobs
 * @returns {{ jobs: Job[], added: number }}
 */
export function mergeAndDeduplicate(existing, newJobs) {
  const byLink = new Map(existing.map((j) => [j.link, j]));
  let added = 0;
  for (const job of newJobs) {
    if (!byLink.has(job.link)) {
      byLink.set(job.link, job);
      added++;
    }
  }
  return { jobs: [...byLink.values()], added };
}

/**
 * @param {Job[]} jobs
 */
export async function saveJobs(jobs) {
  await mkdir(DATA_DIR, { recursive: true });
  const data = { updatedAt: new Date().toISOString(), jobs };
  await writeFile(JOBS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
