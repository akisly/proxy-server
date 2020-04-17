const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');
const proxyService = require('./proxy');

const proxy = httpProxy.createProxyServer();
const PORT = 3000;

proxyService.init(proxy);

http
  .createServer((req, res) => {
    let urlObj = {};

    try {
      urlObj = url.parse(req.url, true);
    } catch (error) {
      console.error(error);
    }

    if (urlObj.query.host) {
      global.host = urlObj.query.host;
    }

    proxy.web(req, res, {
      target: global.host,
      changeOrigin: true,
      followRedirects: true,
      toProxy: false,
      selfHandleResponse: true,
      protocolRewrite: true,
    });
  })
  .listen(PORT);
