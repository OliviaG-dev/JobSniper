/**
 * Test different Welcome to the Jungle search URLs
 * to see which one returns actual job listings.
 * 
 * Run with: node test-wtj-urls.js
 */

import { chromium } from 'playwright';

const testUrls = [
  {
    name: 'Your original search (dev front-end, CDI, worldwide)',
    url: 'https://www.welcometothejungle.com/fr/jobs?query=developpeur%20front%20end&refinementList%5Bcontract_type%5D%5B%5D=full_time&page=1&aroundQuery=worldwide&searchTitle=true'
  },
  {
    name: 'Simpler search (dev front-end only)',
    url: 'https://www.welcometothejungle.com/fr/jobs?query=developpeur%20front%20end&page=1'
  },
  {
    name: 'Very simple (developer)',
    url: 'https://www.welcometothejungle.com/fr/jobs?query=developer&page=1'
  },
  {
    name: 'Default jobs page',
    url: 'https://www.welcometothejungle.com/fr/jobs'
  }
];

async function testUrl(browser, urlConfig) {
  const page = await browser.newPage();
  
  try {
    console.log(`\n${'━'.repeat(70)}`);
    console.log(`Testing: ${urlConfig.name}`);
    console.log(`URL: ${urlConfig.url}`);
    console.log('━'.repeat(70));
    
    await page.goto(urlConfig.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Handle cookies
    try {
      await page.locator('button:has-text("Accepter"), button[id*="accept"]').first().click({ timeout: 2000 });
      console.log('✓ Accepted cookies');
    } catch (e) {
      console.log('⚠ No cookie popup found (or already accepted)');
    }
    
    await page.waitForTimeout(5000);
    
    // Check for "no results" message
    const noResultsText = await page.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('aucun résultat') || 
             text.includes('pas trouvé') ||
             text.includes('no jobs') ||
             text.includes('aucune offre');
    });
    
    if (noResultsText) {
      console.log('❌ Page shows "no results" message');
      return { ...urlConfig, hasResults: false, jobCount: 0 };
    }
    
    // Count job links
    const jobLinks = await page.locator('a[href*="/jobs/"]').count();
    console.log(`✓ Found ${jobLinks} job links`);
    
    // Try to extract first job
    if (jobLinks > 0) {
      const firstJob = await page.evaluate(() => {
        const link = document.querySelector('a[href*="/jobs/"]');
        if (!link) return null;
        
        const href = link.getAttribute('href');
        const titleEl = link.querySelector('h1, h2, h3, h4, [class*="title"]');
        const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim().split('\n')[0];
        
        return { title: title.slice(0, 80), href };
      });
      
      if (firstJob) {
        console.log(`✓ First job: "${firstJob.title}"`);
        console.log(`  Link: ${firstJob.href}`);
      }
    }
    
    return { ...urlConfig, hasResults: true, jobCount: jobLinks };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { ...urlConfig, hasResults: false, jobCount: 0, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🔍 Testing Welcome to the Jungle search URLs...\n');
  console.log('This will help identify which URL format returns job listings.\n');
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    const results = [];
    
    for (const urlConfig of testUrls) {
      const result = await testUrl(browser, urlConfig);
      results.push(result);
      await new Promise(r => setTimeout(r, 2000)); // 2s delay between tests
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    const working = results.filter(r => r.hasResults && r.jobCount > 0);
    const notWorking = results.filter(r => !r.hasResults || r.jobCount === 0);
    
    if (working.length > 0) {
      console.log('✅ URLs that returned job listings:\n');
      working.forEach(r => {
        console.log(`  ${r.name}`);
        console.log(`  Jobs found: ${r.jobCount}`);
        console.log(`  URL: ${r.url}\n`);
      });
    }
    
    if (notWorking.length > 0) {
      console.log('❌ URLs that did NOT return job listings:\n');
      notWorking.forEach(r => {
        console.log(`  ${r.name}`);
        console.log(`  URL: ${r.url}`);
        if (r.error) console.log(`  Error: ${r.error}`);
        console.log();
      });
    }
    
    // Recommendation
    console.log('='.repeat(70));
    console.log('RECOMMENDATION');
    console.log('='.repeat(70) + '\n');
    
    if (working.length > 0) {
      const best = working.reduce((a, b) => a.jobCount > b.jobCount ? a : b);
      console.log('Use this URL in your config (most jobs found):');
      console.log(`\n${best.url}\n`);
      console.log('Update scraper/config/search-urls.json with this URL.');
    } else {
      console.log('⚠ None of the tested URLs returned job listings.');
      console.log('Possible reasons:');
      console.log('  1. The site structure has changed');
      console.log('  2. The search criteria are too restrictive');
      console.log('  3. The site requires more time to load');
      console.log('  4. There might be anti-scraping measures');
      console.log('\nTry visiting the URLs manually in a browser to verify.');
    }
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
