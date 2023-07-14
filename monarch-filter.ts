import fs from 'fs';
import path from 'path';
import { askForPath, getFiles, getDirs } from './utils/prompts';


const main = async function () {
  const _ids: string[] = [];
  const _missed: string[] = [];

  const dir = await askForPath('group dir');
  const dirs = await getDirs(dir);

  dirs.forEach((p2dir, i) => {
    const files = fs.readdirSync(p2dir);
    files.forEach((file, j) => {
      const _id = path.basename(file, '.mp4');
      if (_id) _ids.push(_id);
    });
  });


  for (let i = 1; i <= 2100; i++) {
    const _id = i.toString().padStart(4, '0');
    if (!_ids.includes(_id)) {
      _missed.push(_id);
    }
  }

  console.log(`Missed ${_missed.length} .mp4 files...\n`);

  _missed.forEach((_id, i) => {
    console.log(`  - ${_id}`);
  });
}

main();
