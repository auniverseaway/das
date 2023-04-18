export default function getItems(listed) {
  const { objects, delimitedPrefixes } = listed;

  const folders = delimitedPrefixes.map((del) => {
    const pathArr = del.split('/');
    pathArr.splice(-1);
    const name = pathArr.pop();
    pathArr.shift();
    const parent = `/${pathArr.join('/')}`;
    return { parent, name, type: 'folder' };
  });

  const files = objects.reduce((acc, obj) => {
    console.log(obj);
    const pathArr = obj.key.split('/');
    const filename = pathArr.pop();

    pathArr.shift();
    const parent = `/${pathArr.join('/')}`;
    const name = filename.split('.').shift();

    if (name) acc.push({ parent, name, type: 'file' });

    return acc;
  }, []);

  return [...folders, ...files];
}