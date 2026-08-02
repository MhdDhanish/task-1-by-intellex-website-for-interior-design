const https = require('https');

const postData = new URLSearchParams({
  'entry.610110659': 'Luxury Residential',
  'entry.1085914167': '$200,000 — $500,000',
  'entry.1849750114': 'London, UK',
  'entry.1281561757': 'Immediate (Within 30 days)',
  'entry.1279355805': 'Test Client',
  'entry.1871198526': 'test@example.com',
  'entry.779963795': '+44700000000',
  'entry.1314425078': 'Test project notes'
}).toString();

const options = {
  hostname: 'docs.google.com',
  port: 443,
  path: '/forms/d/e/1FAIpQLSfXhZ9pk3n8wuu3nxLYp_-fCj8AhbD-3A25FJugY_-Npf6izg/formResponse',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(e);
});

req.write(postData);
req.end();
