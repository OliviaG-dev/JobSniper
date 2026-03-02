/**
 * Welcome to the Jungle HTML Inspector
 * 
 * This script navigates to the WTJ search page, handles cookie consent,
 * waits for job listings to load, takes a screenshot, and inspects the HTML
 * structure to identify the correct selectors for job cards.
 * 
 * Run with: node inspect-wtj.js
 */

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = 'https://www.welcometothejungle.com/fr/jobs?query=developpeur%20front%20end&refinementList%5Bcontract_type%5D%5B%5D=full_time&page=1&aroundQuery=worldwide&searchTitle=true';

async function inspectWTJ() {
  console.log('🔍 Inspecting Welcome to the Jungle page structure...\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const page = await browser.newPage();
  
  try {
    console.log('📄 Navigating to:', URL);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait a bit for initial load
    await page.waitForTimeout(2000);
    
    // Check for cookie consent popup and accept it
    console.log('🍪 Checking for cookie consent popup...');
    const cookieSelectors = [
      'button[data-testid="cmp-button-accept-all"]',
      'button[id*="accept"]',
      'button[class*="accept"]',
      'button:has-text("Accepter")',
      'button:has-text("Accept")',
      'button:has-text("J\'accepte")',
      '[data-testid="cookies-banner-accept"]',
      '#didomi-notice-agree-button',
    ];
    
    for (const selector of cookieSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`  ✓ Found cookie button with selector: ${selector}`);
          await button.click();
          console.log('  ✓ Clicked accept cookies');
          await page.waitForTimeout(1000);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    // Wait for job listings to load
    console.log('⏳ Waiting for job listings to load...');
    await page.waitForTimeout(5000); // Give time for JavaScript to render
    
    // Take screenshot
    const screenshotPath = join(__dirname, 'wtj-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}\n`);
    
    // Get the full HTML
    const html = await page.content();
    const htmlPath = join(__dirname, 'wtj-page.html');
    await writeFile(htmlPath, html, 'utf-8');
    console.log(`💾 Full HTML saved to: ${htmlPath}\n`);
    
    // Try to find job card elements using various strategies
    console.log('🔎 Analyzing job card structure...\n');
    
    // Strategy 1: Look for links containing /jobs/
    const jobLinks = await page.locator('a[href*="/jobs/"]').all();
    console.log(`Found ${jobLinks.length} links containing "/jobs/"\n`);
    
    if (jobLinks.length > 0) {
      // Inspect the first few job cards
      for (let i = 0; i < Math.min(3, jobLinks.length); i++) {
        const link = jobLinks[i];
        const href = await link.getAttribute('href');
        const outerHTML = await link.evaluate(el => el.outerHTML.slice(0, 500)); // First 500 chars
        
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Job Card #${i + 1}:`);
        console.log(`Link href: ${href}`);
        console.log(`HTML preview:\n${outerHTML}...`);
        
        // Try to find parent container
        const parent = await link.evaluateHandle(el => {
          // Try to find a parent that looks like a job card container
          let current = el.parentElement;
          let depth = 0;
          while (current && depth < 5) {
            const classes = current.className || '';
            const tagName = current.tagName.toLowerCase();
            if (
              classes.includes('job') ||
              classes.includes('card') ||
              classes.includes('item') ||
              classes.includes('result') ||
              tagName === 'li' ||
              tagName === 'article'
            ) {
              return current;
            }
            current = current.parentElement;
            depth++;
          }
          return el.parentElement;
        });
        
        const parentTag = await parent.evaluate(el => el?.tagName);
        const parentClasses = await parent.evaluate(el => el?.className);
        const parentHTML = await parent.evaluate(el => el?.outerHTML.slice(0, 800));
        
        console.log(`\nParent container:`);
        console.log(`  Tag: ${parentTag}`);
        console.log(`  Classes: ${parentClasses}`);
        console.log(`  HTML preview:\n${parentHTML}...\n`);
      }
    }
    
    // Strategy 2: Look for common job listing container patterns
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Testing common job listing patterns:\n');
    
    const patterns = [
      '[data-testid*="job"]',
      '[class*="job-card"]',
      '[class*="JobCard"]',
      '[class*="search-result"]',
      '[class*="SearchResult"]',
      'li[class*="job"]',
      'article',
      '[data-testid*="offer"]',
    ];
    
    for (const pattern of patterns) {
      try {
        const elements = await page.locator(pattern).all();
        if (elements.length > 0) {
          console.log(`✓ Pattern "${pattern}" found ${elements.length} elements`);
          
          // Get details from first element
          const first = elements[0];
          const classes = await first.getAttribute('class');
          const testId = await first.getAttribute('data-testid');
          const tag = await first.evaluate(el => el.tagName.toLowerCase());
          
          console.log(`  → Tag: ${tag}`);
          console.log(`  → Classes: ${classes || 'none'}`);
          console.log(`  → data-testid: ${testId || 'none'}\n`);
        }
      } catch (e) {
        // Pattern not found
      }
    }
    
    // Try to extract sample data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Attempting to extract sample job data:\n');
    
    const sampleJobs = await page.evaluate(() => {
      const jobs = [];
      const links = document.querySelectorAll('a[href*="/jobs/"]');
      
      for (let i = 0; i < Math.min(3, links.length); i++) {
        const link = links[i];
        const href = link.getAttribute('href');
        
        // Try to find title
        const titleEl = link.querySelector('h1, h2, h3, h4, [class*="title"], [class*="Title"]');
        const title = titleEl ? titleEl.textContent.trim() : link.textContent.trim().split('\n')[0];
        
        // Try to find company
        const companyEl = link.querySelector('[class*="company"], [class*="Company"], [class*="organization"]');
        const company = companyEl ? companyEl.textContent.trim() : '';
        
        // Get all classes on the link
        const linkClasses = link.className;
        
        // Get parent classes
        const parentClasses = link.parentElement ? link.parentElement.className : '';
        
        jobs.push({
          title: title.slice(0, 100),
          company: company.slice(0, 50),
          href: href,
          linkClasses,
          parentClasses
        });
      }
      
      return jobs;
    });
    
    sampleJobs.forEach((job, i) => {
      console.log(`Job #${i + 1}:`);
      console.log(`  Title: ${job.title}`);
      console.log(`  Company: ${job.company || '(not found)'}`);
      console.log(`  Link: ${job.href}`);
      console.log(`  Link classes: ${job.linkClasses || '(none)'}`);
      console.log(`  Parent classes: ${job.parentClasses || '(none)'}\n`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Inspection complete!');
    console.log('\nFiles created:');
    console.log(`  - ${screenshotPath}`);
    console.log(`  - ${htmlPath}`);
    console.log('\nPlease review the output above and check the HTML file');
    console.log('to determine the correct selectors for your scraper.\n');
    
  } catch (error) {
    console.error('❌ Error during inspection:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Browser will remain open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

inspectWTJ().catch(console.error);
