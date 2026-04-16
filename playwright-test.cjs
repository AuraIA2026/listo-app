const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({headless: true});
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Navigating to localhost...');
    await page.goto('http://localhost:5173/');
    
    console.log('Logging in...');
    await page.fill('input[type=\"email\"]', 'the.diva.21@hotmail.com');
    await page.fill('input[type=\"password\"]', 'pimentel0617');
    await page.click('button[type=\"submit\"]');
    
    await page.waitForTimeout(2000);
    
    console.log('Going to orders...');
    await page.goto('http://localhost:5173/orders');
    await page.waitForTimeout(1000);
    
    console.log('Clicking Proceder al Pago...');
    await page.click('text=Proceder al Pago');
    await page.waitForTimeout(1000);
    
    console.log('Clicking Tarjeta...');
    await page.click('text=Tarjeta de');
    await page.waitForTimeout(500);
    
    await page.route('https://pruebas.azul.com.do/PaymentPage/', route => {
        const req = route.request();
        console.log('================ INTERCEPTED POST DATA ================');
        console.log(req.postData());
        console.log('=======================================================');
        route.abort();
        browser.close();
    });
    
    console.log('Clicking Pay...');
    await page.click('button:has-text("Pagar en Entorno Seguro")');
    
    await page.waitForTimeout(5000);
    await browser.close();
})();
