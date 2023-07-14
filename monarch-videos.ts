import fs from 'fs';
import path from 'path';
import { askForPath, getFiles } from './utils/prompts';


const main = async function () {
  const dir = await askForPath('MP4 dir');
  const files = await getFiles('.mp4', dir);

  files.forEach((p2f, i) => {
    if (p2f.endsWith('- 01.mp4')) {
      fs.rmSync(p2f);
      return;
    }

    console.log(p2f);

    const match = p2f.match(/V1-([\d]{4})/);
    if (match) {
      const sn = match[1];
      const newFile = path.join(dir, `${sn}.mp4`);

      fs.renameSync(p2f, newFile);
      console.log(newFile);
    }
  });
}

main();
