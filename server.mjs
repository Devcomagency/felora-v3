import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

// Générer un certificat auto-signé si nécessaire
const certDir = path.join(process.cwd(), '.cert');
const certPath = path.join(certDir, 'localhost.pem');
const keyPath = path.join(certDir, 'localhost-key.pem');

let httpsOptions;

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('⚠️  Certificat HTTPS non trouvé.');
  console.log('📝 Pour activer HTTPS, installez mkcert:');
  console.log('   brew install mkcert (macOS)');
  console.log('   mkcert -install');
  console.log('   mkdir .cert && cd .cert');
  console.log('   mkcert localhost 127.0.0.1 ::1 192.168.1.44');
  console.log('\n🔄 Démarrage en HTTP standard...\n');
  
  // Fallback vers le serveur HTTP standard
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  
  app.prepare().then(() => {
    const { createServer } = require('http');
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, hostname, () => {
      console.log(`✅ HTTP: http://${hostname}:${port}`);
    });
  });
} else {
  httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(httpsOptions, async (req, res) => {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    }).listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`✅ HTTPS: https://${hostname}:${port}`);
      console.log(`🔒 Géolocalisation activée sur mobile`);
    });
  });
}
