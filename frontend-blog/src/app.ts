import express, { type ErrorRequestHandler } from 'express';
import path from 'path';
import { render } from '@thatblog/hyde';

import { site } from '@/backend/src/data';

export const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(
    '/themes',
    express.static(path.resolve(__dirname, '../../themes'), {
      cacheControl: false,
      dotfiles: 'ignore',
      etag: false,
      extensions: false,
      index: false,
      lastModified: true,
      redirect: false,
    }),
  );
}

app.use((_req, res, next) => {
  res.locals = {
    site: {
      ...site,
      config: {
        ...site.config,
        origin: process.env.THATBLOG_URL_ORIGIN ?? site.config?.origin,
      },
    },
    rendered_at: new Date(),
  };

  next();
});

app.get('/', async (_req, res, next) => {
  try {
    const html = await render('default', 'home', {
      globals: {
        ...res.locals,
      },
      variables: {
        site,
      },
    });

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get('/example-post', async (_req, res, next) => {
  try {
    const html = await render('default', 'post', {
      globals: {
        ...res.locals,
      },
      variables: {
        site,
      },
    });

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use(([err, _req, res, _next]: Parameters<ErrorRequestHandler>) => {
  res
    .status(500)
    .set('Content-Type', 'text/plain')
    .send((err as Error).stack);
});
