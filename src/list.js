const CON_PATH = 'content/';

function getItems(listed) {
  const { objects, delimitedPrefixes } = listed;

  const folders = delimitedPrefixes.map((del) => {
    const pathArr = del.split('/');
    pathArr.splice(-1);
    const name = pathArr.pop();

    const parent = `/${pathArr.join('/')}`;
    return { parent, name, type: 'folder' };
  });

  const files = objects.reduce((acc, obj) => {
    const pathArr = obj.key.split('/');
    const filename = pathArr.pop();

    const parent = `/${pathArr.join('/')}`;
    const name = filename.split('.').shift();

    if (name) acc.push({ parent, name, type: 'file' });

    return acc;
  }, []);

  return [...folders, ...files];
}

export default async function getList(c, path) {
  const repl = path.replace('.1.json', '');
  const prefix = repl ? `${repl}/` : '';
  const opts = { prefix, delimiter: '/' };
  const listed = await c.env.DAS_BUCKET.list(opts);
  const items = getItems(listed);
  return c.json(items);
}