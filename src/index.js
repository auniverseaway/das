import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import getList from './list.js';
import getFile from './file.js';

const app = new Hono();

app.use('/*', cors());

app.put('/*', async (c) => {
  const path = c.req.path.slice(1);
  const isPage = path.endsWith('.html');
  const key = isPage ? path : `${path}/.das`;
  const results = await c.env.DAS_BUCKET.put(key, c.req.body);

  const pathArr = path.split('/');
  let name = pathArr.pop();
  name = isPage ? name.split('.')[0] : name;

  pathArr.shift();
  const parent = `/${pathArr.join('/')}`;

  const type = isPage ? 'file' : 'folder';
  const item = { parent, name, type };

  return c.json(item);
});

app.get('/*', async (c) => {
  const path = c.req.path.slice(1);
  if (path.endsWith('.1.json')) return getList(c, path);
  return getFile(c, path);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
});

export default app;
