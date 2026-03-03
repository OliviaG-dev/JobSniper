# JobSniper — Guide du Scraper

## Architecture

```
jobsniper/
├── public/
│   └── jobs.json              ← Copie auto pour le frontend (lu par React)
├── scraper/
│   ├── config/
│   │   └── search-urls.json   ← Tes URLs de recherche filtrées
│   ├── sources/
│   │   ├── indeed.js          ← Parser HTML pour Indeed
│   │   ├── wtj.js             ← Parser HTML pour Welcome to the Jungle
│   │   └── hellowork.js       ← Parser HTML pour HelloWork
│   ├── data/
│   │   └── jobs.json          ← Offres stockées (fichier maître)
│   ├── debug-output/          ← HTML + screenshots sauvés par debug.js
│   ├── storage.js             ← Chargement / sauvegarde / déduplication
│   ├── run.js                 ← Point d'entrée principal
│   ├── debug.js               ← Script de debug visuel
│   └── package.json
└── src/
    └── pages/offres/          ← Frontend qui affiche les offres
```

---

## Flux complet : du scrape à l'affichage

```
npm run scrape
      │
      ▼
┌─────────────────────────────┐
│  1. Ouvre un navigateur      │
│     headless (Playwright)    │
└──────────────┬──────────────┘
               │
      ┌────────▼────────┐
      │  Pour chaque     │◄──── Indeed, WTJ, HelloWork
      │  source :        │
      │                  │
      │  • Visite l'URL  │
      │  • Cookies ✓     │
      │  • Scroll ✓      │
      │  • Récupère HTML │
      │  • Parse →       │
      │    titre,        │
      │    entreprise,   │
      │    lien,         │
      │    date publi    │
      │                  │
      │  Délai 2-5s ───►│ (entre chaque source)
      └────────┬────────┘
               │
      ┌────────▼────────────────┐
      │  2. Déduplication       │
      │  Compare par lien,      │
      │  garde les nouvelles    │
      └────────┬────────────────┘
               │
      ┌────────▼────────────────┐
      │  3. Sauvegarde          │
      │  scraper/data/jobs.json │
      └────────┬────────────────┘
               │
      ┌────────▼────────────────┐
      │  4. Copie automatique   │
      │  → public/jobs.json     │
      └────────┬────────────────┘
               │
      ┌────────▼────────────────┐
      │  5. Le frontend React   │
      │  lit public/jobs.json   │
      │  et affiche les offres  │
      └────────────────────────┘
```

**En résumé :** une seule commande `npm run scrape` fait tout — scrape, déduplique, sauvegarde, et copie vers le frontend.

---

## Les deux fichiers jobs.json

| Fichier                   | Rôle                                  | Qui l'écrit        | Qui le lit             |
| ------------------------- | ------------------------------------- | ------------------- | ---------------------- |
| `scraper/data/jobs.json`  | Fichier maître, toutes les offres     | `run.js` (scraper)  | `run.js` (pour dédupliquer) |
| `public/jobs.json`        | Copie pour le frontend                | `run.js` (copie auto) | React (`Offres.tsx`)   |

Pourquoi deux fichiers ? Le frontend (Vite/React) ne peut servir que les fichiers dans `public/`. Le scraper travaille dans son propre dossier `scraper/data/`. La copie automatique fait le pont.

---

## Comment l'utiliser

### Étape 1 — Personnaliser tes URLs

Ouvre `scraper/config/search-urls.json` et remplace les URLs par tes vraies recherches filtrées sur chaque site. Tu vas sur Indeed/WTJ/HelloWork, tu fais ta recherche (ex: "développeur frontend", "Paris"), et tu copies l'URL de la page de résultats.

### Étape 2 — Lancer le scrape

```bash
cd scraper
npm run scrape
```

Le script affiche :
```
JobSniper — démarrage

[1/3] Indeed France...
  cookies acceptés
  → 16 offres trouvées
  attente 4.2 s...
[2/3] Welcome to the Jungle...
  cookies acceptés
  → 28 offres trouvées
  attente 3.8 s...
[3/3] HelloWork...
  cookies acceptés
  → 30 offres trouvées

Terminé. 74 nouvelles offres, 74 au total.
Copié vers public/jobs.json
```

### Étape 3 — Voir les offres

Lance le frontend :
```bash
cd jobsniper
npm run dev
```

Va sur `http://localhost:5173/offres` pour voir toutes les offres avec recherche et filtres.

### Étape 4 — Automatiser (1x par jour)

**Windows (Planificateur de tâches) :**

1. Ouvrir le Planificateur de tâches
2. Créer une tâche : déclencher **Quotidien**, heure au choix (ex. 8h)
3. Action : **Démarrer un programme**
   - Programme : `node`
   - Arguments : `C:\Users\Olivia\Desktop\JobSniper\jobsniper\scraper\run.js`
   - Dossier de démarrage : `C:\Users\Olivia\Desktop\JobSniper\jobsniper\scraper`

**Linux / macOS (cron) :**

```bash
crontab -e
```

Ajouter :
```cron
0 8 * * * cd /chemin/vers/jobsniper/scraper && node run.js >> logs/cron.log 2>&1
```

---

## Debug

Si le scraper ne trouve plus d'offres sur un site :

```bash
cd scraper
npm run debug            # toutes les sources (navigateur visible)
npm run debug:wtj        # une source spécifique
npm run debug:indeed
npm run debug:hellowork
```

Le script ouvre un navigateur **visible**, navigue, et sauvegarde dans `debug-output/` :
- `{source}-screenshot.png` — capture d'écran
- `{source}-page.html` — HTML complet
- `{source}-results.json` — ce que le parser a trouvé

Tu peux ensuite ouvrir le HTML dans un navigateur et inspecter les sélecteurs CSS avec les DevTools.

---

## Données extraites par offre

Chaque offre dans `jobs.json` contient :

```json
{
  "id": "1740756231234-abc1234",
  "title": "Développeur Frontend Angular H/F",
  "company": "Alpes Contrôles",
  "link": "https://www.hellowork.com/emplois/123456.html",
  "source": "hellowork",
  "postedAt": "il y a 7 jours",
  "scrapedAt": "2026-02-28T14:23:51.234Z"
}
```

| Champ       | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `id`        | Identifiant unique généré (timestamp + random)               |
| `title`     | Titre du poste                                               |
| `company`   | Nom de l'entreprise                                          |
| `link`      | URL directe vers l'offre                                     |
| `source`    | Site d'origine (`indeed`, `wtj`, `hellowork`)                |
| `postedAt`  | Date de publication (ISO pour WTJ, texte pour HW, vide pour Indeed) |
| `scrapedAt` | Date/heure à laquelle l'offre a été scrapée                  |

---

## Points importants

- **Première page uniquement** : on ne pagine pas, c'est volontaire (ultra safe)
- **Pas de login** : on scrape que les pages publiques
- **Délais aléatoires** : 2–5 secondes entre les requêtes
- **Déduplication** : si tu lances le scrape plusieurs fois, les offres déjà connues ne sont pas dupliquées (comparaison par lien)
- **Sélecteurs fragiles** : les sites changent leur HTML de temps en temps — voir `docs/scraper-improvements.md` pour les sélecteurs actuels
- **Indeed** : le plus agressif contre le scraping, peut bloquer (403 / captcha). Le parser a 3 stratégies de fallback

---

## Pour aller plus loin

- **Ajouter une source** : créer un fichier dans `sources/`, l'importer dans `run.js`, ajouter l'URL dans `search-urls.json`
- **Notifications** : alertes (email, Discord) quand de nouvelles offres arrivent
- **Filtres avancés** : exclure certains mots-clés ou entreprises
