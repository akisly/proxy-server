const zlib = require('zlib');
const cheerio = require('cheerio');

init = (proxy) => {
  proxy.on('proxyRes', (proxyRes, req, res) => {
    let originalBody = Buffer.from([]);
    const contentEncoding = proxyRes.headers['content-encoding'];
    proxyRes.on('data', (data) => {
      originalBody = Buffer.concat([originalBody, data]);
    });

    proxyRes.on('end', () => {
      const newBody = doSomeReplacementStuff(originalBody, contentEncoding);

      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.setHeader('content-encoding', 'gzip');
      res.setHeader('content-length', newBody.length);
      res.write(newBody);
      res.end();
    });
  });
};

appendToBody = (body) => {
  const $ = cheerio.load(body);

  $('body').append(
    `<h1 style="color: blue; position: fixed; z-index: 9999; left: 50%; top: 50%; transform: translate(-50%,-50%)">Hello world</h1>`,
  );

  return $.html();
};

doSomeReplacementStuff = (originalBody, contentEncoding) => {
  let body;
  let cNewBody;

  switch (contentEncoding) {
    case 'gzip':
      body = zlib.gunzipSync(originalBody).toString('utf8');
      newBody = appendToBody(body);
      cNewBody = zlib.gzipSync(newBody);
      break;
    case 'br':
      body = zlib.brotliDecompressSync(originalBody).toString('utf8');
      newBody = appendToBody(body);
      cNewBody = zlib.brotliCompressSync(newBody);
      break;
    case 'deflate':
      body = zlib.inflateSync(originalBody).toString('utf8');
      newBody = appendToBody(body);
      cNewBody = zlib.deflateSync(newBody);
      break;
  }

  return cNewBody;
};

module.exports = {
  init,
};
