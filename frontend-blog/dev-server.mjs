import express from 'express';
import fs from 'fs/promises';
import { createServer } from 'vite';

const app = express();

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  base: '/',
});

app.use(vite.middlewares)

app.get('*', async (req, res) => {
  try {
    const url = req.originalUrl;

    // Always read fresh template in development
    let template = await fs.readFile('./index.html', 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '');

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e);
    res.status(500).end(e.stack);
  }
});

// Start http server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started at http://localhost:${process.env.PORT || 3000}`);
});
