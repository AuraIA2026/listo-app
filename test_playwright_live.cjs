const { chromium } = require("playwright");
const crypto = require("crypto");

const AUTH_KEY = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax";

async function testAzul(testName, payloadConfig) {
    const data = {
        MerchantId: "39038540035",
        MerchantName: "Listo App",
        MerchantType: "E-Commerce",
        CurrencyCode: "$",
        OrderNumber: "ORD_123456_567890",
        Amount: "150000",
        ITBIS: "000",
        ApprovedUrl: "https://listopatron.vercel.app/orders",
        DeclinedUrl: "https://listopatron.vercel.app/orders",
        CancelUrl: "https://listopatron.vercel.app/orders",
        ResponsePostUrl: "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook",
        UseCustomField1: "0",
        CustomField1Label: "",
        CustomField1Value: "",
        UseCustomField2: "0",
        CustomField2Label: "",
        CustomField2Value: "",
        ...payloadConfig
    };

    const cadena = data.MerchantId + data.MerchantName + data.MerchantType + data.CurrencyCode + data.OrderNumber + data.Amount + data.ITBIS + data.ApprovedUrl + data.DeclinedUrl + data.CancelUrl + data.ResponsePostUrl + data.UseCustomField1 + data.CustomField1Label + data.CustomField1Value + data.UseCustomField2 + data.CustomField2Label + data.CustomField2Value;
    
    data.AuthHash = crypto.createHmac("sha512", AUTH_KEY).update(cadena).digest("hex");

    const html = `
        <html><body>
        <form action="https://pruebas.azul.com.do/paymentpage/Default.aspx" method="post" id="azulForm">
            ${Object.keys(data).map(k => `<input name="${k}" value="${data[k]}"/>`).join("")}
        </form>
        <script>document.getElementById("azulForm").submit();</script>
        </body></html>
    `;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
        await page.setContent(html);
        await page.waitForLoadState("networkidle", { timeout: 15000 });
        const content = await page.content();
        if (content.includes("INVALID_AUTH") || content.includes(".9")) {
            console.log(`[${testName}] FAILED (INVALID_AUTH)`);
        } else if (content.includes("Tarjeta") || content.includes("Crédito") || content.includes("pagar")) {
            console.log(`[${testName}] SUCCESS (Rendered Payment Gateway)`);
        } else {
            console.log(`[${testName}] UNKNOWN OUTCOME`);
            console.log(content.substring(0, 500));
        }
    } catch (e) {
        console.log(`[${testName}] ERROR:`, e.message);
    } finally {
        await browser.close();
    }
}

async function run() {
    await testAzul("1. Base Pedido", {});
    await testAzul("2. Base Pedido Variable", { Amount: "5050" });
    await testAzul("3. Old Listo-App Domain", { ApprovedUrl: "https://listo-app.vercel.app/o", DeclinedUrl: "https://listo-app.vercel.app/o", CancelUrl: "https://listo-app.vercel.app/o" });
    await testAzul("4. Planes Match (Fixed amount)", { MerchantName: "Listo App - Planes", OrderNumber: "PLAN_123456" });
    await testAzul("5. Planes URL Match (Fixed amount)", { MerchantName: "Listo App - Planes", OrderNumber: "PLAN_123456", ApprovedUrl: "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook", DeclinedUrl: "https://listo-app.vercel.app/profile?planError=declined", CancelUrl: "https://listo-app.vercel.app/profile?planError=cancelled" });
}

run().catch(console.error);
