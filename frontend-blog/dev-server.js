import fs from 'fs'
import express from 'express'
import morgan from 'morgan'
import { createServer } from 'vite'

const port = process.env.PORT || 3000
const base = process.env.BASE || '/'

// Create http server
const app = express()

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  base,
})

app.use(vite.middlewares)

app.use(morgan('tiny'))

// Serve HTML
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    // Always read fresh template in development
    let template = fs.readFileSync('./index.html', 'utf-8')
    template = await vite.transformIndexHtml(url, template)

    /** @type {import('./src/entry-server.ts').render} */
    const { render } = (await vite.ssrLoadModule('/src/entry-server.tsx'))

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
