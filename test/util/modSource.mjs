import fs from 'fs';
import path from 'path';

function sleep(ms) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, ms);
  });
}

const pathToIndexHTML = path.join('src', 'index.html');
await sleep(2000);
fs.appendFileSync(pathToIndexHTML,  '<!-- test -->', { encoding: 'utf-8' });
const pathIsNewSCSS = path.join('src', 'themes', 'themestable', 'new.scss');
fs.writeFileSync(pathIsNewSCSS, "// scss");
