import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import { exists, render } from '@thatblog/hyde';
import { createSlug, parseSlug } from '@thatblog/utils';

import * as data from '@/backend/src/data';

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
      ...data.site,
      config: {
        ...data.site.config,
        origin: process.env.THATBLOG_URL_ORIGIN ?? data.site.config?.origin,
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
        posts: Object.entries(data.posts).map(([postId, post]) => ({
          id: postId,
          slug: createSlug(postId, post.title),
          ...post,
        })),
      },
    });

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get('/post/:postSlug([^-]+(?:-[^-]+)*)-:postId([A-Za-z0-9]+)', async (req, res, next) => {
  try {
    const postId = req.params.postId ? parseSlug(req.params.postId) : undefined;
    if (!postId) {
      return next();
    }

    const post = data.posts[postId] ?? undefined;
    if (!post) {
      return next();
    }

    const html = await render('default', 'post', {
      globals: {
        ...res.locals,
      },
      variables: {
        post: {
          id: postId,
          slug: createSlug(postId, post.title),
          ...post,
        },
      },
    });

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use(async (_req, res, next) => {
  try {
    if (await exists('default', 'error')) {
      const html = await render('default', 'error', {
        globals: {
          ...res.locals,
        },
        variables: {
          error: {
            code: 'ERR_NOT_FOUND',
            message: 'Page not found',
            statusCode: 404,
          },
        },
      });

      res.status(200).set('Content-Type', 'text/html').send(html);
    } else if (await exists('default', 'index')) {
      const html = await render('default', 'index', {
        globals: {
          ...res.locals,
        },
        variables: {
          error: {
            code: 'ERR_NOT_FOUND',
            message: 'Page not found',
            statusCode: 404,
          },
        },
      });

      res.status(200).set('Content-Type', 'text/html').send(html);
    } else {
      res.status(200).set('Content-Type', 'text/plain').send('Route not found');
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  res.status(500).set('Content-Type', 'text/plain').send(err.stack);
});
