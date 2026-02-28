# JobSniper

**Arrête de chercher. Commence à sniper.**

JobSniper traque les offres d’emploi pour toi : surveillance automatique (Indeed, Welcome to the Jungle, HelloWork), stockage et déduplication, première page par source, une fois par jour.

---

## Structure du projet

- **`/`** — Frontend (landing + future app) — Vite + React + TypeScript
- **`/scraper/`** — Script Node qui scrape les pages publiques, stocke et déduplique les offres

## Stratégie « ultra safe »

- ✅ URLs de recherche déjà filtrées (ex. développeur python + remote + région)
- ✅ Scrape **une seule page** par source, **1 fois par jour**
- ✅ Données extraites : **titre + entreprise + lien** uniquement
- ✅ Stockage JSON + déduplication par lien
- ✅ Délais aléatoires 2–5 s entre chaque requête
- ❌ Pas de profils recruteurs, pas de pages entreprises en masse, pas de données derrière login

---

## Lancer le frontend (landing)

```bash
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

---

## Lancer le scraper

### 1. Installer les dépendances du scraper

```bash
cd scraper
npm install
npx playwright install chromium
```

### 2. Configurer tes URLs de recherche

Édite `scraper/config/search-urls.json` et mets tes vrais liens de recherche (Indeed, WTJ, HelloWork) déjà filtrés (poste, lieu, télétravail, etc.).

### 3. Lancer une exécution

```bash
cd scraper
npm run scrape
```

Les offres sont enregistrées dans `scraper/data/jobs.json` (dédupliquées par lien).

---

## Lancer le scraper 1 fois par jour (cron)

### Windows (Task Scheduler)

1. Ouvrir **Planificateur de tâches**
2. Créer une tâche : déclencher **Quotidien**, heure au choix (ex. 8h)
3. Action : **Démarrer un programme**
   - Programme : `node`
   - Arguments : `C:\chemin\vers\jobsniper\scraper\run.js`
   - Dossier de démarrage : `C:\chemin\vers\jobsniper\scraper`

### Linux / macOS (cron)

```bash
crontab -e
```

Ajouter une ligne (ex. tous les jours à 8h) :

```cron
0 8 * * * cd /chemin/vers/jobsniper/scraper && node run.js >> /chemin/vers/jobsniper/scraper/logs/cron.log 2>&1
```

Créer le dossier `scraper/logs` si besoin.

---

## Fichiers importants

| Fichier | Rôle |
|--------|------|
| `scraper/config/search-urls.json` | URLs de recherche et délais |
| `scraper/run.js` | Point d’entrée du scraper |
| `scraper/storage.js` | Chargement / sauvegarde / déduplication |
| `scraper/data/jobs.json` | Offres stockées (créé au premier run) |
| `src/App.tsx` + `App.css` | Landing page JobSniper |

---

## Licence

Projet personnel. Utilisation des sites concernés soumise à leurs conditions d’utilisation et bonnes pratiques (scraping léger, 1×/jour, pas de login).
