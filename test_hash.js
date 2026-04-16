const crypto = require("crypto");

const AUTH_KEY = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax";
const MERCHANT_ID = "39038540035";
const ITBIS = "000";
const UseCustomField1 = "0";
const CustomField1Label = "";
const CustomField1Value = "";
const UseCustomField2 = "0";
const CustomField2Label = "";
const CustomField2Value = "";

function testHash(MerchantName, OrderNumber, Amount, ApprovedUrl, DeclinedUrl, CancelUrl) {
    const MerchantType = "E-Commerce";
    const CurrencyCode = "$";
    const ResponsePostUrl = ApprovedUrl;

    const cadena =
        MERCHANT_ID +
        MerchantName +
        MerchantType +
        CurrencyCode +
        OrderNumber +
        Amount +
        ITBIS +
        ApprovedUrl +
        DeclinedUrl +
        CancelUrl +
        ResponsePostUrl +
        UseCustomField1 +
        CustomField1Label +
        CustomField1Value +
        UseCustomField2 +
        CustomField2Label +
        CustomField2Value;

    console.log("CADENA:", cadena);

    const authHash = crypto.createHmac('sha512', AUTH_KEY)
        .update(cadena)
        .digest('hex');
    
    return authHash;
}

const cloudFunctionEndpoint = "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook"; 

// Planes Payload
const planesHash = testHash(
    "Listo App - Planes",
    "PLAN_vip_123456",
    "150000",
    cloudFunctionEndpoint,
    "https://listo-app.vercel.app/profile?planError=declined",
    "https://listo-app.vercel.app/profile?planError=cancelled"
);

// Pedidos Payload
const pedidosHash = testHash(
    "Listo App",
    "ORD_123456_567890",
    "150000",
    cloudFunctionEndpoint,
    "https://listo-app.vercel.app/orders?error=declined",
    "https://listo-app.vercel.app/orders?error=cancelled"
);

console.log("Planes:", planesHash);
console.log("Pedidos:", pedidosHash);
