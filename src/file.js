import { HTTPException } from 'hono/http-exception';

export default async function getFile(c, path) {
  const ext = path.split('/').pop().split('.')[1];
  const key = ext ? path : `${path}.html`;
  const obj = await c.env.DAS_BUCKET.get(key);
  if (obj) {
    const { contentType } = obj.httpMetadata;
    c.header('Content-Type', contentType);
    if (contentType === 'text/html') return c.html(obj.body);
    return c.body(obj.body);
  }
  throw new HTTPException(404, { message: 'Not found' });
}