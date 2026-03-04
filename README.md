# JobSniper

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)
![Cheerio](https://img.shields.io/badge/Cheerio-ffaa33?style=for-the-badge)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

**Arrête de chercher. Commence à sniper.**

JobSniper est un petit outil perso qui :
- **scrape** les offres d’emploi (Indeed, Welcome to the Jungle, HelloWork),
- les **déduplique** et les stocke dans un JSON,
- les expose dans une **interface React** avec recherche, filtres, pagination,
- permet un **suivi de candidatures léger** (checkbox « postulée » + page dédiée).


---

## Stack

- **Frontend**  
  - React 19 (`react`, `react-dom`)  
  - TypeScript  
  - Vite  
  - React Router  
  - ESLint + TypeScript ESLint

- **Scraper**  
  - Node.js (ES modules)  
  - Playwright (Chromium headless)  
  - Cheerio (parsing HTML)  
  - JSON + déduplication maison

---

## Structure du projet

- **`/`** — Frontend (landing + pages d’offres / postulées).
  - `src/pages/home/Home.tsx` : landing page JobSniper.
  - `src/pages/offres/Offres.tsx` : liste des offres avec recherche, filtres, pagination, suivi par checkbox.
  - `src/pages/postule/Postule.tsx` : page « Postulées » qui lit les offres marquées dans `localStorage`.
- **`/scraper/`** — Mini-projet Node pour le scraping.
  - `run.js` : point d’entrée, lance Playwright sur chaque source.
  - `sources/*.js` : parseurs HTML (Indeed, WTJ, HelloWork).
  - `storage.js` : chargement, sauvegarde, déduplication.
  - `data/jobs.json` : fichier maître des offres (généré).


---

## Stratégie de scraping « ultra safe »

- **Sources** : pages publiques de résultats de recherche (pas de login).
- **Portée** :
  - 1ère page par source (pas de pagination profonde).
  - Données extraites : **titre**, **entreprise**, **lien**, **source**, dates.
- **Politesse** :
  - Délais aléatoires 2–5 s entre sources.
  - User-Agent réaliste, gestion des bannières cookies, scroll doux.
- **Stockage** :
  - JSON unique (`scraper/data/jobs.json`) avec **déduplication par lien**.
  - Copie vers `public/jobs.json` pour le frontend.

---

## Lancer le frontend

Depuis la racine du projet :

```bash
npm install
npm run dev
```
---

## Lancer le scraper



```bash
cd scraper


### 3. Lancer un scrape manuel

```bash
cd scraper
npm run scrape
```

À la fin :
- `scraper/data/jobs.json` est mis à jour (avec déduplication).
- `public/jobs.json` est recopié pour le frontend.

---



## Notes & limites

- **Respect des sites** : le scraper reste volontairement limité (1 page, 1×/jour, pas de login).
- **Pas d’intégration LinkedIn** : volontairement exclu (conditions d’utilisation + anti-bot agressifs).
- **Persistance du suivi** : l’état « postulée » est stocké côté navigateur via `localStorage` (pas de backend pour l’instant).

---

## Licence

Projet personnel. L’utilisation des sites scrapés reste soumise à **leurs propres conditions d’utilisation**. Utiliser avec parcimonie (scraping léger, 1×/jour, pas de zones privées). 
