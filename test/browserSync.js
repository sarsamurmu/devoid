const browserSync = require('browser-sync');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const strut = path.resolve(__dirname, '../dist/strut.js');

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
            <link rel="stylesheet" type="text/css" href="style.css" />
          </head>
          <body>
            <div files>
              ${innerhtml}
            </div>
          </body>
          </html>
          `);
      });

      bs.addMiddleware('/dist/strut.js', (req, res) => {
        res.writeHead(200, {
          'Content-Type': 'text/javascript'
        });
        fs.createReadStream(strut).pipe(res);
      })
    }
  }
});
chokidar.watch(strut).on('change', () => browserSync.reload('*.js'));

browserSync.watch('*').on('change', browserSync.reload);
