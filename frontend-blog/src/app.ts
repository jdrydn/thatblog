import express from 'express';

export const app = express();

app.get('/', (_req, res) => {
  res.status(200).send('Hello, world!');
});
