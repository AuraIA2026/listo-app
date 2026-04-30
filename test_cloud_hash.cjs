const payload = {
  data: {
    MerchantName: "Listo App",
    MerchantType: "E-Commerce",
    CurrencyCode: "$",
    OrderNumber: "ORD_123456_567890",
    Amount: "150000",
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
    console.log("ORD_HASH_FROM_CLOUD:", d);
});
