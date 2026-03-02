# Quick Start: Inspect Welcome to the Jungle

## TL;DR - Run These Commands

```bash
cd scraper

# Step 1: Find which URL works
node test-wtj-urls.js

# Step 2: Inspect HTML structure  
node inspect-wtj.js

# Step 3: Update sources/wtj.js with found selectors

# Step 4: Test it
npm run scrape
```

---

## What Each Script Does

### `test-wtj-urls.js`
✅ Tests 4 URL variations  
✅ Shows which one returns jobs  
✅ Recommends best URL to use  
⏱️ Takes ~30 seconds

### `inspect-wtj.js`
✅ Opens browser (visible)  
✅ Handles cookie popup  
✅ Takes screenshot  
✅ Saves HTML file  
✅ Prints selectors to console  
✅ Keeps browser open 30s for manual check  
⏱️ Takes ~1 minute

---

## What to Look For

After running `inspect-wtj.js`, find these in the console output:

```
Job Card #1:
  Title: "Développeur Front-End React"        ← The job title text
  Company: "Acme Corp"                        ← Company name
  Link: /fr/companies/acme/jobs/dev-frontend  ← URL pattern
  Link classes: sc-abc123 xyz456              ← CSS classes
  Parent classes: job-card result-item        ← Parent container classes
```

**Use this info to update `sources/wtj.js`**

---

## Files You'll Get

- 📸 `wtj-screenshot.png` - Visual proof
- 📄 `wtj-page.html` - Full HTML source  
- 📝 Console output - Selector recommendations

---

## Example: Updating the Parser

**Before** (generic):
```javascript
$('a[href*="/jobs/"]').each((_, el) => {
  const title = $el.find('h3').text().trim();
  // ...
});
```

**After** (with exact selectors from inspector):
```javascript
$('article[class*="job-card"]').each((_, el) => {
  const $link = $(el).find('a[href*="/jobs/"]').first();
  const title = $link.find('h3[class*="title"]').text().trim();
  const company = $(el).find('span[class*="company"]').text().trim();
  // ...
});
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No jobs found" | Run `test-wtj-urls.js` first |
| Cookie popup not handled | Manually click during 30s wait |
| Wrong data extracted | Check `wtj-page.html` in browser |
| Script crashes | Install dependencies: `npm install` |

---

## Need Help?

1. Run both scripts
2. Share the console output
3. Attach `wtj-screenshot.png` or `wtj-page.html`

Read full guide: `HOW-TO-INSPECT-WTJ.md`
