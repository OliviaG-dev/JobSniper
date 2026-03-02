# How to Inspect Welcome to the Jungle HTML Structure

## Problem

Welcome to the Jungle is a JavaScript-heavy single-page application (SPA). Job listings are loaded dynamically, so you need to:
1. Use a headless browser (Playwright) to render JavaScript
2. Handle cookie consent popups
3. Wait for content to load
4. Extract the correct HTML selectors

## Solution: Use the Provided Inspector Scripts

I've created two helper scripts to solve this:

---

## Script 1: Test Which URL Works

**File**: `test-wtj-urls.js`

**Purpose**: Test different search URL formats to find one that actually returns job listings.

### Run it:

```bash
cd scraper
node test-wtj-urls.js
```

### What it does:

- Tests 4 different URL variations (from specific to general)
- Checks if each URL returns actual job listings or "no results"
- Shows you which URL has the most jobs
- Recommends the best URL to use

### Why this matters:

Your current URL might be too restrictive and returns zero results. This script helps you find a working URL.

---

## Script 2: Inspect HTML Structure

**File**: `inspect-wtj.js`

**Purpose**: Once you have a working URL, this script analyzes the HTML structure to find the exact selectors.

### Run it:

```bash
cd scraper
node inspect-wtj.js
```

### What it does:

1. Opens a visible browser window
2. Navigates to your WTJ search URL
3. Auto-clicks cookie consent popup
4. Waits for jobs to load (5 seconds)
5. Takes a screenshot: `wtj-screenshot.png`
6. Saves full HTML: `wtj-page.html`
7. Analyzes structure and prints findings
8. Keeps browser open 30s for manual inspection

### Output you'll see:

```
🔍 Inspecting Welcome to the Jungle page structure...

📄 Navigating to: https://...
🍪 Checking for cookie consent popup...
  ✓ Found cookie button with selector: button[id*="accept"]
  ✓ Clicked accept cookies
⏳ Waiting for job listings to load...
📸 Screenshot saved to: scraper/wtj-screenshot.png

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Job Card #1:
  Title: Développeur Front-End React
  Company: MyCompany
  Link: /fr/companies/mycompany/jobs/developpeur-frontend_paris
  Link classes: sc-fXazdy gdKQWZ
  Parent classes: sc-aRdvM jTYxPP

Job Card #2:
  ...
```

---

## Step-by-Step Workflow

### Step 1: Find a Working URL

```bash
node test-wtj-urls.js
```

**Look for**: The URL that returns the most job listings.

**Update**: Copy that URL to `config/search-urls.json` (replace the current WTJ URL).

### Step 2: Inspect the HTML Structure

```bash
node inspect-wtj.js
```

**Look for**:
- What tag wraps each job? (`<li>`, `<a>`, `<article>`, `<div>`?)
- What classes or data attributes identify it?
- Where is the title? (`<h3>`, `<h2>`, `[class*="title"]`?)
- Where is the company? (`<span>`, `[class*="company"]`?)
- Where is the link? (usually the parent `<a>` tag)

### Step 3: Update the Parser

Open `sources/wtj.js` and update the selectors based on what you found.

**Current parser** (generic fallback):

```javascript
$('a[href*="/fr/companies/"][href*="/jobs/"]').each((_, el) => {
  const $el = $(el);
  const href = $el.attr('href');
  const title = $el.find('h3, [class*="title"]').first().text().trim();
  const company = $el.find('[class*="company"]').first().text().trim();
  // ...
});
```

**Updated parser** (with exact selectors):

```javascript
// Example: If you find job cards are <article> with class "job-result"
$('article.job-result').each((_, el) => {
  const $el = $(el);
  const $link = $el.find('a[href*="/jobs/"]').first();
  const href = $link.attr('href');
  const title = $link.find('h3.job-title').text().trim();
  const company = $el.find('span.company-name').text().trim();
  // ...
});
```

### Step 4: Test Your Updated Parser

```bash
npm run scrape
```

**Expected output**:

```
[2/3] Welcome to the Jungle...
  → 25 offres trouvées
```

If you see `→ 0 offres trouvées`, your selectors need adjustment.

---

## Common Welcome to the Jungle Patterns

Based on typical job board structures, look for:

### Pattern 1: Job Cards as List Items

```html
<ul class="jobs-list">
  <li class="job-card">
    <a href="/fr/companies/acme/jobs/dev-frontend">
      <h3 class="job-title">Développeur Front-End</h3>
      <span class="company-name">Acme Corp</span>
    </a>
  </li>
</ul>
```

**Selectors**:
- Container: `li.job-card` or `ul.jobs-list > li`
- Link: `a[href*="/jobs/"]`
- Title: `h3.job-title` or `a h3`
- Company: `span.company-name`

### Pattern 2: Job Cards as Article Elements

```html
<article data-testid="job-card">
  <a href="/fr/companies/acme/jobs/dev-frontend">
    <div class="content">
      <h2>Développeur Front-End</h2>
      <div class="company">Acme Corp</div>
    </div>
  </a>
</article>
```

**Selectors**:
- Container: `article[data-testid="job-card"]`
- Link: `article a[href*="/jobs/"]`
- Title: `article h2` or `article [class*="title"]`
- Company: `article [class*="company"]`

### Pattern 3: Everything is a Link

```html
<a href="/fr/companies/acme/jobs/dev-frontend" class="job-link">
  <h3>Développeur Front-End</h3>
  <span>Acme Corp</span>
</a>
```

**Selectors**:
- Link: `a[href*="/fr/companies/"][href*="/jobs/"]`
- Title: `a h3` or `a [class*="title"]`
- Company: `a span` or `a [class*="company"]`

---

## Troubleshooting

### "No jobs found" after running inspector

**Possible causes**:
1. **Search is too restrictive** → Run `test-wtj-urls.js` to find a working URL
2. **Page needs more time** → Increase wait time in `inspect-wtj.js` (line with `waitForTimeout`)
3. **Anti-scraping protection** → Try with a different user-agent or from a different IP

### Cookie popup isn't handled

The script tries multiple selectors. If none work:
1. During the 30-second wait, manually click the popup
2. Inspect the button with DevTools
3. Add the selector to the `cookieSelectors` array in `inspect-wtj.js`

### Parser extracts wrong data

Use the `wtj-page.html` file:
1. Open it in your browser
2. Use DevTools to search for a job title you saw on the live page
3. Look at the HTML structure around it
4. Update selectors in `sources/wtj.js` accordingly

---

## Files Created

After running the scripts, you'll have:

- `test-wtj-urls.js` - URL tester
- `inspect-wtj.js` - HTML inspector
- `wtj-screenshot.png` - Visual confirmation of the page
- `wtj-page.html` - Full HTML source to analyze
- `INSPECT-WTJ-README.md` - Quick reference guide (this file)

---

## Next Steps

1. ✅ Run `test-wtj-urls.js` to find a working URL
2. ✅ Update `config/search-urls.json` with that URL
3. ✅ Run `inspect-wtj.js` to find HTML selectors
4. ✅ Update `sources/wtj.js` with exact selectors
5. ✅ Test with `npm run scrape`
6. ✅ Check `data/jobs.json` for scraped results

---

## Manual Inspection Tips

If the scripts don't give you enough info:

1. **Open the URL in your browser**
2. **Open DevTools** (F12)
3. **Right-click on a job card** → "Inspect"
4. **Look at the HTML structure**:
   - What's the parent container?
   - What classes or data attributes are used?
   - Where's the link, title, and company within that structure?
5. **Test selectors in Console**:
   ```javascript
   document.querySelectorAll('your-selector')
   ```
6. **Copy the working selector** to `sources/wtj.js`

---

## Questions?

If you're still stuck after running both scripts:

1. Share the console output from `inspect-wtj.js`
2. Share the `wtj-page.html` file (or a snippet)
3. Share a screenshot showing what you see manually vs. what the scraper extracts

The scripts should give you everything you need to identify the correct selectors!
