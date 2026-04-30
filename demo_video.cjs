const { chromium } = require("playwright");

(async () => {
    console.log("🎥 ¡Preparando el navegador para el video!");
    // Abrir navegador en modo visible simulando un celular
    const browser = await chromium.launch({ headless: false, slowMo: 800 });
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 }, // Pantalla de celular
        geolocation: { longitude: -69.9312, latitude: 18.4861 },
        permissions: ['geolocation']
    });
    
    const page = await context.newPage();
    
    console.log("➡️ Entrando a la App Listo Patron...");
    await page.goto("https://listopatron.vercel.app");
    await page.waitForTimeout(2000);

    // Intentar buscar los botones para navegar (está envuelto en try/catch para que no se tranque)
    try {
        console.log("➡️ Entrando con cuenta de The Diva...");
        // Esto asume que tienes un enlace/botón de 'Ingresar' o 'Iniciar Sesión'
        const loginBtn = await page.$('text=/Iniciar Sesi/i') || await page.$('text=/Ingresar/i');
        if (loginBtn) {
            await loginBtn.click();
            await page.fill('input[type="email"]', 'the.diva.21@hotmail.com');
            await page.fill('input[type="password"]', 'pimentel0617');
            const submitBtn = await page.$('button[type="submit"]') || await page.$('text=/Entrar/i');
            if (submitBtn) await submitBtn.click();
            await page.waitForTimeout(3000);
        }
    } catch(e) {
        console.log("Navegación manual: ", e.message);
    }
    
    console.log("🗺️ Simulando navegación y permisos de ubicación...");
    // Simular algo de scroll para darle tiempo a la grabadora
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -300);
    
    // Dejamos la app abierta unos segundos adicionales por si quieres hacer algún clic manual
    console.log("🔴 Grabación simulada terminando en 10 segundos...");
    await page.waitForTimeout(10000);
    
    await browser.close();
    console.log("🎬 ¡Corte! Video terminado.");
})();
