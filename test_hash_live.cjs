const crypto = require("crypto");
const AUTH_KEY = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax";
const data = {
    MerchantId: "39038540035",
    MerchantName: "Listo App",
    MerchantType: "E-Commerce",
    CurrencyCode: "$",
    OrderNumber: "ORD_123456_567890",
    Amount: "5050",
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
    CustomField2Value: ""
};

const cadena = data.MerchantId + data.MerchantName + data.MerchantType + data.CurrencyCode + data.OrderNumber + data.Amount + data.ITBIS + data.ApprovedUrl + data.DeclinedUrl + data.CancelUrl + data.ResponsePostUrl + data.UseCustomField1 + data.CustomField1Label + data.CustomField1Value + data.UseCustomField2 + data.CustomField2Label + data.CustomField2Value;

const hash = crypto.createHmac("sha512", AUTH_KEY).update(cadena).digest("hex");
console.log(hash);
