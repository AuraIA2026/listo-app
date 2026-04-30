const payload = {
  data: {
    MerchantName: "Listo App",
    MerchantType: "E-Commerce",
    CurrencyCode: "$",
    OrderNumber: "ORD_123456_567890",
    Amount: "250000",
    ApprovedUrl: "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook",
    DeclinedUrl: "https://listo-app.vercel.app/orders?error=declined",
    CancelUrl: "https://listo-app.vercel.app/orders?error=cancelled"
  }
};
fetch("https://us-central1-listoapp-52b46.cloudfunctions.net/generarFirmaAzul", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
}).then(r => r.json()).then(d => {
    console.log("HASH FOR 250000:", d.result.AuthHash);
});
