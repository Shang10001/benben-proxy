const express = require('express');
const app = express();

// 接收所有类型的 raw body（备份 JSON 可能很大）
app.use(express.raw({ type: '*/*', limit: '50mb' }));

// CORS —— 允许笨笨家园跨域访问
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Depth, X-Target-URL, X-Method',
    'Access-Control-Expose-Headers': 'Content-Type'
  });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 健康检查（Render 用来确认服务存活）
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'BenBenHome CORS Proxy' });
});

// 代理入口：浏览器统一用 POST，真正的 WebDAV 方法通过 X-Method 头传递
app.post('/proxy', async (req, res) => {
  const targetUrl = req.headers['x-target-url'];
  const realMethod = req.headers['x-method'] || 'GET';

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing X-Target-URL header' });
  }

  // 只转发必要的头到 WebDAV 服务器
  const fwdHeaders = {};
  if (req.headers.authorization)   fwdHeaders['Authorization']  = req.headers.authorization;
  if (req.headers['content-type'] && req.headers['content-type'] !== 'text/plain;charset=UTF-8')
    fwdHeaders['Content-Type'] = req.headers['content-type'];
  if (req.headers['depth'])        fwdHeaders['Depth']           = req.headers['depth'];

  try {
    const opts = { method: realMethod, headers: fwdHeaders };
    // 有 body 的方法才带 body
    if (['PUT', 'POST', 'PROPFIND', 'MKCOL'].includes(realMethod) && req.body && req.body.length > 0) {
      opts.body = req.body;
    }

    const upstream = await fetch(targetUrl, opts);
    const data = await upstream.arrayBuffer();

    // 转发上游的 Content-Type
    const ct = upstream.headers.get('content-type');
    if (ct) res.set('Content-Type', ct);

    res.status(upstream.status).send(Buffer.from(data));
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(502).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BenBenHome CORS Proxy listening on port ${PORT}`));
