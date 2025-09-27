import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';

import { exists, render } from '@thatblog/hyde';
import { createSlug, parseSlug } from '@thatblog/utils';
import { logger } from '@/backend-api/src/logger';

import * as data from '@/backend-api/src/data';

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

  console.log('locals', res.locals);

  next();
});

app.get('/', async (_req, res, next) => {
  try {
    const globals = {
      ...res.locals,
      pageType: 'HOME',
    };

    const variables = {
      posts: data.posts.map((post) => {
        let contentExcerpt: Array<data.Content> | undefined;
        if (Array.isArray(post.contents) && post.contentExcerptTo) {
          const i = post.contents.findIndex((c) => c.id === post.contentExcerptTo);
          if (i >= 0) {
            contentExcerpt = post.contents.slice(0, i + 1);
          }
        }

        return {
          ...post,
          slug: createSlug(post.id, post.title),
          contents: contentExcerpt ?? post.contents,
          readMore: typeof post.contentExcerptTo === 'string',
        };
      }),
      pagination: {
        hasPrevious: true,
        hasNext: true,
      },
    };

    console.log({
      globals,
      variables,
    });

    let html: string;

    if (await exists('default', 'home')) {
      html = await render('default', 'home', {
        globals,
        variables,
        minify: true,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals,
        variables,
        minify: true,
      });
    } else {
      throw new Error('Missing theme file for home');
    }

    console.log(html);

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get('/archive', async (_req, res, next) => {
  try {
    const globals = {
      ...res.locals,
      pageType: 'ARCHIVE',
    };

    const variables = {
      posts: data.posts.map((post) => {
        const [first] = post.contents ?? [];

        const excerpt = ((): string | undefined => {
          switch (first.type) {
            case 'PLAIN_TEXT':
              return first.value;
            default:
              return undefined;
          }
        })();

        return {
          ...post,
          slug: createSlug(post.id, post.title),
          excerpt,
          contents: undefined,
        };
      }),
    };

    let html: string;

    if (await exists('default', 'archive')) {
      html = await render('default', 'archive', {
        globals,
        variables,
        minify: true,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals,
        variables,
        minify: true,
      });
    } else {
      throw new Error('Missing theme file for home');
    }

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get(['/pages/:id([A-Za-z0-9]+)', '/pages/:slug([^-]+(?:-[^-]+)*)-:id([A-Za-z0-9]+)'], async (req, res, next) => {
  try {
    const pageId = req.params.id ? parseSlug(req.params.id) : undefined;
    if (!pageId) {
      return next();
    }

    const page = data.pages.find(({ id }) => pageId === id);
    if (!page) {
      return next();
    }

    const globals = {
      ...res.locals,
      pageType: 'PAGE',
    };

    const variables = {
      page: {
        slug: createSlug(page.id, page.title),
        ...page,
      },
    };

    let html: string;

    if (await exists('default', 'post')) {
      html = await render('default', 'post', {
        globals,
        variables,
        minify: true,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals,
        variables,
        minify: true,
      });
    } else {
      throw new Error('Missing theme file for post');
    }

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get(['/posts/:id([A-Za-z0-9]+)', '/posts/:slug([^-]+(?:-[^-]+)*)-:id([A-Za-z0-9]+)'], async (req, res, next) => {
  try {
    const postId = req.params.id ? parseSlug(req.params.id) : undefined;
    if (!postId) {
      return next();
    }

    const post = data.posts.find(({ id }) => postId === id);
    if (!post) {
      return next();
    }

    const globals = {
      ...res.locals,
      pageType: 'POST',
    };

    const variables = {
      post: {
        slug: createSlug(post.id, post.title),
        ...post,
      },
    };

    let html: string;

    if (await exists('default', 'post')) {
      html = await render('default', 'post', {
        globals,
        variables,
        minify: false,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals,
        variables,
        minify: false,
      });
    } else {
      throw new Error('Missing theme file for post');
    }

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use(async (req, res, next) => {
  try {
    console.log('Route not found:', req.method, req.url);

    const globals = {
      ...res.locals,
      pageType: 'ERROR',
    };
    const variables = {
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Page not found',
        statusCode: 404,
      },
    };

    let html: string;

    if (await exists('default', 'error')) {
      html = await render('default', 'error', {
        globals,
        variables,
        minify: true,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals,
        variables,
        minify: true,
      });
    } else {
      throw new Error('Route not found');
    }

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use(async (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  try {
    logger.error({ err });

    const { title, description, code, statusCode } = err as unknown as Record<string, unknown>;
    const variables = {
      error: {
        title,
        description: description ?? err.message,
        code,
        statusCode,
      },
    };

    let html: string;

    if (await exists('default', 'error')) {
      html = await render('default', 'error', {
        globals: { ...res.locals },
        variables,
        minify: true,
      });
    } else if (await exists('default', 'index')) {
      html = await render('default', 'index', {
        globals: {
          ...res.locals,
        },
        variables: {
          layout: 'ERROR',
          ...variables,
        },
        minify: true,
      });
    } else {
      throw new Error('Missing theme file for error page');
    }

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err2) {
    logger.error({ err: err2 });
    res
      .status(500)
      .set('Content-Type', 'text/plain')
      .send(err.stack + '\n\n' + (err2 as Error).stack);
  }
});
