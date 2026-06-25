const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('Page loaded successfully');
    
    // Take a screenshot to inspect later if needed
    await page.screenshot({path: 'screenshot.png'});
  } catch (err) {
    console.log('Navigation error:', err.message);
  }

  await browser.close();
})();
