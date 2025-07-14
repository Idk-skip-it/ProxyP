const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const url = require('url');
const app = express();

const PORT = process.env.PORT || 3000;

const homepageHTML = \`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Video Proxy</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 2rem;
      text-align: center;
      background: #111;
      color: #fff;
    }
    input[type="text"] {
      width: 90%;
      max-width: 500px;
      padding: 10px;
      font-size: 18px;
      border: none;
      border-radius: 5px;
    }
    button {
      padding: 10px 20px;
      font-size: 18px;
      margin-top: 1rem;
      border: none;
      background: #0f0;
      color: #000;
      border-radius: 5px;
    }
    h1 { font-size: 28px; }
  </style>
</head>
<body>
  <h1>🔐 Mobile Video Proxy</h1>
  <form id="proxyForm">
    <input type="text" id="urlInput" placeholder="https://example.com" required />
    <br />
    <button type="submit">Go</button>
  </form>

  <script>
    document.getElementById('proxyForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const url = document.getElementById('urlInput').value;
      const proxyUrl = '/proxy?url=' + encodeURIComponent(url);
      window.location.href = proxyUrl;
    });
  </script>
</body>
</html>
\`;

app.get('/', (req, res) => {
  res.send(homepageHTML);
});

app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url || req.url.replace(/^\/proxy\?url=/, '');
  if (!targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid or missing URL');
  }

  const parsedUrl = url.parse(targetUrl);

  const proxy = createProxyMiddleware({
    target: \`\${parsedUrl.protocol}//\${parsedUrl.host}\`,
    changeOrigin: true,
    secure: false,
    selfHandleResponse: false,
    pathRewrite: (path) => {
      const u = new URL(targetUrl);
      return u.pathname + u.search;
    },
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('Referer', targetUrl);
      proxyReq.setHeader('Origin', parsedUrl.protocol + '//' + parsedUrl.host);
    },
  });

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(\`✅ Video Proxy running at http://localhost:\${PORT}\`);
});
