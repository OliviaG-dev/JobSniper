# Welcome to the Jungle HTML Inspector - Summary

## What I've Created for You

Since I cannot directly use browser automation tools in this chat environment, I've created a complete set of tools that you can run locally to inspect the Welcome to the Jungle page and get the exact HTML selectors you need.

---

## 📦 Files Created

### 1. **`test-wtj-urls.js`** - URL Validator
**Purpose**: Test which search URL actually returns job listings  
**Why**: Your current URL might be too restrictive and return zero results

**Run**: `node test-wtj-urls.js`

**Output**: 
- Tests 4 URL variations (specific → general)
- Shows job count for each
- Recommends best URL to use

---

### 2. **`inspect-wtj.js`** - HTML Structure Inspector
**Purpose**: Analyze the page structure to find exact selectors  
**Why**: WTJ is JavaScript-heavy; you need to render it to see the real HTML

**Run**: `node inspect-wtj.js`

**Output**:
- Console: Detailed selector analysis
- `wtj-screenshot.png`: Visual confirmation
- `wtj-page.html`: Full HTML source for manual inspection
- Browser stays open 30s for manual DevTools inspection

**What it analyzes**:
- ✅ Job card container (tag, classes, data attributes)
- ✅ Job title location and selectors
- ✅ Company name location and selectors  
- ✅ Job link pattern and href structure
- ✅ Sample data extraction (first 3 jobs)

---

### 3. **`HOW-TO-INSPECT-WTJ.md`** - Complete Guide
**Purpose**: Step-by-step instructions with troubleshooting  
**Includes**:
- Detailed workflow (URL testing → inspection → parser update → testing)
- Common HTML patterns to look for
- Troubleshooting section
- Manual inspection tips
- Example selector updates

---

### 4. **`QUICK-START-WTJ.md`** - Quick Reference
**Purpose**: Fast cheat sheet for when you need a reminder  
**Includes**:
- Commands to run
- What to look for in output
- Before/after parser examples
- Troubleshooting table

---

## 🚀 How to Use (Step by Step)

### Step 1: Test URLs
```bash
cd scraper
node test-wtj-urls.js
```

**Look for**: Which URL returns the most jobs  
**Action**: Update that URL in `config/search-urls.json`

### Step 2: Inspect HTML
```bash
node inspect-wtj.js
```

**Look for**: Console output showing:
- Job card selectors
- Title selectors
- Company selectors
- Link patterns

**Files created**:
- `wtj-screenshot.png` (visual proof)
- `wtj-page.html` (for deep inspection)

### Step 3: Update Parser

Open `sources/wtj.js` and update the selectors based on findings from Step 2.

**Example**: If the inspector shows:
```
Parent classes: job-card-wrapper
Link classes: job-link
Title found in: h3.job-title
Company found in: span.company-name
```

Update the parser:
```javascript
$('div.job-card-wrapper').each((_, el) => {
  const $card = $(el);
  const $link = $card.find('a.job-link').first();
  const href = $link.attr('href');
  const title = $link.find('h3.job-title').text().trim();
  const company = $card.find('span.company-name').text().trim();
  // ...
});
```

### Step 4: Test
```bash
npm run scrape
```

**Expected output**:
```
[2/3] Welcome to the Jungle...
  → 25 offres trouvées    ← Should be > 0
```

If still `→ 0 offres trouvées`, review `wtj-page.html` manually.

---

## 🎯 What You'll Learn

After running the inspector, you'll know:

1. **Job Card Container**
   - Tag: `<li>`, `<article>`, `<div>`, or `<a>`?
   - Class: `job-card`, `result-item`, etc.
   - Data attribute: `data-testid="job"`, etc.

2. **Job Title**
   - Tag: `<h2>`, `<h3>`, `<h4>`?
   - Class: `job-title`, `title`, etc.
   - Location: Direct child of link, or nested deeper?

3. **Company Name**
   - Tag: `<span>`, `<div>`, `<p>`?
   - Class: `company-name`, `organization`, etc.
   - Location: Sibling to title, or in separate container?

4. **Job Link**
   - Pattern: `/fr/companies/{slug}/jobs/{job-slug}`
   - Is it the wrapper, or nested inside?
   - Full URL or relative path?

---

## 🔧 Troubleshooting

### Problem: "No jobs found" when running inspector

**Possible causes**:
1. Search URL is too restrictive
2. Page needs more time to load
3. Site has anti-scraping measures

**Solutions**:
1. Run `test-wtj-urls.js` to find a working URL
2. Increase wait time in `inspect-wtj.js` (change `waitForTimeout(5000)` to `waitForTimeout(10000)`)
3. Try from different network/IP

---

### Problem: Cookie popup not handled

**Solution**:
- The script tries 8 different selectors
- If none work, you'll see the popup in the browser window
- Manually click it during the 30-second wait period
- Inspect the button and add its selector to `inspect-wtj.js`

---

### Problem: Parser still extracts 0 jobs after update

**Debug steps**:
1. Open `wtj-page.html` in your browser
2. Open DevTools (F12)
3. In Console, test your selector:
   ```javascript
   document.querySelectorAll('your-selector-here')
   ```
4. If it returns 0, the selector is wrong
5. Right-click a job card → Inspect → note the actual classes/tags
6. Update `sources/wtj.js` with correct selectors

---

## 📚 Documentation Structure

```
scraper/
├── test-wtj-urls.js          ← Run first: find working URL
├── inspect-wtj.js            ← Run second: analyze HTML
├── QUICK-START-WTJ.md        ← Quick reference (read this first)
├── HOW-TO-INSPECT-WTJ.md     ← Detailed guide (read for troubleshooting)
├── INSPECT-WTJ-README.md     ← inspect-wtj.js documentation
│
├── sources/
│   └── wtj.js                ← Update this with found selectors
│
├── config/
│   └── search-urls.json      ← Update WTJ URL here
│
└── After running inspector:
    ├── wtj-screenshot.png    ← Visual proof
    └── wtj-page.html         ← HTML source for inspection
```

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ `test-wtj-urls.js` shows at least one URL with jobs found
2. ✅ `inspect-wtj.js` outputs sample job data (titles, companies, links)
3. ✅ `wtj-screenshot.png` shows actual job listings (not "no results")
4. ✅ `npm run scrape` outputs `→ 20+ offres trouvées` for WTJ
5. ✅ `data/jobs.json` contains WTJ jobs with proper titles and links

---

## 🎓 Why This Approach?

**Problem**: I can't run browser automation directly in this chat

**Solution**: Created local scripts that:
- Use your existing Playwright setup
- Run on your machine where the browser works
- Automatically analyze and report findings
- Generate files you can inspect manually
- Provide detailed console output with recommendations

**Benefit**: You get the exact information you asked for, just need to run two commands locally.

---

## 🆘 If You Get Stuck

Run the scripts and share:
1. Full console output from `inspect-wtj.js`
2. The `wtj-screenshot.png` file
3. A snippet from `wtj-page.html` showing a job card

With that info, I can help you write the exact selectors for `sources/wtj.js`.

---

## 📝 Next Actions

**Right now**:
```bash
cd scraper
node test-wtj-urls.js
```

**Then**:
```bash
node inspect-wtj.js
```

**Finally**: Share the output here, and I'll help you update the parser if needed!

---

## ⚡ Quick Command Reference

```bash
# Navigate to scraper folder
cd scraper

# Install dependencies (if needed)
npm install

# Test URLs (find which works)
node test-wtj-urls.js

# Inspect HTML structure
node inspect-wtj.js

# Test your scraper
npm run scrape

# View results
cat data/jobs.json
```

---

Happy scraping! 🎯
