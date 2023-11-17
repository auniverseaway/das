import { Hono } from 'hono';
import { cors } from 'hono/cors';

import getItems from './items.js';

const app = new Hono();

app.use('/*', cors());

app.get('/api/list', async (c) => {
  const parent = c.req.query('pathname') || '';
  const prefix = parent === '/' ? 'content/' : `content${parent}/`;
  const opts = { prefix, delimiter: '/' };
  const listed = await c.env.DAS_BUCKET.list(opts);
  const items = getItems(listed);
  return c.json(items);
});

app.get('/api/version', async (c) => {
  const key = `content/test.html`;
  const opts = { versions: true };
  const obj = await c.env.DAS_BUCKET.get(key, opts);
  return c.json(obj);
});

app.put('/content/*', async (c) => {
  const path = c.req.path.slice(1);
  const isFile = path.endsWith('.html');
  const key = isFile ? path : `${path}/.das`;
  const results = await c.env.DAS_BUCKET.put(key, c.req.body);

  const pathArr = path.split('/');
  let name = pathArr.pop();
  name = isFile ? name.split('.')[0] : name;

  pathArr.shift();
  const parent = `/${pathArr.join('/')}`;

  const type = isFile ? 'file' : 'folder';
  const item = { parent, name, type };

  return c.json(item);
});

app.get('/*', async (c) => {
  const { path } = c.req;
  const ext = path.split('/').pop().split('.')[1];
  const key = ext ? `content${path}` : `content${path}.html`;
  const obj = await c.env.DAS_BUCKET.get(key);
  if (obj) {
    const { contentType } = obj.httpMetadata;
    c.header('Content-Type', contentType);
    if (contentType === 'text/html') return c.html(obj.body);
    return c.body(obj.body);
  }
  return c.html('');
});

export default app;
