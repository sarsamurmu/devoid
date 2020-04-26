const browserSync = require('browser-sync');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const devoid = path.resolve(__dirname, '../dist/devoid.js');
const devoidProd = path.resolve(__dirname, '../dist/devoid.prod.js');
const ssr = path.resolve(__dirname, '../tools/ssr.js');

browserSync.init({
  server: {
    baseDir: '.',
    serveStaticOptions: {
      extensions: ['html']
    }
  },
  callbacks: {
    ready: (err, bs) => {
      bs.addMiddleware('/', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var innerhtml = '';
        fs.readdirSync('./').forEach((file) => {
          if (file.includes('.html'))
            innerhtml += `<a href="${file}"><span>${file}</span></a>`;
        });
        res.end(
          `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            <link rel="stylesheet" type="text/css" href="./resources/style.css" />
          </head>
          <body>
            <div files>
              ${innerhtml}
            </div>
          </body>
          </html>
          `);
      });

      bs.addMiddleware('/dist/devoid.js', (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        fs.createReadStream(devoid).pipe(res);
      });

      bs.addMiddleware('/dist/devoid.prod.js', (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        fs.createReadStream(devoidProd).pipe(res);
      });

      bs.addMiddleware('/tools/ssr.js', (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        fs.createReadStream(ssr).pipe(res);
      });
    }
  }
});

chokidar.watch(devoid).on('change', () => browserSync.reload('*.js'));

browserSync.watch('*').on('change', browserSync.reload);
