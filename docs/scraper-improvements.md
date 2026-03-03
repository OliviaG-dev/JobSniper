# JobSniper — Améliorations du scraping par site

Ce document détaille les problèmes rencontrés sur chaque source et les solutions mises en place pour obtenir un scraping fiable.

---

## 1. Problèmes initiaux

Le scraper de base utilisait des sélecteurs CSS génériques (`h2 a`, `.company`, etc.) qui ne correspondaient pas à la structure réelle des pages. Résultats :

- **Welcome to the Jungle** : 0 offres trouvées, ou des titres génériques "Offre"
- **HelloWork** : 3 résultats qui étaient en fait des liens de navigation (`/emploi.html`, `/index-categorie.html`), pas de vraies offres
- **Indeed** : fonctionnait partiellement mais instable (blocage 403, anti-bot)

---

## 2. Méthode de debug

Un script `debug.js` a été créé pour inspecter le HTML réel rendu par chaque site :

1. Ouvre un navigateur **non-headless** (visible) via Playwright
2. Navigue vers chaque URL de recherche
3. Accepte les cookies automatiquement
4. Scrolle la page pour déclencher le contenu lazy-loaded
5. Sauvegarde dans `scraper/debug-output/` :
   - `{source}-screenshot.png` — capture d'écran complète
   - `{source}-page.html` — HTML complet de la page
   - `{source}-results.json` — résultat du parser actuel

**Usage :**
```
npm run debug            # toutes les sources
npm run debug:wtj        # une source spécifique
```

Des scripts d'inspection ad hoc (`inspect-html.js`, `inspect-hw.js`) ont ensuite été utilisés pour analyser le HTML sauvegardé avec Cheerio et identifier les bons sélecteurs CSS.

---

## 3. Welcome to the Jungle

### Structure HTML découverte

```html
<li data-testid="search-results-list-item-wrapper">
  <a role="link" aria-label="Consultez l'offre Développeur Front-end..." href="/fr/companies/.../jobs/...">
    ...
  </a>
  <img alt="NomEntreprise" src="..." />
  <time datetime="2026-02-26T15:29:04Z">il y a 4 jours</time>
</li>
```

### Sélecteurs utilisés

| Donnée      | Sélecteur / Méthode                                       |
| ----------- | ---------------------------------------------------------- |
| Carte       | `[data-testid="search-results-list-item-wrapper"]`         |
| Lien        | `a[role="link"]` → attribut `href` (filtré sur `/jobs/`)   |
| Titre       | `a[role="link"]` → attribut `aria-label`, nettoyé du préfixe "Consultez l'offre" |
| Entreprise  | Premier `<img>` de la carte → attribut `alt`               |
| Date publi  | `<time>` → attribut `datetime` (date ISO)                  |

### Fallback

Si aucune carte `data-testid` n'est trouvée, le parser cherche tous les `a[role="link"]` dont le `href` contient `/companies/` et `/jobs/`.

---

## 4. HelloWork

### Structure HTML découverte

```html
<div data-cy="serpCard">
  <a data-cy="offerTitle" href="/emplois/123456.html" title="Développeur Frontend Angular H/F" aria-label="Développeur Frontend Angular H/F chez NomEntreprise, ...">
    ...
  </a>
  <span>...il y a 7 jours...</span>
</div>
```

### Sélecteurs utilisés

| Donnée      | Sélecteur / Méthode                                       |
| ----------- | ---------------------------------------------------------- |
| Carte       | `[data-cy="serpCard"]`                                     |
| Lien        | `[data-cy="offerTitle"]` → attribut `href`                 |
| Titre       | `[data-cy="offerTitle"]` → attribut `title` ou `.text()`   |
| Entreprise  | Attribut `aria-label` → regex `chez (.+?)(?:,\|$)` pour extraire le nom |
| Date publi  | Texte complet de la carte → regex `il y a [^,\n]{2,25}`   |

### Fallback

Si aucune carte `data-cy="serpCard"` n'est trouvée, le parser cherche tous les `a[href*="/emplois/"]` dont le href matche `/emplois/\d+\.html`.

### Piège évité

Les premiers sélecteurs remontaient des liens de navigation (`/emploi.html`, `/index-categorie.html`) au lieu des vraies offres. Le sélecteur `data-cy="serpCard"` garantit qu'on cible uniquement les cartes de résultats.

---

## 5. Indeed

### Particularités

Indeed est le site le plus agressif contre le scraping :
- Blocage 403 fréquent
- Redirection vers des pages CAPTCHA
- Structure HTML qui change régulièrement

### Stratégie multi-fallback (3 niveaux)

| Stratégie | Sélecteur                                        | Quand                           |
| --------- | ------------------------------------------------ | ------------------------------- |
| 1         | `[data-jk]` (identifiant unique d'offre Indeed)  | Structure normale               |
| 2         | `.job_seen_beacon`, `.resultContent`              | Structure alternative           |
| 3         | `a[href*="/viewjob"], a[href*="/rc/clk"]`        | Dernier recours, tous les liens |

### Extraction des données

| Donnée      | Méthode                                                              |
| ----------- | -------------------------------------------------------------------- |
| Titre       | `h2 a` ou `a.jcs-JobTitle` → `.text()`                              |
| Entreprise  | `[data-testid="company-name"]` ou `.companyName`                     |
| Lien        | `href` du lien titre, ou construction manuelle `viewjob?jk={id}`    |
| Date publi  | Non disponible dans le HTML rendu (champ vide)                       |

### Mesures anti-blocage

Implémentées dans `run.js` et `debug.js` :

- **User-Agent réaliste** : Chrome 131 sur Windows 10
- **Locale française** : `fr-FR`
- **Viewport desktop** : 1440×900
- **Gestion des cookies** : 10 sélecteurs testés séquentiellement pour les bannières de consentement
- **Auto-scroll** : 5 scrolls de 400px avec délais pour simuler un humain
- **Délai aléatoire** : 2 à 5 secondes entre chaque source
- **Try/catch robuste** : si Indeed bloque, le scraper log l'erreur et continue avec les autres sources

---

## 6. Extraction des dates de publication

Ajoutée après la stabilisation des parsers. Chaque offre inclut un champ `postedAt` :

| Source     | Format récupéré                         | Exemple                      |
| ---------- | --------------------------------------- | ---------------------------- |
| WTJ        | Date ISO depuis `<time datetime="...">` | `2026-02-26T15:29:04Z`       |
| HelloWork  | Texte relatif via regex                 | `il y a 7 jours`             |
| Indeed     | Non disponible                          | _(champ vide)_               |

Sur le frontend, la fonction `timeAgo()` convertit ces valeurs en affichage relatif : `il y a 30s`, `il y a 5min`, `il y a 3h`, `il y a 2j`.

---

## 7. Résumé des fichiers modifiés

| Fichier                         | Rôle                                              |
| ------------------------------- | ------------------------------------------------- |
| `scraper/sources/wtj.js`        | Parser WTJ avec sélecteurs validés + date          |
| `scraper/sources/hellowork.js`  | Parser HelloWork avec sélecteurs validés + date    |
| `scraper/sources/indeed.js`     | Parser Indeed avec 3 stratégies fallback           |
| `scraper/run.js`                | Script principal avec anti-bot et champ `postedAt` |
| `scraper/debug.js`              | Script de debug avec sauvegarde HTML/screenshot    |
| `src/pages/offres/Offres.tsx`   | Affichage des dates publi + scraping sur le frontend |
