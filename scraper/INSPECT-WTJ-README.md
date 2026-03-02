# Welcome to the Jungle HTML Inspector

## Purpose

This script will help you discover the exact HTML selectors needed for scraping Welcome to the Jungle job listings.

## How to Use

### Step 1: Run the Inspector Script

```bash
cd scraper
node inspect-wtj.js
```

### Step 2: What the Script Does

1. ✅ Opens a visible browser (not headless) so you can watch
2. ✅ Navigates to your Welcome to the Jungle search URL
3. ✅ Automatically detects and clicks the cookie consent button
4. ✅ Waits for job listings to load (5 seconds)
5. ✅ Takes a full-page screenshot (`wtj-screenshot.png`)
6. ✅ Saves the complete rendered HTML (`wtj-page.html`)
7. ✅ Analyzes job card structure and prints findings to console
8. ✅ Stays open for 30 seconds for manual inspection

### Step 3: Review the Output

The script will output:

1. **Console Output**: Shows discovered selectors, sample job data, and HTML structure
2. **Screenshot**: `scraper/wtj-screenshot.png` - visual confirmation
3. **HTML File**: `scraper/wtj-page.html` - full page source to inspect

### Step 4: Find the Correct Selectors

Look at the console output for:

```
Job Card #1:
  Title: [extracted title]
  Company: [extracted company]
  Link: /fr/companies/[company]/jobs/[job-id]
  Link classes: [CSS classes on the link]
  Parent classes: [CSS classes on parent container]
```

### Step 5: Update the Parser

Once you know the correct selectors, update `scraper/sources/wtj.js` with the accurate CSS selectors.

## Common Selector Patterns to Look For

### Job Card Container
- `li[class*="job"]`
- `article`
- `[data-testid*="job"]`
- `div[class*="JobCard"]`

### Job Title
- `h3`
- `h2`
- `[class*="job-title"]`
- `[data-testid="job-title"]`

### Company Name
- `[class*="company"]`
- `[class*="organization"]`
- `span[class*="Company"]`

### Job Link
- Usually the `<a>` tag wrapping the entire card
- Pattern: `href="/fr/companies/{company-slug}/jobs/{job-slug}"`

## Troubleshooting

### If No Jobs Found

1. Check if the search URL returns results manually in a browser
2. The URL might be too restrictive (try removing some filters)
3. The page might need more time to load (increase wait time)

### If Cookie Popup Not Handled

- The script tries multiple selectors
- Check the console for which one worked
- You can manually click it during the 30-second wait period

## Manual Inspection

While the browser is open for 30 seconds:

1. **Right-click on a job card** → "Inspect Element"
2. Look at the HTML structure in DevTools
3. Note the tags, classes, and data attributes
4. Test selectors in the Console: `document.querySelectorAll('your-selector')`

## Next Steps

After running this script and identifying selectors, you'll need to update the parser in `sources/wtj.js` with the correct selectors for:

- Job card container
- Job title element
- Company name element
- Job link href

The current parser uses fallback strategies, but with exact selectors, it will be more reliable.
