import fs from 'fs';
import path from 'path';

const main = async function () {
  for (let i = 0; i < 2100; i++) {
    const f = path.join('./txt', `${String(i + 1).padStart(4, '0')}.txt`);
    fs.writeFileSync(f, 'Hue: HueName\nGeometry: GeometryName');
  }
}

main();
