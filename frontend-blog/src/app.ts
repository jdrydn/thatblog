import express from 'express';

import { Liquid } from 'liquidjs';
import { fs } from '@thatblog/liquid-s3fs';

const engine = new Liquid({
  root: './themes/default',
  extname: '.liquid',
  fs,
});

export const app = express();

app.get('/', async (_req, res) => {
  try {
    const html = await engine.renderFile('home');
    res.status(200).set('Content-Type', 'text/html').send(html);
  } catch (err) {
    res.status(500).set('Content-Type', 'text/plain').send(err.stack);
  }
});
