const fs = require('fs');
let content = fs.readFileSync('src/app/pages/login/login.page.html', 'utf8');

// Find auth-center-block
const marker = '<!-- Center Main Content / Login Card Block -->';
const markerIdx = content.indexOf(marker);

if (markerIdx !== -1) {
  const newHeader = `<ion-content class="login-content">
  <div class="login-container">
    <div class="login-bg-backdrop"></div>
    <div class="login-bg-overlay"></div>

    `;
  const rest = content.substring(markerIdx);
  fs.writeFileSync('src/app/pages/login/login.page.html', newHeader + rest, 'utf8');
  console.log('Updated login.page.html successfully');
} else {
  console.error('Marker not found in login.page.html');
}
