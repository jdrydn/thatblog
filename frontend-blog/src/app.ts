import express from 'express';
import { render } from '@thatblog/hyde';

import { site } from '@/backend/src/data';

export const app = express();

app.get('/', async (_req, res) => {
  try {
    const html = await render('default', 'home', {
      globals: {
        site,
      },
      variables: {
        site,
      },
    });

    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .set('Content-Type', 'text/plain')
      .send((err as Error).stack);
  }
});
