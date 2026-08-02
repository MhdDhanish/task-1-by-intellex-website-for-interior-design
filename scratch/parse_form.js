const https = require('https');

https.get('https://docs.google.com/forms/d/e/1FAIpQLSfXhZ9pk3n8wuu3nxLYp_-fCj8AhbD-3A25FJugY_-Npf6izg/viewform', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const match = body.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(.*?);<\/script>/s);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const questions = data[1][1];
        questions.forEach(q => {
          if (q) {
            console.log(`Question: "${q[1]}" | ID: entry.${q[4][0][0]}`);
            if (q[4][0][1]) {
              console.log('  Choices:', q[4][0][1].map(c => c[0]));
            }
          }
        });
      } catch (e) {
        console.error('JSON Error:', e.message);
      }
    }
  });
});
