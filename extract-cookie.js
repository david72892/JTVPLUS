const https = require('https');
const fs = require('fs');

const API_URL = 'https://raw.githubusercontent.com/alex4528/m3u/refs/heads/main/jstar.m3u';

function fetchM3U() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => reject(err));
  });
}

function extractHdneaCookie(m3uContent) {
  const hdneaRegex = /__hdnea__=([^&\s"]+)/g;
  const match = hdneaRegex.exec(m3uContent);
  return match ? match[1] : null;
}

async function main() {
  try {
    console.log('Fetching M3U playlist...');
    const m3uContent = await fetchM3U();

    console.log('Extracting HDNEA cookie...');
    const hdneaCookie = extractHdneaCookie(m3uContent);

    if (!hdneaCookie) {
      console.error('No HDNEA cookie found in the M3U content');
      process.exit(0); // exit cleanly (not an error)
    }

    const cookieContent = `__hdnea__=${hdneaCookie}`;

    // Only update cookie.txt if value changed
    const filePath = 'cookie.txt';
    let prevContent = '';
    if (fs.existsSync(filePath)) {
      prevContent = fs.readFileSync(filePath, 'utf-8').trim();
    }

    if (prevContent === cookieContent) {
      console.log('Cookie unchanged, no update needed.');
      process.exit(0);
    }

    fs.writeFileSync(filePath, cookieContent);
    console.log('Cookie extracted and saved to cookie.txt:');
    console.log(cookieContent);
    console.log(`Updated at: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
