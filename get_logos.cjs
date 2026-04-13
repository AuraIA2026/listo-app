const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    }, function(response) {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error('Failed to download: ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  try {
    console.log("Downloading Visa Secure...");
    await download('https://upload.wikimedia.org/wikipedia/commons/1/16/Visa_Secure_logo.svg', './public/visa-secure.svg');
    console.log("Downloading Mastercard ID Check...");
    await download('https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg', './public/mastercard.svg');
    console.log("Done");
  } catch (e) {
    console.error(e);
  }
}
main();
