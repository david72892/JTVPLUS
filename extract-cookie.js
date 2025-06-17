const https = require('https');
const fs = require('fs');

const API_URL = 'https://raw.githubusercontent.com/alex4528/m3u/refs/heads/main/jstar.m3u';

function fetchM3U() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractHdneaCookie(m3uContent) {
  // Look for __hdnea__ parameter in the M3U content
  const hdneaRegex = /__hdnea__=([^&\s"]+)/g;
  const matches = [];
  let match;
  
  while ((match = hdneaRegex.exec(m3uContent)) !== null) {
    matches.push(match[1]);
  }
  
  if (matches.length > 0) {
    // Return the first match (they should all be the same)
    return matches[0];
  }
  
  return null;
}

async function main() {
  try {
    console.log('Fetching M3U playlist...');
    const m3uContent = await fetchM3U();
    
    console.log('Extracting HDNEA cookie...');
    const hdneaCookie = extractHdneaCookie(m3uContent);
    
    if (hdneaCookie) {
      const cookieContent = `__hdnea__=${hdneaCookie}`;
      
      // Write to cookie.txt
      fs.writeFileSync('cookie.txt', cookieContent);
      
      console.log('Cookie extracted and saved to cookie.txt:');
      console.log(cookieContent);
      
      // Also log timestamp for debugging
      console.log(`Updated at: ${new Date().toISOString()}`);
    } else {
      console.error('No HDNEA cookie found in the M3U content');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
