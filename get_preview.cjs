const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Mobile Safari/537.36'
  });
  
  const page = await context.newPage();
  
  console.log('Navigating to local development server http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 15000 });
  
  console.log('Waiting for login form fields to be visible...');
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'the.diva.21@hotmail.com');
  await page.fill('input[type="password"]', 'pimentel0617');
  
  console.log('Submitting login...');
  // Click the login button by its class
  await page.click('button.auth-btn');
  
  console.log('Waiting for page to update after login...');
  await page.waitForTimeout(6000); // Wait for auth and home page load
  
  console.log('Scrolling down to footer...');
  // Scroll down step-by-step or directly to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await page.waitForTimeout(2000);
  
  const outputPath = 'C:/Users/13900K/.gemini/antigravity-ide/brain/b511614b-5341-4eca-9966-c059593da900/live_homepage_azul.png';
  console.log(`Taking screenshot and saving to: ${outputPath}`);
  await page.screenshot({ path: outputPath, fullPage: false });
  
  console.log('Done!');
  await browser.close();
})().catch(err => {
  console.error('Error running preview script:', err);
  process.exit(1);
});
