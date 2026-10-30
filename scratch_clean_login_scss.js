const fs = require('fs');
let scss = fs.readFileSync('src/app/pages/login/login.page.scss', 'utf8');

const marker = '/* Center Auth Section */';
const markerIdx = scss.indexOf(marker);

if (markerIdx !== -1) {
  const newHeader = `:host {
  display: block;
  height: 100%;
  width: 100%;
}

.login-content {
  --background: #100b34;
  --color: #ffffff;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100%;
}

.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Fondo original de la aplicación respetando calidad y proporciones */
.login-bg-backdrop {
  position: absolute;
  inset: 0;
  background-image: url('/assets/img/empresa.jpg');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 1;
}

.login-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(16, 11, 52, 0.84) 0%, rgba(33, 18, 94, 0.80) 50%, rgba(10, 5, 36, 0.90) 100%);
  z-index: 2;
  backdrop-filter: blur(6px);
}

`;
  const rest = scss.substring(markerIdx);
  fs.writeFileSync('src/app/pages/login/login.page.scss', newHeader + rest, 'utf8');
  console.log('Updated login.page.scss successfully');
} else {
  console.error('Marker not found');
}
