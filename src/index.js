import { Hono } from 'hono';
import { cors } from 'hono/cors';

import getItems from './items.js';

const app = new Hono();

app.use('/*', cors());

app.get('/browse', async (c) => {
  const parent = c.req.query('pathname') || '';
  const prefix = parent === '/' ? 'content/' : `content${parent}/`;
  const opts = { prefix, delimiter: '/' };
  const listed = await c.env.DAS_BUCKET.list(opts);
  const items = getItems(listed);
  return c.json(items);
});

app.put('/content/*', async (c) => {
  const path = c.req.path.slice(1);
  const isFile = path.endsWith('.html');
  const key = isFile ? path : `${path}/.das`;
  const results = await c.env.DAS_BUCKET.put(key, c.req.body);

  const pathArr = path.split('/');
  const name = pathArr.pop();
  pathArr.shift();
  const parent = `/${pathArr.join('/')}`;

  const type = isFile ? 'file' : 'folder';
  const item = { parent, name, type };

  return c.json(item);
});

app.get('/edit/*', async (c) => {
  const { path } = c.req;
  const key = `content${path}.html`;
  const obj = await c.env.DAS_BUCKET.get(key);
  return c.html(obj.body);
});

export default app;
