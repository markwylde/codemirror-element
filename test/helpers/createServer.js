import fs from 'fs';
import http2 from 'http2';
import servatron from 'servatron/http2.js';

async function createServer () {
  const server = http2.createSecureServer({
    key: fs.readFileSync('./node_modules/servatron/defaultCerts/key.pem'),
    cert: fs.readFileSync('./node_modules/servatron/defaultCerts/cert.pem')
  });
  server.on('error', (error) => console.error(error));

  const staticHandler = servatron({
    directory: './dist'
  });

  server.on('stream', staticHandler);

  server.listen(null, '0.0.0.0');

  return new Promise(resolve => {
    server.on('listening', () => {
      const close = () => server.close();
      resolve({
        url: `https://0.0.0.0:${server.address().port}`,
        close,
        server
      });
    });
  });
}

export default createServer;
