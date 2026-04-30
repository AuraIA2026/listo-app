const crypto = require('crypto');

const AUTH_KEY = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax";

const hashString = "39038540035" // MerchantId
+ "Prueba AZUL" // MerchantName
+ "ECommerce" // MerchantType
+ "$" // CurrencyCode
+ "001" // OrderNumber
+ "10000" // Amount
+ "000" // ITBIS
+ "https://google.com" // ApprovedUrl
+ "https://google.com" // DeclinedUrl
+ "https://google.com" // CancelUrl
+ "0" // UseCustomField1
+ "" // CustomField1Label
+ "" // CustomField1Value
+ "0" // UseCustomField2
+ "" // CustomField2Label
+ "" // CustomField2Value
+ AUTH_KEY;

const hash = crypto.createHmac('sha512', AUTH_KEY)
  .update(hashString)
  .digest('hex');

console.log("Calculated hash:", hash);
console.log("Expected hash:  ", "6662f1e52260cf845a848845e6769ece7ef173c2809ea215f1fc8907442a21f395bdfbb8422eb4d6ce8673eb6961beb730d97842e8030668516beba717ffff5b");
console.log("Match:", hash === "6662f1e52260cf845a848845e6769ece7ef173c2809ea215f1fc8907442a21f395bdfbb8422eb4d6ce8673eb6961beb730d97842e8030668516beba717ffff5b");
